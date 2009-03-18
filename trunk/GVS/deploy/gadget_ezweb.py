# -*- coding: cp1252 -*-
from django.template import RequestContext, Template, Context, loader
from os import path, mkdir
from gadget import copyLibraries

def createEzwebGadget(gadget_name, gadget_uri, gadget_path, label, vendor, version, description, author, email, screens, prec, post):
    print "creating gadget for ezweb..."
    mashup='ezweb'

    gadget_uri = gadget_uri + '/' + mashup
    gadget_path = path.join(gadget_path, mashup)
    mkdir(gadget_path)

    html_uri = gadget_uri + '/' + gadget_name + '.html'
    template_uri = gadget_uri + '/' + gadget_name + '.xml'
    print html_uri
    print template_uri 
    
    ezWebTemplate = getEzWebTemplate(html_uri, label['en-GB'], vendor, version, description['en-GB'], author, email, prec, post)
    templateFile = open(path.join(gadget_path, gadget_name + '.xml'), 'w')
    templateFile.write(ezWebTemplate)
    templateFile.close()
    
    ezWebHTML = getEzWebHTML(gadget_uri, label['en-GB'], screens, prec, post)
    htmlFile = open(path.join(gadget_path, gadget_name + '.html'), 'w')
    htmlFile.write(ezWebHTML)
    htmlFile.close()

    copyLibraries(gadget_path, mashup)

    return template_uri
  
def getEzWebTemplate(url, label, vendor, version, description, author, email, prec, post):
    ezWebContext = Context({'gadget_URI': url,
                            'gadget_title': label,
                            'gadget_vendor': vendor,
                            'gadget_version': version,
                            'gadget_author': author,
                            'gadget_mail': email,
                            'gadget_description': description,
                            'gadget_slots': prec,
                            'gadget_events': post})
    return loader.render_to_string(path.join('resources','gadget','ezwebTemplate.xml'), ezWebContext);

def getEzWebHTML(url, name, screens, prec, post):
    ezWebContext = Context({'gadget_URI': url,
                            'gadget_title': name,
                            'gadget_slots':prec,
                            'gadget_events':post,
                            'gadget_screens':screens})
    return loader.render_to_string(path.join('resources','gadget','ezwebTemplate.html'), ezWebContext);
