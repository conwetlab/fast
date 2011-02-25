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
from commons.authentication import get_user_authentication, Http403
from django.db import transaction
from django.core import serializers
from django.http import HttpResponse, HttpResponseServerError, HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.utils import simplejson
from user.models import UserProfile
from commons.resource import Resource
from commons.utils import json_encode
from commons.httpUtils import PUT_parameter

class Preferences(Resource):

    def read(self, request):
        try:
            user = get_user_authentication(request)
            profile =  UserProfile.objects.get_or_create(user=user)[0]

            dict = {"user" :{"username": None, "email": None, "first_name": None, "last_name": None},
                    "profile" : {"ezweb_url": None}}

            data = json_encode({"user": user, "profile": profile}, fields=dict)

            return HttpResponse(data, mimetype='application/json; charset=UTF-8')
        except Http403, ex:
            return HttpResponseForbidden(json_encode({"message":unicode(ex)}), mimetype='application/json; charset=UTF-8')
        except Exception, ex:
            return HttpResponseServerError(json_encode({"message":unicode(ex)}), mimetype='application/json; charset=UTF-8')

    @transaction.commit_on_success
    def update(self, request):
        try:
            user = get_user_authentication(request)
            # Get the gadget data from the request
            preferences = simplejson.loads(PUT_parameter(request, 'preferences'))

            user.email = preferences['email']
            user.first_name = preferences['first_name']
            user.last_name = preferences['last_name']

            profile = UserProfile.objects.get(user=request.user)
            profile.ezweb_url = preferences["ezweb_url"]
            profile.save()

            user.save()

            ok = json_encode({"message":"OK"})

            return HttpResponse(ok, mimetype='application/json; charset=UTF-8')

        except Http403, ex:
            return HttpResponseForbidden(json_encode({"message":unicode(ex)}), mimetype='application/json; charset=UTF-8')
        except Exception, ex:
            return HttpResponseServerError(json_encode({"message":unicode(ex)}), mimetype='application/json; charset=UTF-8')
