# -*- coding: cp1252 -*-
from django.template import RequestContext, Template, Context, loader
from os import path, mkdir
from gadget import copyLibraries
from django.utils.encoding import smart_str

def createEzwebGadget(gadgetName, gadgetUri, gadgetPath, label, vendor, version, description, creator, email, screens, prec, post):
    #print "creating gadget for ezweb..."
    mashup='ezweb'

    gadgetUri = gadgetUri + '/' + mashup
    gadgetPath = path.join(gadgetPath, mashup)
    mkdir(gadgetPath)

    templateUri = gadgetUri + '/ezweb.xml'
    
    ezWebTemplate = getEzWebTemplate(gadgetUri, label['en-gb'], vendor, version, description['en-gb'], creator, email, prec, post)
    templateFile = open(path.join(gadgetPath, 'ezweb.xml'), 'w')
    templateFile.write(smart_str(ezWebTemplate,'utf-8'))
    templateFile.close()
    
    ezWebHTML = getEzWebHTML(gadgetUri, label['en-gb'], screens, prec, post)
    htmlFile = open(path.join(gadgetPath, 'ezweb.html'), 'w')
    htmlFile.write(smart_str(ezWebHTML,'utf-8'))
    htmlFile.close()

    copyLibraries(gadgetPath, mashup)

    return templateUri
  
def getEzWebTemplate(url, label, vendor, version, description, creator, email, prec, post):
    ezWebContext = Context({'gadgetUri': url,
                            'gadgetTitle': label,
                            'gadgetVendor': vendor,
                            'gadgetVersion': version,
                            'gadgetCreator': creator,
                            'gadgetMail': email,
                            'gadgetDescription': description,
                            'gadgetSlots': prec,
                            'gadgetEvents': post})
    return loader.render_to_string(path.join('resources','gadget','ezwebTemplate.xml'), ezWebContext);

def getEzWebHTML(url, name, screens, prec, post):
    ezWebContext = Context({'gadgetUri': url,
                            'gadgetTitle': name,
                            'gadgetSlots':prec,
                            'gadgetEvents':post,
                            'gadgetScreens':screens})
    return loader.render_to_string(path.join('resources','gadget','ezwebTemplate.html'), ezWebContext);
