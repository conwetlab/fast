from django.conf import settings

"""
    Adds catalogue-related context variables to the context.
"""
def catalogue_url(request):

    return {'CATALOGUE_URL': settings.CATALOGUE_URL}

def gvs_data_url(request):

    return {'GVS_DATA_URL': settings.GVS_DATA_URL}

def catalogue_flow(request):

    return {'CATALOGUE_FLOW': settings.CATALOGUE_FLOW}