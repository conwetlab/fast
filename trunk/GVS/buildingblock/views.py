from __future__ import division
from commons.authentication import get_user_authentication
from django.db import transaction
from django.core import serializers
from django.http import HttpResponse, HttpResponseServerError, Http404, HttpResponseBadRequest
from django.utils import simplejson
from django.utils.translation import ugettext as _
from django.shortcuts import get_list_or_404, get_object_or_404
from django.template import Template, Context, loader
from urllib2 import HTTPError
from urllib import quote_plus
from commons import resource
from commons.utils import json_encode, cleanUrl
from commons.httpUtils import PUT_parameter, validate_url, download_http_content
from python_rest_client.restful_lib import Connection, isValidResponse
from buildingblock.models import BuildingBlock, Screenflow, Screen, Form, Operator, Resource, BuildingBlockCode, UserVote, UserTag, Tag
from utils import *
from datetime import datetime

class BuildingBlockCollection(resource.Resource):
    def read(self, request, bbtype):
        try:
            user = get_user_authentication(request)
            
            bb = []
            if bbtype == 'screenflow':
                bb = get_list_or_404(Screenflow, author=user)
            elif bbtype == 'screen':
                bb = get_list_or_404(Screen, author=user)
            elif bbtype == 'form':
                bb = get_list_or_404(Form, author=user)
            elif bbtype == 'operator':
                bb = get_list_or_404(Operator, author=user)
            elif bbtype == 'resource':
                bb = get_list_or_404(Resource, author=user)
            else:
                bb = get_list_or_404(BuildingBlock, author=user)
                
            list = []
            for element in bb:
                list.append(element.data)
            response = ','.join(list)
            
            return HttpResponse('[%s]' % response, mimetype='application/json; charset=UTF-8')
        except Http404:
            return HttpResponse(json_encode([]), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')   
    
    
    @transaction.commit_on_success
    def create(self, request, bbtype):
        user = get_user_authentication(request)
        if not request.POST.has_key('buildingblock'):
            return HttpResponseBadRequest(json_encode({"message":"JSON expected"}), mimetype='application/json; charset=UTF-8')
        received_json = request.POST['buildingblock']

        try:
            data = simplejson.loads(received_json)

            now = datetime.utcnow()
            # Drop microseconds
            now = datetime(now.year, now.month, now.day, now.hour, now.minute, now.second)

            data['creationDate'] = now.isoformat() + "+0000" #UTC
            if data.get('version') == '':
                data['version'] = now.strftime("%Y%m%d-%H%M")

            bb = None
            if bbtype == 'screenflow':
                bb = Screenflow(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            elif bbtype == 'screen':
                bb = Screen(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            elif bbtype == 'form':
                bb = Form(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            elif bbtype == 'operator':
                bb = Operator(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            elif bbtype == 'resource':
                bb = Resource(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            else:
                raise Exception(_('Expecting building block type.'))

            bb.creationDate = now
            bb.save()
            
            tags = data.get('tags')
            updateTags(user, bb, tags)
            data['creator'] = user.username
            data['id'] = bb.pk
            data['type'] = bbtype

            bb.data = json_encode(data)
            bb.save()
            
            return HttpResponse(bb.data, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')   

class BuildingBlockCollectionSearch(resource.Resource):

    """
    Request body must be a json document containing a search query. The root
    element of the json document must be a hash containing a query attribute.
    This "query" attribute is defined in the same way operands are defined.

    An operands is a hash containing, at least, a type attribute. Other
    attributes may be required depending on the value of the type atribute.

    The value of the type attribute can be:
        * "or" or "and": This will evaluate a list of operands using a "or" or
        an "and" operator. This type of operand requires a "operands" field with
        the list of operands to use.
        * "field": Test that a field complains some condition. When using this
        operand type you must provide three more attributes:
            * "field": Field name.
            * "condition":
                * "is": full match (case sensitive) with the provided value.
                * "contains": for testing if the field contains the provided
                  value (case insensitive).
                * "less" or "greater" tests if a given field is "less" or
                  "greater" than the value provided.
            * "value": Value used to compare.

    The optional "field" attribute can be used to indicate what fields are your
    interesed in. If there is not "field" attribute, search service will return
    all fields of building blocks.

    If you like to retreive the result set sorted by some field or fields, you
    can make use of the "orderby" attribute. This attribute must contain a list
    of fields, listed in order or preference. You can prefix a field name with a
    "-" sign to indicate that you like to use descending order.

    You can also specify a limit or/and an offset attributes (this attributes
    are optionals). "limit" limits the number of elements returned and "offset"
    setups the first element to return.

    Basic example:
    {
       "query": {
            "type":      "field",
            "condition": "contains",
            "field":     "name",
            "value":     "amazon"
       }
    }

    Another, more complete, example:
    {
       "query": {
          "type":"and",
          "operands": [
             {
                "type":      "field",
                "condition": "contains",
                "field":     "name",
                "value":     "amazon"
             },
             {
                "type":      "field",
                "condition": "contains",
                "field":     "name",
                "value":     "order"
             }
          ]
       },
       "fields": [
         "name"
       ],
       "orderby": ["-creationDate"],
       "limit":  3,
       "offset": 1
    }
    """
    def create(self, request, bbtype):
        user = get_user_authentication(request)

        try:
            data = simplejson.loads(request.raw_post_data)
        except Exception, e:
            msg = 'Error parsing request json: %(errorMsg)s' % {'errorMsg': e.message}
            return HttpResponseBadRequest(json_encode({"message": msg}), mimetype='application/json; charset=UTF-8')

        try:
            info_fields = ["name", "version", "data", "popularity", "uri", "author_username"]

            if bbtype == "screenflow":
                q = Screenflow.objects.filter(author=user, type=bbtype)
            elif bbtype == "screen":
                q = Screen.objects.filter(author=user, type=bbtype)
            elif bbtype == "form":
                q = Form.objects.filter(author=user, type=bbtype)
            elif bbtype == "operator":
                q = Operator.objects.filter(author=user, type=bbtype)
            elif bbtype == "resource":
                q = Resource.objects.filter(author=user, type=bbtype)
            else:
                raise Exception(_('Expecting building block type.'))

            if not data.has_key('query'):
                msg = 'The required attribute "qurery" is empty'
                return HttpResponseBadRequest(json_encode({"message": msg}), mimetype='application/json; charset=UTF-8')

            query = data['query']

            q = q.filter(proccess_filter_operand(query))

            if data.has_key('orderby'):
                for field in data['orderby']:
                    q = q.order_by(field)

            offset = 0
            if data.has_key('offset'):
                offset = data['offset']

            limit = None
            if data.has_key('limit'):
                limit = offset + data['limit']

            q = q[offset:limit]


            if data.has_key('fields'):
                info_fields = data['fields']
                for field in info_fields:
                    if is_blacklisted_field(field):
                        msg = 'Invalid fields in "fields" attribute: %(field)s' % {'field': field}
                        return HttpResponseBadRequest(json_encode({"message": msg}))

            response = []
            for bb in q:
                info = {}

                for field in info_fields:
                    info[field] = get_info_field(bb, field)

                response.append(info)

            return HttpResponse(json_encode(response), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            msg = "[%(exception)s] %(errorMsg)s" % {'errorMsg': e.message, 'exception': e.__class__.__name__}
            return HttpResponseServerError(json_encode({"message": msg}), mimetype='application/json; charset=UTF-8')


class BuildingBlockEntry(resource.Resource):
    def read(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        bb = get_object_or_404(BuildingBlock, id=buildingblock_id)
        return HttpResponse(bb.data, mimetype='application/json; charset=UTF-8')
    
    
    @transaction.commit_on_success
    def update(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        received_json = PUT_parameter(request, 'buildingblock')
        if not received_json:
            return HttpResponseBadRequest(json_encode({"message":"JSON expected"}), mimetype='application/json; charset=UTF-8')

        try:
            data = simplejson.loads(received_json)
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            
            bb.data = received_json    
            bb.save()
            
            updateCatalogueBuildingBlock(bb)

            return HttpResponse(json_encode(bb.data), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')   


    @transaction.commit_on_success
    def delete(self, request, buildingblock_id):
        try:
            user = get_user_authentication(request)
            
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            
            unshareBuildingBlock(bb)
            
            bb.delete()
            
            ok = json_encode({'message':'OK'})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')
        
        
        
class Code(resource.Resource):
    def read(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        bbc = get_object_or_404(BuildingBlockCode, buildingBlock=buildingblock_id)
        return HttpResponse(bbc.code, mimetype='application/json; charset=UTF-8')
    
    
    
class TagCollection(resource.Resource):
    def read(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        try:
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            
            all = []
            userTags = []
            try:
                tags = UserTag.objects.filter(buildingBlock=bb)
                for t in tags:
                    all.append(self.__getTagFromUserTag(t));
                tags = tags.filter(user=user)
                for t in tags:
                    userTags.append(self.__getTagFromUserTag(t));
            except UserTag.DoesNotExist:
               pass
            
            tags = {'all_tags': all,
                    'user_tags': userTags}
            
            return HttpResponse(json_encode(tags), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')
       
        
    @transaction.commit_on_success
    def create(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        received_json = PUT_parameter(request, 'tags')
        if not received_json:
            return HttpResponseBadRequest(json_encode({"message":"JSON expected"}), mimetype='application/json; charset=UTF-8')

        try:
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            
            try:
                UserTag.objects.filter(user=user, buildingBlock=bb).delete()
            except UserTag.DoesNotExist:
               pass
            
            tags = simplejson.loads(received_json)
            updateTags(user, bb, tags)
            
            data = simplejson.loads(bb.data)
            allTags = UserTag.objects.filter(buildingBlock=bb)
            bbTags = []
            for t in allTags:
                bbTags.append(self.__getTagFromUserTag(t));
            data['tags'] = bbTags
            bb.data = json_encode(data)
            bb.save()
            
            updateCatalogueBuildingBlock(bb)
            
            ok = json_encode({'message':'OK'})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')
        
    def __getTagFromUserTag(self, t):
        tag = {'label': {t.tag.language: t.tag.name}}
        if t.tag.means:
            tag['means'] = t.tag.means
        return tag
        
class VoteCollection(resource.Resource):
    def read(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        try:
            bb = BuildingBlock.objects.get(id=buildingblock_id) 
            
            vote_number = 0
            user_vote = 0
            try:
                votes = UserVote.objects.filter(buildingBlock=bb)
                vote_number = votes.count()
                vote = votes.filter(user=user)[0]
                user_vote = vote.value
            except UserVote.DoesNotExist:
                pass

            vote = {
                    'popularity': bb.popularity,
                    'user_vote': user_vote,
                    'vote_number': vote_number
                    }
            
            return HttpResponse(json_encode(vote), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')
        
        
    @transaction.commit_on_success
    def create(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        if not request.POST.has_key('vote'):
            return HttpResponseBadRequest(json_encode({"message":"vote expected"}), mimetype='application/json; charset=UTF-8')

        try:
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            uv = UserVote.objects.get_or_create(user=user, buildingBlock=bb)[0]
            uv.value = request.POST.get('vote')
            uv.save()
            self.__updatePopularity(bb)
            updateCatalogueBuildingBlock(bb)
            ok = json_encode({'message':'OK'})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')
        
    def __updatePopularity(self, buildingblock):
        sum = 0
        count = 0
        try:
            votes = UserVote.objects.filter(buildingBlock=buildingblock)
            for v in votes:
                sum += v.value
                count += 1
        except Exception:
            pass
        buildingblock.popularity = '%1.2f' % (sum / count)
        data = simplejson.loads(buildingblock.data)
        data['popularity'] = buildingblock.popularity
        buildingblock.data = json_encode(data)
        buildingblock.save()



class Sharing(resource.Resource):
    @transaction.commit_on_success
    def create(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        try:
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            
            data = simplejson.loads(bb.data)
                            
            self.__updateCode(bb, data)
            
            if (bb.uri == None) or (bb.uri == ''):
                conn = Connection(cleanUrl(bb.get_catalogue_url()))
                body = bb.data
                result = conn.request_post('', body=body, headers={'Accept':'text/json'})
                if isValidResponse(result):
                    response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
                    bb.data = response.content
                    obj = simplejson.loads(response.content)
                    bb.uri = obj['uri']
                    bb.save()
                else:
                    raise Exception(result['body'])
            else:
                conn = Connection(bb.uri)
                result = conn.request_put('', body=bb.data, headers={'Accept':'text/json'})
                if isValidResponse(result):
                    response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
                else:
                    raise Exception(result['body'])
                
            return response
        except HTTPError, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':_('Unable to access code: %s') % unicode(e)}), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')
        
        
    @transaction.commit_on_success
    def delete(self, request, buildingblock_id):
        try:
            user = get_user_authentication(request)
            
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            
            unshareBuildingBlock(bb)
            
            data = simplejson.loads(bb.data)
            del data['uri']
            bb.uri = None
            bb.data = json_encode(data)
            bb.save()
                            
            ok = json_encode({'message':'OK'})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({'message':unicode(e)}), mimetype='application/json; charset=UTF-8')            
        
        
    def __updateCode(self, buildingblock, data): 
        c = BuildingBlockCode.objects.get_or_create(buildingBlock=buildingblock)[0]
        code = None
        if data.has_key('code'):
            code = data.get('code')
            if (validate_url(code)):
                code = download_http_content(code)
            if buildingblock.type == 'screen':
                context = Context({'screenId': str(buildingblock.id)})
                t = Template(code)
                code =  t.render(context)
            elif buildingblock.type == 'resource' or buildingblock.type == 'operator':
                context = Context({'name': 'BB' + str(buildingblock.id), 'code': code})
                t = loader.get_template('buildingblock/code.js')
                code =  t.render(context)
        elif data.has_key('definition') and buildingblock.type == 'screen':
            definition = data.get('definition')
            for bbdefinition in definition['buildingblocks']:
                bb = get_object_or_404(BuildingBlock, uri=bbdefinition.get('uri'))
                bbdata = simplejson.loads(bb.data)
                bbdefinition['buildingblockId'] = bb.id
                bbdefinition['type'] = bb.type
                bbdefinition['libraries'] = bbdata.get('libraries')
                bbdefinition['actions'] = bbdata.get('actions')
                bbc = get_object_or_404(BuildingBlockCode, buildingBlock=bb)
                if bb.type == 'form':
                    context = Context({'buildingblockId': 'BB' + str(bb.id), 'screenId': str(buildingblock.id), 'buildingblockInstance': bbdefinition['id']})
                    t = Template(bbc.code)
                    bbdefinition['code'] = t.render(context)
                else:
                    bbdefinition['code'] = bbc.code
            context = Context({'id': buildingblock.id, 'name': buildingblock.name, 'definition': definition, 'pres': data.get('preconditions'), 'posts': data.get('postconditions')})
            t = loader.get_template('buildingblock/screen.html')
            code =  t.render(context)
        c.code = code
        c.save()

        
def updateCatalogueBuildingBlock(buildingblock):
    if (buildingblock.uri != None) and (buildingblock.uri != ''):
        conn = Connection(buildingblock.uri)
        result = conn.request_put('', body=buildingblock.data, headers={'Accept':'text/json'})
        if not isValidResponse(result):
            raise Exception(result['body'])


def unshareBuildingBlock(buildingblock):
    if (buildingblock.uri != None) and (buildingblock.uri != ''):
        conn = Connection(buildingblock.uri)
        result = conn.request_delete('', headers={'Accept':'text/json'})
        if not isValidResponse(result):
            raise Exception(result['body'])
    

def updateTags(user, buildingblock, tags): 
    for tag in tags:
        label = tag.get('label')
        means = None
        if tag.has_key('means'):
            means = tag.get('means')    
        for lang in label.keys():
            t = Tag.objects.get_or_create(name=label.get(lang), language=lang, means=means)[0]
            usertag = UserTag.objects.get_or_create (user=user, tag=t, buildingBlock=buildingblock)[0]
            usertag.save()
            
