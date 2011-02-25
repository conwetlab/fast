#...............................licence...........................................#
#
#    (C) Copyright 2011 FAST Consortium
#
#     This file is part of FAST Platform.
#
#     FAST Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     FAST Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the FAST Consortium
#     is available at
#
#     http://fast.morfeo-project.eu
#
#...............................licence...........................................#
import urllib2

from django.conf import settings
from django.http import HttpResponse

from python_rest_client.restful_lib import Connection
from commons.resource import Resource
from commons.utils import cleanUrl

class CatalogueProxy(Resource):
    def read(self, request, operation):
        operation = "%s" % operation
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        result = conn.request_get(operation) #, headers={'Accept':'application/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response
    def create(self, request, operation):
        operation = "/%s" % operation
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        body = request.raw_post_data
        result = conn.request_post(operation, body=body) #, headers={'Accept':'application/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response
    def update(self, request, operation):
        operation = "/%s" % operation
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        body = request.raw_post_data
        result = conn.request_put(operation, body=body) #, headers={'Accept':'application/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response
    def delete(self, request, operation):
        operation = "/%s" % operation
        baseUrl = cleanUrl(settings.CATALOGUE_URL)
        conn = Connection(baseUrl)
        result = conn.request_delete(operation) #, headers={'Accept':'application/json'})
        response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
        return response
