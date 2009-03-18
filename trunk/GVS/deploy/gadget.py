# -*- coding: cp1252 -*-
from django.conf import settings
from os import path, mkdir
import shutil

def copyLibraries(gadget_path, mashup_platform):
    js_path = path.join(settings.BASEDIR,'deploy','deploy_libs','js')
    resources_path = path.join(settings.BASEDIR,'deploy','deploy_libs','resources')

    #Copying resources...
    if(path.isdir(resources_path)):
        shutil.copytree(resources_path, path.join(gadget_path,'resources'))
    else:
        raise Exception('Gadget resources not available')

    #Copying gadget libraries...
    if(path.isdir(path.join(js_path,'fast'))&
       path.isdir(path.join(js_path,'prototype'))):
        shutil.copytree(path.join(js_path,'fast'), path.join(gadget_path,'js','fast'))
        shutil.copytree(path.join(js_path,'prototype'), path.join(gadget_path,'js','prototype'))
    else:
        raise Exception('Gadget libraries not available')

    #Copying API libraries...
    if(path.isdir(path.join(js_path,'fastAPI'))&
       path.isfile(path.join(js_path,'fastAPI','fastAPI.js'))):
        mkdir(path.join(gadget_path,'js','fastAPI'))
        shutil.copy2(path.join(js_path,'fastAPI','fastAPI.js'),path.join(gadget_path,'js','fastAPI'))
    else:
        raise Exception('fastAPI.js not available')

    #Copying API implementation for a specific mashup platform...
    if(path.isfile(path.join(js_path,'fastAPI','fastAPI_' + mashup_platform + '.js'))):
        shutil.copy2(path.join(js_path,'fastAPI','fastAPI_' + mashup_platform + '.js'),path.join(gadget_path,'js','fastAPI'))
    else:
        raise Exception('FastAPI implementation not available for platform: ' + mashup_platform)
