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
from os import path
from django.conf.urls.defaults import patterns, include
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Static content
     (r'^fast/(.*)$', 'django.views.static.serve', {'document_root': path.join(settings.BASEDIR, 'media')}),

    # Static gadgets
     (r'^static/(.*)$', 'django.views.static.serve', {'document_root': path.join(settings.BASEDIR, 'static')}),

    # Fast
    (r'^', include('fast.urls')),

    # Storage
    (r'^storage/', include('storage.urls')),

    # Catalogue
    (r'^catalogue/', include('catalogue.urls')),

    # User
    (r'^user/', include('user.urls')),

    # BuildingBlock
    (r'^buildingblock/', include('buildingblock.urls')),

    # Proxy
    (r'^proxy', include('proxy.urls')),

    #Admin interface
    (r'^admin/', include(admin.site.urls)),

    (r'^accounts/login/$', 'django.contrib.auth.views.login'),
    (r'^logout$', 'commons.authentication.logout', {'login_url': '/'}),
    (r'^admin/logout/$', 'commons.authentication.logout', {'next_page': '/'}),
)
