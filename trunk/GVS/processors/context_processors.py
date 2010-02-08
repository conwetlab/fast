# -*- coding: utf-8 -*-
from django.conf import settings

def fast(request):
    context = {}

    if hasattr(settings, 'ONLY_ONE_JS_FILE'):
        context ['only_one_js_file'] = settings.ONLY_ONE_JS_FILE
    else:
        context ['only_one_js_file'] = False

    return context