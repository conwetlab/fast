# -*- coding: cp1252 -*-
from django.conf import settings
from django.utils import simplejson
from django.template import RequestContext, Template, Context, loader
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from gadgetEzweb import createEzwebGadget
from gadgetIgoogle import createIgoogleGadget
from commons.httpUtils import download_http_content
from commons.authentication import get_user_authentication
from os import path, mkdir
import urllib2
from python_rest_client.restful_lib import Connection
from user.models import UserProfile

def deployGadget(request):
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
            label = {"en-GB": "FAST Gadget"}    
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
            description = {"en-GB": "Write the description here..."}
        if (json.has_key('email')):
            email = json['email']
        else:
            email = "author@email.com"
        if (json.has_key('creator')):
            creator = json['creator']
        else:
            creator = "Creator"
        if (json.has_key('definition')):
            definition = json['definition']
            if (definition.has_key('screens')):
                screens=definition['screens']
                for screen in screens:
                    aux = screen['label']
                    screen['label'] = aux['en-gb']

                    url = screen['code']
                    data = download_http_content(url)
                    screen['allCode']=data
            else:
                screens=[]
            #Connectors are deprecated
            if (definition.has_key('connectors')):
                connectors=definition['connectors']
            else:
                connectors=[]
        if (json.has_key('preconditions')):
            prec = json['preconditions']
        else:
            prec = []
        if (json.has_key('postconditions')):
            post = json['postconditions']
        else:
            post = []

        gadgetName = (vendor + '-' + label['en-GB'] + '-' + version).replace(' ', '_')
        gadgetPath = path.join(staticPath,gadgetName)

        if (not path.isdir(gadgetPath)):
            mkdir(gadgetPath)
        else:
            raise Exception ('Gadget already exists')
        
        base_uri = request.build_absolute_uri('/static')
        gadgetUri = base_uri + '/' + gadgetName
        ezwebUri = createEzwebGadget(gadgetName, gadgetUri, gadgetPath, label, vendor, version, description, creator, email, screens, prec, post)
        
        gadgetContext = Context({'ezwebURL': profile.ezweb_url, 'ezwebGadgetURL': ezwebUri})
        return render_to_response('deploy.html', gadgetContext);

    except Exception, e:
        response = HttpResponseServerError(e.message)
        return response
    
def deployEzwebGadget(request):
    if hasattr(settings,'EZWEB_URL'):
        baseUrl = settings.EZWEB_URL
        conn = Connection(baseUrl)
        params = request.POST
        
        body = request.raw_post_data

        result = conn.request_post("/user/admin/catalogue/resource", args=params, headers={'Accept':'application/xml'})
        
        response = HttpResponse(result['body'], mimetype='application/xml; charset=UTF-8')
        return response

def deployIgoogleGadget(request):

    return response
