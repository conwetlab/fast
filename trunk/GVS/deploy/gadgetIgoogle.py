# -*- coding: cp1252 -*-
from django.template import RequestContext, Template, Context, loader
from os import path, mkdir
from gadget import copyLibraries
from django.utils.encoding import smart_str

def createIgoogleGadget(gadgetName, gadgetUri, gadgetPath, label, vendor, version, description, creator, email, screens, prec, post):
    #print "creating gadget for igoogle..."
    mashup='igoogle'

    gadgetUri = gadgetUri + '/' + mashup
    gadgetPath = path.join(gadgetPath, mashup)
    mkdir(gadgetPath)
    
    templateUri = gadgetUri + '/' + gadgetName + '.xml'
    #print templateUri 
    
    iGoogleTemplate = getiGoogleTemplate(gadgetUri, templateUri, label['en-GB'], vendor, version, description['en-GB'], creator, email, screens)

    templateFile = open(path.join(gadgetPath, gadgetName + '.xml'), 'w')
    templateFile.write(smart_str(iGoogleTemplate,'utf-8'))
    templateFile.close()

    copyLibraries(gadgetPath, mashup)
 
    return templateUri

#TODO Use pre and postconditions
def getiGoogleTemplate(gadgetUri, templateUri, label, vendor, version, description, creator, email, screens):
    #FIXME
    gadgetUri = "http://ezgadget.googlecode.com/svn/trunk/ezgadget/GVS"
    igoogleContext = Context({'gadgetUri': gadgetUri,
                            'gadgetTemplateURI': templateUri,
                            'gadgetTitle': label,
                            'gadgetVendor': vendor,
                            'gadgetVersion': version,
                            'gadgetCreator': creator,
                            'gadgetMail': email,
                            'gadgetDescription': description,
                            'gadgetScreens':screens})
    return loader.render_to_string(path.join('resources','gadget','igoogleTemplate.xml'), igoogleContext);
