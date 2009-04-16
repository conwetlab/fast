# -*- coding: cp1252 -*-
from django.conf import settings
from os import path, mkdir
import shutil

def copyLibraries(gadgetPath, mashupPlatform):
    jsPath = path.join(settings.BASEDIR,'deploy','deployLibs','js')
    resourcesPath = path.join(settings.BASEDIR,'deploy','deployLibs','resources')

    #Copying resources...
    if(path.isdir(resourcesPath)):
        shutil.copytree(resourcesPath, path.join(gadgetPath,'resources'))
    else:
        raise Exception('Gadget resources not available')

    #Copying gadget libraries...
    if(path.isdir(path.join(jsPath,'fast'))&
       path.isdir(path.join(jsPath,'prototype'))):
        shutil.copytree(path.join(jsPath,'fast'), path.join(gadgetPath,'js','fast'))
        shutil.copytree(path.join(jsPath,'prototype'), path.join(gadgetPath,'js','prototype'))
    else:
        raise Exception('Gadget libraries not available')

    #Copying API libraries...
    if(path.isdir(path.join(jsPath,'fastAPI'))&
       path.isfile(path.join(jsPath,'fastAPI','fastAPI.js'))):
        mkdir(path.join(gadgetPath,'js','fastAPI'))
        shutil.copy2(path.join(jsPath,'fastAPI','fastAPI.js'),path.join(gadgetPath,'js','fastAPI'))
    else:
        raise Exception('fastAPI.js not available')

    #Copying API implementation for a specific mashup platform...
    if(path.isfile(path.join(jsPath,'fastAPI','fastAPI_' + mashupPlatform + '.js'))):
        shutil.copy2(path.join(jsPath,'fastAPI','fastAPI_' + mashupPlatform + '.js'),path.join(gadgetPath,'js','fastAPI'))
    else:
        raise Exception('FastAPI implementation not available for platform: ' + mashupPlatform)
