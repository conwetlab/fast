# -*- coding: cp1252 -*-
from django.template import RequestContext, Template, Context, loader
from os import path, mkdir
from gadget import copyLibraries

def createIgoogleGadget(gadget_name, gadget_uri, gadget_path, label, vendor, version, description, author, email, screens, prec, post):
    print "creating gadget for igoogle..."
    mashup='igoogle'

    gadget_uri = gadget_uri + '/' + mashup
    gadget_path = path.join(gadget_path, mashup)
    mkdir(gadget_path)
    
    template_uri = gadget_uri + '/' + gadget_name + '.xml'
    print template_uri 
    
    iGoogleTemplate = getiGoogleTemplate(gadget_uri, template_uri, label['en-GB'], vendor, version, description['en-GB'], author, email, screens)

    templateFile = open(path.join(gadget_path, gadget_name + '.xml'), 'w')
    templateFile.write(iGoogleTemplate)
    templateFile.close()

    copyLibraries(gadget_path, mashup)
 
    return template_uri

#TODO Use pre and postconditions
def getiGoogleTemplate(gadget_uri, template_uri, label, vendor, version, description, author, email, screens):
    #FIXME
    gadget_uri = "http://ezgadget.googlecode.com/svn/trunk/ezgadget/GVS"
    igoogleContext = Context({'gadget_URI': gadget_uri,
                            'gadget_templateURI': template_uri,
                            'gadget_title': label,
                            'gadget_vendor': vendor,
                            'gadget_version': version,
                            'gadget_author': author,
                            'gadget_mail': email,
                            'gadget_description': description,
                            'gadget_screens':screens})
    return loader.render_to_string(path.join('resources','gadget','igoogleTemplate.xml'), igoogleContext);
