import urllib2

from django.conf import settings
from django.http import HttpResponse

from python_rest_client.restful_lib import Connection
from commons.resource import Resource
from commons.utils import cleanUrl

class CatalogueProxy(Resource):
    def read(self, request, operation):
        operation = "/%s" % operation
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        result = conn.request_get(operation, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response
    def create(self, request, operation):
        operation = "/%s" % operation
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        body = request.raw_post_data
        result = conn.request_post(operation, body=body, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response
    def update(self, request, operation):
        operation = "/%s" % operation
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        body = request.raw_post_data
        result = conn.request_put(operation, body=body, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response
    def delete(self, request, operation):
        operation = "/%s" % operation
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        result = conn.request_delete(operation, headers={'Accept':'text/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response