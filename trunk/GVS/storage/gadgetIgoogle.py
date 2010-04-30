from django.conf import settings
from django.template import RequestContext, Template, Context, loader
from os import path, mkdir
from commons.utils import notEmptyValueOrDefault

def getIGoogleTemplate(gadgetData):
    metadata = gadgetData['metadata']
    igoogleContext = Context({
                            'platform': 'igoogle',
                            'gadgetUri': metadata['gadgetUri'],
                            'gadgetTitle': metadata['name'],
                            'gadgetVendor': notEmptyValueOrDefault(metadata, 'vendor', metadata['owner']),
                            'gadgetMail': notEmptyValueOrDefault(metadata, 'email', settings.DEFAULT_EZWEB_AUTHOR_EMAIL),
                            'gadgetDescription': notEmptyValueOrDefault(metadata, 'description', metadata['name']),
                            'gadgetHeight': notEmptyValueOrDefault(metadata, 'height', settings.DEFAULT_EZWEB_GADGET_HEIGHT),
                            'gadgetWidth': notEmptyValueOrDefault(metadata, 'width', settings.DEFAULT_EZWEB_GADGET_WIDTH),
                            'gadgetScreens': gadgetData['screens']})
    return loader.render_to_string(path.join('resources','gadget','igoogleTemplate.xml'), igoogleContext);