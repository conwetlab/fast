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
from django.conf.urls.defaults import patterns

from buildingblock.views import *

urlpatterns = patterns('buildingblock.views',
    # Building block
    (r'^(?P<bbtype>screenflow|screen|form|operator|resource)?[/]?$',
        BuildingBlockCollection(permitted_methods=('GET', 'POST',))),
    (r'^(?P<bbtype>screenflow|screen|form|operator|resource)/search$',
        BuildingBlockCollectionSearch(permitted_methods=('POST',))),
    (r'^(?P<buildingblock_id>\d+)[/]?$',
        BuildingBlockEntry(permitted_methods=('GET', 'PUT', 'DELETE',))),
    (r'^(?P<buildingblock_id>\d+)/vote[/]?$',
        VoteCollection(permitted_methods=('GET', 'POST',))),
    (r'^(?P<buildingblock_id>\d+)/tag[/]?$',
        TagCollection(permitted_methods=('GET', 'POST',))),
    (r'^(?P<buildingblock_id>\d+)/sharing[/]?$',
        Sharing(permitted_methods=('POST', 'DELETE',))),
    (r'^(?P<buildingblock_id>\d+)/code[/]?$',
        Code(permitted_methods=('GET',))),
    (r'^(?P<buildingblock_id>\d+)/unbound_code[/]?$',
        UnboundCode(permitted_methods=('GET',))),
    (r'^(?P<buildingblock_id>\d+)/debug_code[/]?$',
        DebugCode(permitted_methods=('GET',))),
)
