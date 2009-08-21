import urllib2

from django.conf import settings
from django.http import HttpResponse

from python_rest_client.restful_lib import Connection
from commons.utils import cleanUrl

def catalogueProxy(request, operation):
    # Get the base url to the Catalogue
    if hasattr(settings,'CATALOGUE_URL'):
        urlBase=settings.CATALOGUE_URL
        if (operation == "getFacts"):
            if hasattr(settings,'GVS_DATA_URL'):
                url = settings.GVS_DATA_URL + "json_data/getFacts.json"
            else:
                #TODO: check error control
                url = ""
        elif (operation == "getdomainconcepts"):
            if hasattr(settings,'GVS_DATA_URL'):
                url = settings.GVS_DATA_URL + "json_data/getdomainconcepts.json"
            else:
                #TODO: check error control
                url = ""
        else:
            url=urlBase+"catalogue/"+operation+".json"
        # Get a file handler in order to get the data
        fileHandler = urllib2.FileHandler()
        opener = urllib2.build_opener(fileHandler)
        # Read the screens data from the catalogue depending on the operation
        result = opener.open(url).read()
        response = HttpResponse(result, mimetype='application/json; charset=UTF-8')
        return response

def findandcheck(request):
    if hasattr(settings,'CATALOGUE_URL'):
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        # Obtain the json from the request
        body = request.raw_post_data
        result = conn.request_post("/findcheck",body=body, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response

def find(request):
    if hasattr(settings,'CATALOGUE_URL'):
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        # Obtain the json from the request
        body = request.raw_post_data

        result = conn.request_post("/find",body=body, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response

def getmetadata(request):
    if hasattr(settings,'CATALOGUE_URL'):
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        # Obtain the json from the request
        body = request.raw_post_data
        result = conn.request_post("/getmetadata",body=body, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response

def check(request):
    if hasattr(settings,'CATALOGUE_URL'):
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        # Obtain the json from the request
        body = request.raw_post_data
        result = conn.request_post("/check",body=body, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response

def createscreen(request):
    if hasattr(settings,'CATALOGUE_URL'):
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        # Obtain the json from the request
        body = request.raw_post_data
        result = conn.request_post("/screens",body=body, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response

def get(request):
    if hasattr(settings,'CATALOGUE_URL'):
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        result = conn.request_get("/screens",headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response

def delete(request):
    if hasattr(settings,'CATALOGUE_URL'):
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        result = conn.request_delete("/screens/1236597883500",headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response
