# -*- coding: cp1252 -*-
from django.conf import settings
from django.utils import simplejson
from django.template import RequestContext, Template, Context, loader
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from django.db import transaction
from gadgetEzweb import createEzwebGadget
from commons import resource
from commons.utils import json_encode
from commons.authentication import get_user_authentication
from os import path, mkdir
import urllib2
from user.models import UserProfile
from buildingblock.models import Screen, Screenflow, BuildingBlockCode

class GadgetDeployment(resource.Resource):
    @transaction.commit_on_success
    def create(self, request):
        try:
            user = get_user_authentication(request)
            profile =  UserProfile.objects.get(user=user)
            
            staticPath=path.join(settings.BASEDIR,'static')
            if (not path.isdir(staticPath)):
                mkdir(staticPath)
    
            if request.POST.has_key('gadget'):
                json = simplejson.loads(request.POST['gadget'])
            else:
                raise Exception ('Gadget parameter expected in screenflow json')
            if (json.has_key('label')):
                label = json['label']
            else:
                label = {"en-gb": "FAST Gadget"}    
            if (json.has_key('vendor')):
                vendor = json['vendor']
            else:
                vendor = "Morfeo"               
            if (json.has_key('version')):
                version = json['version']
            else:
                version = "1.0"
            if (json.has_key('description')):
                description = json['description']
            else:
                description = {"en-gb": "Write the description here..."}
            if (json.has_key('email')):
                email = json['email']
            else:
                email = "author@email.com"
            if (json.has_key('creator')):
                creator = json['creator']
            else:
                creator = "Creator"
            
            screens = []
            prec = []
            post = []
            if (request.POST.has_key('screenflow')):
                scrf = get_object_or_404(Screenflow, id=request.POST['screenflow'])
                screenflow = simplejson.loads(scrf.data)
                definition = screenflow['definition']
                if (definition.has_key('screens')):
                    scrs=definition['screens']
                    for screen in scrs:
                        screen = get_object_or_404(Screen, uri=screen['uri'])
                        screen = simplejson.loads(screen.data)
                        aux = screen['label']
                        screen['label'] = aux['en-gb']
                        screen['allCode'] = BuildingBlockCode.objects.get(buildingBlock=screen['id']).code
                        screens.append(screen)
                if (definition.has_key('preconditions')):
                    prec = definition['preconditions']
                if (definition.has_key('postconditions')):
                    post = definition['postconditions']
    
            gadgetName = (vendor + '-' + label['en-gb'] + '-' + version).replace(' ', '_')
            gadgetPath = path.join(staticPath,gadgetName)
    
            if (not path.isdir(gadgetPath)):
                mkdir(gadgetPath)
            else:
                raise Exception ('Gadget already exists')
            
            base_uri = request.build_absolute_uri('/static')
            gadgetUri = base_uri + '/' + gadgetName
            ezwebUri = createEzwebGadget(gadgetName, gadgetUri, gadgetPath, label, vendor, version, description, creator, email, screens, prec, post)
            scrf.ezWebStoreURL = ezwebUri
            scrf.save()
            
            gadgetContext = Context({'ezwebURL': profile.ezweb_url, 'ezwebGadgetURL': ezwebUri})
            return render_to_response('deploy.html', gadgetContext);
    
        except Exception, e:
            transaction.rollback()
            return HttpResponseServerError(json_encode({"message":unicode(e)}), mimetype='application/json; charset=UTF-8')   
