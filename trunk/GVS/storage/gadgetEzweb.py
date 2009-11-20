# -*- coding: cp1252 -*-
from django.template import RequestContext, Template, Context, loader
from os import path, mkdir
from django.utils.encoding import smart_str
  
def getEzWebTemplate(gadgetData):
    ezWebContext = Context({'gadgetUri': gadgetData['gadgetUri'],
                            'gadgetTitle': gadgetData['label']['en-gb'],
                            'gadgetVendor': gadgetData['vendor'],
                            'gadgetVersion': gadgetData['version'],
                            'gadgetCreator': gadgetData['creator'],
                            'gadgetMail': gadgetData['email'],
                            'gadgetDescription': gadgetData['description']['en-gb'],
                            'gadgetSlots': gadgetData['prec'],
                            'gadgetEvents': gadgetData['post']})
    return loader.render_to_string(path.join('resources','gadget','ezwebTemplate.xml'), ezWebContext);

def getEzWebHTML(gadgetData):
    ezWebContext = Context({'gadgetUri': gadgetData['gadgetUri'],
                            'gadgetTitle': gadgetData['name'],
                            'gadgetSlots': gadgetData['prec'],
                            'gadgetEvents': gadgetData['post'],
                            'gadgetScreens': gadgetData['screens']})
    return loader.render_to_string(path.join('resources','gadget','ezwebTemplate.html'), ezWebContext);
