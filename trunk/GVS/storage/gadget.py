from django.conf import settings
from django.template import RequestContext, Template, Context, loader
from os import path, mkdir
from commons.utils import notEmptyValueOrDefault

def getEzWebTemplate(gadgetData):
    metadata = gadgetData['metadata']
    ezWebContext = Context({'gadgetUri': metadata['gadgetUri'],
                            'gadgetTitle': metadata['name'],
                            'gadgetVendor': notEmptyValueOrDefault(metadata, 'vendor', metadata['owner']),
                            'gadgetVersion': metadata['version'],
                            'gadgetAuthor': notEmptyValueOrDefault(metadata, 'authorName', settings.DEFAULT_EZWEB_AUTHOR_NAME),
                            'gadgetMail': notEmptyValueOrDefault(metadata, 'email', settings.DEFAULT_EZWEB_AUTHOR_EMAIL),
                            'gadgetDescription': notEmptyValueOrDefault(metadata, 'description', metadata['name']),
                            'gadgetImageURI': notEmptyValueOrDefault(metadata, 'imageURI', settings.DEFAULT_GADGET_IMAGE_URI),
                            'gadgetWikiURI': notEmptyValueOrDefault(metadata, 'gadgetHomepage', settings.DEFAULT_GADGET_HOMEPAGE_URI),
                            'gadgetHeight': notEmptyValueOrDefault(metadata, 'height', settings.DEFAULT_EZWEB_GADGET_HEIGHT),
                            'gadgetWidth': notEmptyValueOrDefault(metadata, 'width', settings.DEFAULT_EZWEB_GADGET_WIDTH),
                            'gadgetPersistent': metadata['persistent'],
                            'gadgetSlots': gadgetData['prec'],
                            'gadgetEvents': gadgetData['post']})
    return loader.render_to_string(path.join('resources','gadget','ezwebTemplate.xml'), ezWebContext);

def getEzWebHTML(gadgetData):
    metadata = gadgetData['metadata']
    ezWebContext = Context({'platform': 'ezweb',
                            'gadgetUri': metadata['gadgetUri'],
                            'gadgetTitle': metadata['name'],
                            'gadgetPersistent': metadata['persistent'],
                            'gadgetSlots': gadgetData['prec'],
                            'gadgetEvents': gadgetData['post'],
                            'gadgetScreens': gadgetData['screens']})
    return loader.render_to_string(path.join('resources','gadget','ezwebTemplate.html'), ezWebContext);

def getGoogleTemplate(gadgetData):
    metadata = gadgetData['metadata']
    googleContext = Context({'platform': 'google',
                              'gadgetUri': metadata['gadgetUri'],
                              'gadgetTitle': metadata['name'],
                              'gadgetVendor': notEmptyValueOrDefault(metadata, 'vendor', metadata['owner']),
                              'gadgetMail': notEmptyValueOrDefault(metadata, 'email', settings.DEFAULT_EZWEB_AUTHOR_EMAIL),
                              'gadgetDescription': notEmptyValueOrDefault(metadata, 'description', metadata['name']),
                              'gadgetHeight': notEmptyValueOrDefault(metadata, 'height', settings.DEFAULT_EZWEB_GADGET_HEIGHT),
                              'gadgetWidth': notEmptyValueOrDefault(metadata, 'width', settings.DEFAULT_EZWEB_GADGET_WIDTH),
                              'gadgetPersistent': metadata['persistent'],
                              'gadgetScreens': gadgetData['screens']})
    return loader.render_to_string(path.join('resources','gadget','googleTemplate.xml'), googleContext);

def getPlayerHTML(gadgetData, gadgetUri):
    metadata = gadgetData['metadata']

    playerContext = Context({'gadgetUri': gadgetUri,
                             'gadgetSlots': gadgetData['prec'],
                             'gadgetEvents': gadgetData['post'],
                             'gadgetScreens': gadgetData['screens']})
    return loader.render_to_string(path.join('resources','gadget','playerTemplate.html'), playerContext);
