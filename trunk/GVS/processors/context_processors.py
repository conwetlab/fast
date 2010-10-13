# -*- coding: utf-8 -*-
from django.conf import settings

def fast(request):
    context = {'EZWEB_URL' : settings.EZWEB_URL,
               'WRAPPER_SERVICE_URL': settings.WRAPPER_SERVICE_URL,
               'DATA_MEDIATION_URL': settings.DATA_MEDIATION_URL,
               'FACT_TOOL_URL': settings.FACT_TOOL_URL,
               'isLocalStorage': (not settings.STORAGE_URL or
               settings.STORAGE_URL == '')}

    if hasattr(settings, 'ONLY_ONE_JS_FILE'):
        context ['only_one_js_file'] = settings.ONLY_ONE_JS_FILE
    else:
        context ['only_one_js_file'] = False

    return context
