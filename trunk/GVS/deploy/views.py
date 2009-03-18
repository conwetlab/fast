# -*- coding: cp1252 -*-
from django.conf import settings
from django.utils import simplejson
from django.template import RequestContext, Template, Context, loader
from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseServerError
from gadget_ezweb import createEzwebGadget
from gadget_igoogle import createIgoogleGadget
from os import path, mkdir
import urllib2

def deployGadget(request):
    print "gadget creation request"
    try:
        #If folder "static" does not exist, create it
        static_path=path.join(settings.BASEDIR,'static')
        if (not path.isdir(static_path)):
            mkdir(static_path)
        
        #Getting the gadget parameters
        if request.POST.has_key('gadget'):
            print "reading screenflow json"
            json = simplejson.loads(request.POST['gadget'])
        else:
            print "Gadget parameter expected in screenflow json"
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
        if (json.has_key('author')):
            author = json['author']
        else:
            author = "Author"
        if (json.has_key('definition')):
            definition = json['definition']
            if (definition.has_key('screens')):
                screens=definition['screens']
                for screen in screens:
                    url = screen['uri']
                    data = ""
                    req = urllib2.Request(url)
                    response = urllib2.urlopen(req)
                    screen['code'] = response.read()
            else:
                screens=[]
            if (definition.has_key('connectors')):
                connectors=definition['connectors']
            else:
                connectors=[]
        else:
            definition['screens']=[]
            definition['connectors']=[]
        if (json.has_key('preconditions')):
            prec = json['preconditions']
        else:
            prec = []
        if (json.has_key('postconditions')):
            post = json['postconditions']
        else:
            post = []
        print "parameters correctly obtained from json"

        gadget_name = (vendor + '-' + label['en-GB'] + '-' + version).replace(' ', '_')
        gadget_path = path.join(static_path,gadget_name)

        if (not path.isdir(gadget_path)):
            mkdir(gadget_path)
        else:
            print "Gadget already exists"
            raise Exception ('Gadget already exists')
        
        base_uri = request.build_absolute_uri('/static')
        #TODO: create uri with python api
        gadget_uri = base_uri + '/' + gadget_name
        
        ezweb_uri = createEzwebGadget(gadget_name, gadget_uri, gadget_path, label, vendor, version, description, author, email, screens, prec, post)
        igoogle_uri = createIgoogleGadget(gadget_name, gadget_uri, gadget_path, label, vendor, version, description, author, email, screens, prec, post)
        
        gadgetContext = Context({'ezwebGadgetURL': ezweb_uri,'igoogleGadgetURL': igoogle_uri})
        return render_to_response('deploy.html', gadgetContext);

    except Exception, e:
        print e.message
        response = HttpResponseServerError(e.message)
        return response
