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
# -*- coding: utf-8 -*-
from django.conf import settings

def fast(request):
    context = {'EZWEB_URL' : settings.EZWEB_URL,
               'WRAPPER_SERVICE_URL': settings.WRAPPER_SERVICE_URL,
               'DATA_MEDIATION_URL': settings.DATA_MEDIATION_URL,
               'FACT_TOOL_URL': settings.FACT_TOOL_URL,
               'isLocalStorage': (not settings.STORAGE_URL or
               settings.STORAGE_URL == ''),
               'DEBUG': settings.DEBUG,
               }

    if hasattr(settings, 'ONLY_ONE_JS_FILE'):
        context ['only_one_js_file'] = settings.ONLY_ONE_JS_FILE
    else:
        context ['only_one_js_file'] = False

    return context
