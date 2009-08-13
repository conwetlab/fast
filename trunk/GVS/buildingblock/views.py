from __future__ import division
from commons.authentication import get_user_authentication
from django.db import transaction
from django.core import serializers
from django.http import HttpResponse, HttpResponseServerError, Http404, HttpResponseBadRequest
from django.utils import simplejson
from django.shortcuts import get_list_or_404, get_object_or_404
from commons import resource
from commons.utils import json_encode
from commons.httpUtils import PUT_parameter
from buildingblock.models import BuildingBlock, Screenflow, Screen, Form, Operator, Resource, BuildingBlockCode, UserVote, UserTag, Tag

class BuildingBlockCollection(resource.Resource):
    def read(self, request, bbtype):
        try:
            user = get_user_authentication(request)
            
            bb = None
            if bbtype == "screenflow":
                bb = get_list_or_404(Screenflow, author=user)
            elif bbtype == "screen":
                bb = get_list_or_404(Screen, author=user)
            elif bbtype == "form":
                bb = get_list_or_404(Form, author=user)
            elif bbtype == "operator":
                bb = get_list_or_404(Operator, author=user)
            elif bbtype == "resource":
                bb = get_list_or_404(Resource, author=user)
            else:
                bb = get_list_or_404(BuildingBlock, author=user)
            
            return HttpResponse(json_encode(bb), mimetype='application/json; charset=UTF-8')
        except Http404:
            return HttpResponse(json_encode([]), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')   
    
    @transaction.commit_on_success
    def create(self, request, bbtype):
        user = get_user_authentication(request)
        if not request.POST.has_key('buildingblock'):
            return HttpResponseBadRequest(json_encode({"message":"JSON expected"}), mimetype='application/xml; charset=UTF-8')
        received_json = request.POST['buildingblock']

        try:
            data = simplejson.loads(received_json)
            
            bb = None
            if bbtype == "screenflow":
                bb = Screenflow(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            elif bbtype == "screen":
                bb = Screen(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            elif bbtype == "form":
                bb = Form(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            elif bbtype == "operator":
                bb = Operator(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            elif bbtype == "resource":
                bb = Resource(author=user, name=data.get('name'), version=data.get('version'), type=bbtype)
            else:
                raise Exception(_('Expecting building block type.'))
            
            bb.save()
            
            if data.has_key('domainContext'):
                tags = data.get('domainContext').get('tags')
                updateTags(user, bb, tags)
                
            if data.has_key('code'):
                c = BuildingBlockCode(buildingBlock=bb, code=data.get('code'))
                c.save()
                
            data['id'] = bb.pk
            data['type'] = bbtype   
            bb.data = json_encode(data)
            bb.save()
            
            return HttpResponse(json_encode(bb.data), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')   


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
            return HttpResponseBadRequest(json_encode({"message":"JSON expected"}), mimetype='application/xml; charset=UTF-8')

        try:
            data = simplejson.loads(received_json)
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            
            if data.has_key('code'):
                c = BuildingBlockCode.objects.get_or_create(buildingBlock=bb)[0]
                c.code = data.get('code')
                c.save()
            
            bb.data = received_json    
            bb.save()
            
            UserTag.objects.filter(user=user, buildingBlock=bb).delete()
            if data.has_key('domainContext'):
                tags = data.get('domainContext').get('tags')
                updateTags(user, bb, tags)
            return HttpResponse(json_encode(bb.data), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')   

    @transaction.commit_on_success
    def delete(self, request, buildingblock_id):
        try:
            user = get_user_authentication(request)
            
            BuildingBlock.objects.get(id=buildingblock_id).delete()
            ok = json_encode({"message":"OK"})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')
        
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
                    all.append(t.tag.name);
                tags = tags.filter(user=user)
                for t in tags:
                    userTags.append(t.tag.name)
            except UserTag.DoesNotExist:
               pass
            
            tags = {"all_tags": all,
                    "user_tags": userTags}
            
            return HttpResponse(json_encode(tags), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')
        
    @transaction.commit_on_success
    def create(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        received_json = PUT_parameter(request, 'tags')
        if not received_json:
            return HttpResponseBadRequest(json_encode({"message":"JSON expected"}), mimetype='application/xml; charset=UTF-8')

        try:
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            
            try:
                UserTag.objects.filter(user=user, buildingBlock=bb).delete()
            except UserTag.DoesNotExist:
               pass
            
            tags = simplejson.loads(received_json)
            updateTags(user, bb, tags)
            
            ok = json_encode({"message":"OK"})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')
        
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
                    "popularity": bb.popularity,
                    "user_vote": user_vote,
                    "vote_number": vote_number
                    }
            
            return HttpResponse(json_encode(vote), mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')
        
    @transaction.commit_on_success
    def create(self, request, buildingblock_id):
        user = get_user_authentication(request)
        
        if not request.POST.has_key('vote'):
            return HttpResponseBadRequest(json_encode({"message":"vote expected"}), mimetype='application/xml; charset=UTF-8')

        try:
            bb = BuildingBlock.objects.get(id=buildingblock_id)
            uv = UserVote.objects.get_or_create(user=user, buildingBlock=bb)[0]
            uv.value = request.POST.get('vote')
            uv.save()
            updatePopularity(bb)
            ok = json_encode({"message":"OK"})
            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')
        except Exception, e:
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')
        
def updatePopularity(buildingblock):
    sum = 0
    count = 0
    try:
        votes = UserVote.objects.filter(buildingBlock=buildingblock)
        for v in votes:
            sum += v.value
            count += 1
    except Exception:
        pass
    buildingblock.popularity = "%1.2f" % (sum / count)
    buildingblock.save()

        
def updateTags(user, buildingblock, tags): 
    for tag in tags:
        t = Tag.objects.get_or_create(name=tag)[0]
        usertag = UserTag (user=user, tag=t, buildingBlock=buildingblock)
        usertag.save()