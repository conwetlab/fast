import urllib2

from django.conf import settings
from django.http import HttpResponse

from python_rest_client.restful_lib import Connection
from commons.utils import jsonEncode


def catalogueProxy(request, operation):

    # Get the base url to the Catalogue
    if hasattr(settings,'CATALOGUE_URL'):
        urlBase=settings.CATALOGUE_URL
        if (operation == "getMetadata"):
            url=urlBase+"json_data/"+operation+".json"
        else:
            url=urlBase+"json_data/"+operation+".json"
        # Get a file handler in order to get the data
        fileHandler = urllib2.FileHandler()
        opener = urllib2.build_opener(fileHandler)
        # Read the screens data from the catalogue depending on the operation
        result = opener.open(url).read()

        response = HttpResponse(result, mimetype='application/json; charset=UTF-8')
        return response

def find(request):

    baseUrl = 'http://localhost:8082'
    conn = Connection(baseUrl)
    # Obtain the json from the request
    body = request.raw_post_data
    #body = jsonEncode(body)
    result = conn.request_post("/find",body=body, headers={'Accept':'text/json'})
    response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
    return response


def getmetadata(request):

    baseUrl = 'http://localhost:8082'
    conn = Connection(baseUrl)
    # Obtain the json from the request
    body = jsonEncode(body)
    result = conn.request_post("/getmetadata",body=body, headers={'Accept':'text/json'})
    response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
    return response


def check(request):

    baseUrl = 'http://localhost:8082'
    conn = Connection(baseUrl)
    # Obtain the json from the request
    body = jsonEncode(body)
    result = conn.request_post("/check",body=body, headers={'Accept':'text/json'})
    response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
    return response


def get(request):

    baseUrl = 'http://localhost:8082'
    conn = Connection(baseUrl)
    result = conn.request_get("/screens",headers={'Accept':'text/json'})
    response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
    return response

def delete(request):

    baseUrl = 'http://localhost:8082'
    conn = Connection(baseUrl)
    result = conn.request_delete("/screens/1236597883500",headers={'Accept':'text/json'})
    response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
    return response

def post(request):

    baseUrl = 'http://localhost:8082'
    body = { "uri": None,
        "label": {"en-GB": "Screen - DERI"},
        "description": {"en-GB": "Returns people working in DERI"},
        "creationDate": "2009-02-07T09:59:52+0000",
        "creator": "http://www.ismaelrivera.es/",
        "domainContext": {
            "tags": [],
            "user": None
        },
        "homepage": "http://www.deri.ie/",
        "icon": "http://www.deri.ie/icon.jpg",
        "screenshot": "http://www.deri.ie/screenshot.jpg",
        "rights": "http://creativecommons.org/",
        "version": "1.0",
        "preconditions": [],
        "postconditions": ["?person rdf:type foaf:Person . ?person foaf:workplaceHomepage http://www.deri.ie/"]
    }
    body = jsonEncode(body)
    conn = Connection(baseUrl)
    result = conn.request_post("/screens", body=body, headers={'Accept':'text/json'})
    response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
    return response


