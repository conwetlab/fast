from django.conf import settings
from django.utils import simplejson
from django.http import HttpResponse, HttpResponseServerError, Http404
from django.shortcuts import get_object_or_404, get_list_or_404
from django.db import transaction
from gadgetEzweb import getEzWebTemplate, getEzWebHTML
from commons import resource, unzip
from commons.utils import json_encode
from commons.authentication import get_user_authentication
from os import path, mkdir
import zipfile, shutil, tempfile, binascii
from python_rest_client.restful_lib import Connection, isValidResponse
from storage.models import Storage
from buildingblock.models import Screen, Screenflow, BuildingBlockCode

STORAGE_DIR = path.join(settings.BASEDIR, 'static')
STORAGE_GADGET_ZIP_NAME = 'gadget.zip'

class GadgetStorage(resource.Resource):
    def read(self, request):
        try:
            user = get_user_authentication(request)
            
            storage = []
            if request.GET.has_key('screenflow'):
                storage = get_list_or_404(Storage, screenflow=request.GET['screenflow'])
                
            return HttpResponse(json_encode(storage), mimetype='application/json; charset=UTF-8')
        except Http404:
            return HttpResponse(json_encode([]), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')


    @transaction.commit_on_success
    def create(self, request):
        try:
            user = get_user_authentication(request)
    
            gadgetData = self.__completeGadgetData(request)
            
            storage = Storage(name=gadgetData['name'], owner=gadgetData['vendor'], version=gadgetData['version'])
            
            self.__createGadget(gadgetData)
            
            self.__storeGadget(gadgetData)
            
            storage.gadgetURL = gadgetData['gadgetUri']
            storage.gadgetPath = gadgetData['gadgetRelativePath']
            storage.gadgetResource = gadgetData['gadgetResource']
            storage.screenflow = gadgetData['screenflow']
            storage.save()
            
            dict = {"id": None, "name": None, "screenflow_id": None, "owner": None,
                    "version" : None, "gadgetURL" : None, "creationDate": None}

            return HttpResponse(json_encode(storage, fields=dict), mimetype='application/json; charset=UTF-8')
        
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')
        
        
    def __getGadgetName(self, name, vendor, version):
        return ('-'.join([vendor, name, version])).replace(' ', '_')


    def __completeGadgetData(self, request):
        gadgetData = {}
        
        if request.POST.has_key('gadget'):
            json = simplejson.loads(request.POST['gadget'])
        else:
            raise Exception ('Gadget parameter expected in screenflow json')
        if (json.has_key('label')):
            gadgetData['label'] = json['label']
        else:
            gadgetData['label'] = {"en-gb": "FAST Gadget"}    
        if (json.has_key('vendor')):
            gadgetData['vendor'] = json['vendor']
        else:
            gadgetData['vendor'] = "Morfeo"               
        if (json.has_key('version')):
            gadgetData['version'] = json['version']
        else:
            gadgetData['version'] = "1.0"
        if (json.has_key('description')):
            gadgetData['description'] = json['description']
        else:
            gadgetData['description'] = {"en-gb": "Write the description here..."}
        if (json.has_key('email')):
            gadgetData['email'] = json['email']
        else:
            gadgetData['email'] = "author@email.com"
        if (json.has_key('creator')):
            gadgetData['creator'] = json['creator']
        else:
            gadgetData['creator'] = "Creator"
            
        gadgetData['name'] = gadgetData['label']['en-gb']
            
        scrf = get_object_or_404(Screenflow, id=request.POST['screenflow'])
        gadgetData['screenflow'] = scrf
        screenflow = simplejson.loads(scrf.data)
        
        definition = screenflow['definition']
        gadgetData['screens'] = []
        if (definition.has_key('screens')):
            scrs=definition['screens']
            for screen in scrs:
                screen = get_object_or_404(Screen, uri=screen['uri'])
                screen = simplejson.loads(screen.data)
                aux = screen['label']
                screen['label'] = aux['en-gb']
                screen['allCode'] = BuildingBlockCode.objects.get(buildingBlock=screen['id']).code
                gadgetData['screens'].append(screen)
                
        gadgetData['prec'] = []
        if (definition.has_key('preconditions')):
            gadgetData['prec'] = definition['preconditions']
        gadgetData['post'] = []    
        
        if (definition.has_key('postconditions')):
            gadgetData['post'] = definition['postconditions']
        
        gadgetName = self.__getGadgetName(gadgetData['name'], gadgetData['vendor'], gadgetData['version'])
        gadgetData['gadgetName'] = gadgetName
        
        gadgetData['gadgetResource'] = None
        if isLocalStorage():
            base_uri = request.build_absolute_uri('/static')     
            gadgetData['gadgetUri'] =  '/'.join([base_uri, gadgetName])
        else:
            conn = Connection(settings.STORAGE_URL)
            body = {'GadgetName': gadgetData['name'],'Owner': gadgetData['vendor'],'Version': gadgetData['version']}
            result = conn.request_post(resource='/gadgets/metadata', body=json_encode(body) , headers={'Accept':'application/json', 'Content-Type': 'application/json'})
            if not isValidResponse(result):
                raise Exception(result['body'])
            data = simplejson.loads(result['body'])
            gadgetData['gadgetUri'] = data['GadgetLocationURL']
            gadgetData['gadgetResource'] = data['ServiceGadgetUri']
            gadgetData['gadgetDataUri'] = data['GadgetDataUri']
        
        return gadgetData


    def __createGadget(self, gadgetData):
        gadgetRelativePath = gadgetData['gadgetName']
        gadgetPath = path.join(STORAGE_DIR, gadgetRelativePath)
        if (not path.isdir(gadgetPath)):
            mkdir(gadgetPath)
        else:
            raise Exception ('Gadget already exists')      
        
        origin = path.join(STORAGE_DIR, STORAGE_GADGET_ZIP_NAME)
        gadgetZipFileName = path.join(gadgetPath, STORAGE_GADGET_ZIP_NAME)
        shutil.copyfile (origin, gadgetZipFileName)
        
        zipFile = zipfile.ZipFile(gadgetZipFileName,'a')
        
        directory_name = tempfile.mkdtemp(dir=gadgetPath)
        
        #EzWeb
        ezWebTemplate = getEzWebTemplate(gadgetData)
        ezWebTemplateFile = open (path.join(directory_name, 'ezweb.xml'), 'w')
        ezWebTemplateFile.write(ezWebTemplate)
        ezWebTemplateFile.close()
        zipFile.write(ezWebTemplateFile.name,'./ezweb.xml')
        
        ezWebHTML = getEzWebHTML(gadgetData)
        ezWebHTMLFile = open (path.join(directory_name, 'ezweb.html'), 'w')
        ezWebHTMLFile.write (ezWebHTML)
        ezWebHTMLFile.close()
        zipFile.write(ezWebHTMLFile.name,'./ezweb.html')
        
        shutil.rmtree(directory_name)
        zipFile.close()
        
        gadgetData['gadgetRelativePath'] = gadgetRelativePath
        gadgetData['gadgetPath'] = gadgetPath
        gadgetData['gadgetZipFileName'] = gadgetZipFileName
    
    
    def __storeGadget(self, gadgetData):
        #Remote Storage
        if gadgetData.has_key('gadgetDataUri'):
            conn = Connection(gadgetData['gadgetDataUri'])
            if settings.STORAGE_FORMAT == 'base64string':
                f = open(gadgetData['gadgetZipFileName'], "rb")
                data = f.read()
                f.close()
                data = binascii.b2a_base64(data)
                format = settings.STORAGE_FORMAT
            else:
                data = '/'.join([gadgetData['gadgetUri'], STORAGE_GADGET_ZIP_NAME])
                format = 'URL'
            body = {"Data":data,"DataType":format}
            result = conn.request_post(resource='', body=json_encode(body) , headers={'Accept':'application/json', 'Content-Type': 'application/json'})
            if not isValidResponse(result):
                raise Exception(result['body']) 
        #Local Storage
        else:
            un = unzip.unzip()
            un.extract(gadgetData['gadgetZipFileName'], gadgetData['gadgetPath'])
        


class StorageEntry(resource.Resource):
    def read(self, request, storage_id):
        user = get_user_authentication(request)
        
        st = get_object_or_404(Storage, id=storage_id)
        return HttpResponse(json_encode(st), mimetype='application/json; charset=UTF-8')
    
    
    @transaction.commit_on_success
    def delete(self, request, storage_id):
        try:
            user = get_user_authentication(request)
            
            storage = Storage.objects.get(id=storage_id)
            gadgetPath = path.join(STORAGE_DIR, storage.gadgetPath)
            
            storage.delete()
            
            if storage.gadgetResource != None:
                conn = Connection(storage.gadgetResource)
                result = conn.request_delete(resource='', headers={'Accept':'application/json'})
                if not isValidResponse(result):
                    raise Exception(result['body'])
                            
            try:
                shutil.rmtree(gadgetPath)
            except Exception, ex:
                pass
            
            ok = json_encode({"message":"OK"})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')
        
        
        
def isLocalStorage():
    if settings.STORAGE_URL == None or settings.STORAGE_URL=='':
        return True
    return False