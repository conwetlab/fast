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
from django.utils.translation import ugettext as _
from django.contrib.auth.models import User
from django.contrib.auth.views import logout_then_login

class Http403(Exception):
    pass

def user_authentication(request, user_name):
    user = request.user
    if not user.is_authenticated():
        raise Http403 (_("You must be logged"))

    if user_name and user.username != user_name:
        raise Http403 (_("You do not have permission"))

    return user

def get_user_authentication(request):
    user = request.user
    if not user.is_authenticated():
        raise Http403 (_("You must be logged"))

    return user

def logout(request, login_url):
    return logout_then_login(request, login_url)
