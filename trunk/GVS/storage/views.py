from django.conf import settings
from django.utils import simplejson
from django.http import HttpResponse, HttpResponseServerError, Http404
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db import transaction
from gadget import getEzWebTemplate, getEzWebHTML, getGoogleTemplate, getPlayerHTML, getUnboundHTML
from commons import resource, unzip
from commons.utils import json_encode, valueOrDefault, valueOrEmpty, notEmptyValueOrDefault
from commons.authentication import get_user_authentication
from os import path, mkdir, remove
import zipfile, shutil, tempfile, binascii
from python_rest_client.restful_lib import Connection, isValidResponse
from storage.models import Storage
from buildingblock.models import Screen, Screenflow, BuildingBlockCode

STORAGE_DIR = path.join(settings.BASEDIR, 'static')
GADGET_ZIP_DIR = path.join(settings.BASEDIR, 'media/gadget')
API_DIR = 'js/fastAPI'
GADGET_API_DIR = path.join(GADGET_ZIP_DIR, API_DIR)
STORAGE_GADGET_ZIP_NAME = 'gadget.zip'

class GadgetStorage(resource.Resource):
    def read(self, request):
        try:
            user = get_user_authentication(request)

            storage = []
            if request.GET.has_key('screenflow'):
                storage = get_list_or_404(Storage, screenflow=request.GET['screenflow'])
            else:
                storage = get_list_or_404(Storage, screenflow__author=user)

            list = []
            for element in storage:
                try:
                    list.append(simplejson.loads(element.data))
                except Exception, e: # Not valid JSON
                    pass

            return HttpResponse(json_encode(list), mimetype='application/json; charset=UTF-8')
        except Http404:
            return HttpResponse(json_encode([]), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')


    @transaction.commit_on_success
    def create(self, request):
        try:
            user = get_user_authentication(request)


            gadgetData = self.__completeGadgetData(request)


            metadata = gadgetData['metadata']

            storage = Storage(name=metadata['name'],
                              owner=metadata['owner'],
                              version=metadata['version'],
                              screenflow = gadgetData['screenflow'])


            storage.save()


            self.__createResourceURI(request, metadata, storage)

            self.__createGadget(gadgetData, storage)

            self.__storeGadget(metadata)

            if not isLocalStorage():
                self.__setPlatformUrls(metadata)

            metadata['creationDate'] = storage.creationDate
            metadata['id'] = storage.pk
            storage.data = json_encode(metadata)
            storage.save()

            return HttpResponse(storage.data, mimetype='application/json; charset=UTF-8')

        except Exception, e:
            transaction.rollback()
            storage.delete()
            return HttpResponseServerError(unicode(e), mimetype='text/plain; charset=UTF-8')

    def __completeGadgetData(self, request):
        if request.POST.has_key('gadget'):
            json = simplejson.loads(request.POST['gadget'], encoding = 'utf-8')
        else:
            raise Exception ('Gadget parameter expected in screenflow json')

        gadgetData = getGadgetData(request.POST['screenflow'])

        metadata = gadgetData['metadata']
        #Gadget Data
        metadata['label'] = valueOrDefault(json, 'label', {'en-gb': 'FAST Gadget'})
        metadata['name'] = metadata['label']['en-gb']
        metadata['shortname'] =  valueOrDefault(json, 'shortname', 'FAST Gadget')
        metadata['owner'] =  notEmptyValueOrDefault(json, 'owner', 'Morfeo')
        metadata['vendor'] =  valueOrEmpty(json, 'vendor')
        metadata['version'] = notEmptyValueOrDefault(json, 'version', '1.0')
        metadata['description'] = valueOrDefault(json, 'description', {'en-gb': ''})
        metadata['description'] = metadata['description']['en-gb']
        metadata['imageURI'] = valueOrDefault(json, 'imageURI', 'http://demo.fast.morfeo-project.org/fast/images/FASTLogo.png')
        metadata['gadgetHomepage'] = valueOrEmpty(json, 'gadgetHomepage')
        metadata['height'] = valueOrEmpty(json, 'height')
        metadata['width'] = valueOrEmpty(json, 'width')
        metadata['persistent'] = valueOrDefault(json, 'persistent', 'false')[0].upper()=='T'
        #Author Data
        metadata['authorName'] =  valueOrEmpty(json, 'authorName')
        metadata['email'] = valueOrEmpty(json, 'email')
        metadata['authorHomepage'] = valueOrEmpty(json, 'authorHomepage')
        #Platforms
        metadata['platforms'] = valueOrDefault(json, 'platforms', [])

        return gadgetData

    def __createResourceURI(self, request, metadata, storage):
        metadata['gadgetResource'] = None
        if isLocalStorage():
            base_uri = request.build_absolute_uri('/static')
            metadata['gadgetUri'] =  '/'.join([base_uri, str(storage.pk)])
        else:
            conn = Connection(settings.STORAGE_URL)
            body = {
                'Owner': metadata['owner'],
                'Version': metadata['version'],
                'Author':{'AuthorName': metadata['authorName'],
                          'href': metadata['authorHomepage'],
                          'email': metadata['email']
                          },
                'Vendor':{'VendorName': metadata['vendor']},
                'GadgetMetadata':{'GadgetName': metadata['name'],
                                  'GadgetShortName': metadata['shortname'],
                                  'GadgetDescription': metadata['description'],
                                  'GadgetIcon': False,
                                  'GadgetIconUrl': metadata['imageURI']
                                  }
                }

            if metadata['height']!='':
                body['GadgetMetadata']['GadgetDefaultHeight'] = metadata['height']
            if metadata['width']!='':
                body['GadgetMetadata']['GadgetDefaultWidth'] = metadata['width']


            result = conn.request_post(resource='/gadgets/metadata', body=json_encode(body) , headers={'Accept':'application/json', 'Content-Type': 'application/json'})
            if not isValidResponse(result):
                raise Exception(result['body'])
            data = simplejson.loads(result['body'])
            metadata['gadgetUri'] = data['GadgetLocationURL']
            metadata['gadgetResource'] = data['ServiceGadgetUri']
            metadata['gadgetDataUri'] = data['GadgetDataUri']


    def __createGadget(self, gadgetData, storage):

        metadata = gadgetData['metadata']

        if metadata.has_key('platforms'):
            if (type(metadata['platforms']) is str) or (type(metadata['platforms']) is unicode):
                metadata['platforms'] = [str(metadata['platforms'])]
        else:
            raise Exception('Invalid destination platform list')

        gadgetRelativePath = str(storage.pk)
        gadgetPath = path.join(STORAGE_DIR, gadgetRelativePath)
        if (not path.isdir(gadgetPath)):
            mkdir(gadgetPath)
        else:
            raise Exception ('Gadget already exists')

        origin = path.join(GADGET_ZIP_DIR, STORAGE_GADGET_ZIP_NAME)
        gadgetZipFileName = path.join(gadgetPath, STORAGE_GADGET_ZIP_NAME)
        shutil.copyfile (origin, gadgetZipFileName)

        zipFile = zipfile.ZipFile(gadgetZipFileName,'a')

        directory_name = tempfile.mkdtemp(dir=gadgetPath)

        gadgets = {}
        for platform in metadata['platforms']:
            if platform == 'ezweb':
                templateFileName = str(platform + '.xml')
                htmlFileName = str('index_' + platform + '.html')
                ezWebTemplate = getEzWebTemplate(gadgetData)
                ezWebTemplateFile = open (path.join(directory_name, templateFileName), 'w')
                ezWebTemplateFile.write(ezWebTemplate.encode('utf-8'))
                ezWebTemplateFile.close()
                zipFile.write(ezWebTemplateFile.name, path.join('.', templateFileName))

                if isLocalStorage():
                    ezWebHTML = getEzWebHTML(gadgetData)
                    ezWebHTMLFile = open (path.join(directory_name, htmlFileName), 'w')
                    ezWebHTMLFile.write(ezWebHTML.encode('utf-8'))
                    ezWebHTMLFile.close()
                    zipFile.write(ezWebHTMLFile.name, path.join('.', htmlFileName))
                    gadgets[platform] = '/'.join([metadata['gadgetUri'],  templateFileName])

            elif platform == 'google':
                templateFileName = str(platform + '.xml')
                googleTemplate = getGoogleTemplate(gadgetData)
                googleTemplateFile = open (path.join(directory_name, templateFileName), 'w')
                googleTemplateFile.write(googleTemplate.encode('utf-8'))
                googleTemplateFile.close()
                zipFile.write(googleTemplateFile.name,path.join('.', templateFileName))
                gadgets[platform] = '/'.join([metadata['gadgetUri'], templateFileName])

            elif platform == 'player':
                if isLocalStorage():
                    htmlFileName = str(platform + '.html')
                    playerHTML = getPlayerHTML(gadgetData, metadata['gadgetUri'])
                    playerHTMLFile = open (path.join(directory_name, htmlFileName), 'w')
                    playerHTMLFile.write(playerHTML.encode('utf-8'))
                    playerHTMLFile.close()
                    zipFile.write(playerHTMLFile.name, path.join('.', htmlFileName))
                    gadgets[platform] = '/'.join([metadata['gadgetUri'], htmlFileName])

        if isLocalStorage():
            metadata['gadgets'] = gadgets
        else:
            htmlFileName = 'index.html'
            html = getUnboundHTML(gadgetData, metadata['gadgetUri'])
            htmlFile = open (path.join(directory_name, htmlFileName), 'w')
            htmlFile.write(html.encode('utf-8'))
            htmlFile.close()
            zipFile.write(htmlFile.name, path.join('.', htmlFileName))

        #Copying APIs
        for platform in metadata['platforms']:
            if platform != "beemboard":
                apiFileName = str('fastAPI_' + platform + '.js')
                zipFile.write(path.join(GADGET_API_DIR, apiFileName), path.join(API_DIR, apiFileName))

        shutil.rmtree(directory_name)
        zipFile.close()


        metadata['gadgetRelativePath'] = gadgetRelativePath

    def __storeGadget(self, gadgetMetaData):
        gadgetPath = path.join(STORAGE_DIR, gadgetMetaData['gadgetRelativePath'])
        gadgetZipFileName = path.join(gadgetPath, STORAGE_GADGET_ZIP_NAME)
        #Remote Storage
        if gadgetMetaData.has_key('gadgetDataUri'):
            conn = Connection(gadgetMetaData['gadgetDataUri'])
            if settings.STORAGE_FORMAT == 'base64string':
                f = open(gadgetZipFileName, 'rb')
                data = f.read()
                f.close()
                data = binascii.b2a_base64(data)
                format = settings.STORAGE_FORMAT
            else:
                data = '/'.join([gadgetMetaData['gadgetUri'], STORAGE_GADGET_ZIP_NAME])
                format = 'URL'
            body = {'Data':data,'DataType':format}
            result = conn.request_post(resource='', body=str(json_encode(body)), headers={'Accept':'application/json', 'Content-Type': 'application/json'})
            if not isValidResponse(result):
                raise Exception(result['body'])
        #Local Storage
        else:
            un = unzip.unzip()
            un.extract(gadgetZipFileName, gadgetPath)
            remove(gadgetZipFileName)

    def __setPlatformUrls(self, metadata):
        conn = Connection(metadata['gadgetResource'] + "/platform")
        body = {
            'PlatformName': ",".join(translate_to_service(metadata['platforms']))
        }
        result = conn.request_post(resource='', body=json_encode(body),
                                headers={'Accept': 'application/json',
                                'Content-Type': 'application/json'})
        if isValidResponse(result):
            gadgets = {}
            platform_list = simplejson.loads(result['body'])
            for platform in platform_list:
                gadgets[platform['PlatformName']]=platform['RedirectUri']
            metadata['gadgets'] = gadgets
        else:
            raise Exception(result['body'])


class StorageEntry(resource.Resource):
    def read(self, request, storage_id):
        user = get_user_authentication(request)

        st = get_object_or_404(Storage, id=storage_id)
        return HttpResponse(st.data, mimetype='application/json; charset=UTF-8')


    @transaction.commit_on_success
    def delete(self, request, storage_id):
        try:
            user = get_user_authentication(request)

            st = Storage.objects.get(id=storage_id)

            st.delete()

            ok = json_encode({'message':'OK'})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')


class GadgetPlayer(resource.Resource):
    def read(self, request):
        try:
            user = get_user_authentication(request)

            playerData = None

            if request.GET.has_key('screenflow') and not request.GET.has_key('screen'):
                playerData = getGadgetData(request.GET['screenflow'])
            elif request.GET.has_key('screen') and not request.GET.has_key('screenflow'):
                playerData = getScreenData(request.GET['screen'])
            else:
                raise Exception('Invalid URL')


            playerHTML = getPlayerHTML(playerData, '/'.join([settings.MEDIA_URL, 'gadget']))

            return HttpResponse(playerHTML, mimetype='text/html; charset=UTF-8')
        except Http404:
            return HttpResponseServerError(json_encode({"message": "Object not found"}), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')


def getScreenData(screenId):
    gadgetData = {'metadata':{}}
    gadgetData['screens'] = []
    scr = get_object_or_404(Screen, id=screenId)
    screen = simplejson.loads(scr.data)
    aux = screen['label']
    screen['label'] = aux['en-gb']
    screen['allCode'] = scr.compile_code().code
    gadgetData['screens'].append(screen)
    gadgetData['prec'] = []
    gadgetData['post'] = []
    return gadgetData

def getGadgetData(screenflowId):
    gadgetData = {'metadata':{}}
    scrf = get_object_or_404(Screenflow, id=screenflowId)
    gadgetData['screenflow'] = scrf
    screenflow = simplejson.loads(scrf.data)
    definition = screenflow['definition']
    gadgetData['screens'] = []
    if (definition.has_key('screens')):
        scrs = definition['screens']
        for screen in scrs:
            scr_obj = get_object_or_404(Screen, uri=screen['originalUri'])
            screen_data = simplejson.loads(scr_obj.data)
            screen_data['label'] = screen_data['label']['en-gb']
            if screen.has_key("title"):
                screen_data['title'] = screen['title']
            if screen.has_key("caption"):
                screen_data["caption"] = screen["caption"]
            screen_data['allCode'] = BuildingBlockCode.objects.get(buildingBlock=scr_obj).code
            gadgetData['screens'].append(screen_data)

    gadgetData['prec'] = definition['preconditions'] if definition.has_key('preconditions') else []
    gadgetData['post'] = definition['postconditions'] if definition.has_key('postconditions') else []
    return gadgetData


def isLocalStorage():
    if settings.STORAGE_URL == None or settings.STORAGE_URL=='':
        return True
    return False


def translate_to_service(platformList):
    result = []
    for platform in platformList:
        if platform == 'player':
            result.append('standalone')
        else:
            result.append(platform)
    return result
