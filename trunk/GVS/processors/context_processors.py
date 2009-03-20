from django.conf import settings

"""
    Adds catalogue-related context variables to the context.
"""
def catalogue_url(request):

    return {'CATALOGUE_URL': settings.CATALOGUE_URL}

def catalogue_flow(request):

    return {'CATALOGUE_FLOW': settings.CATALOGUE_FLOW}