from django.conf.urls.defaults import patterns

from buildingblock.views import *

urlpatterns = patterns('buildingblock.views',
    # Building block
    (r'^(?P<bbtype>screenflow|screen|form|operator|resource)?[/]?$',
        BuildingBlockCollection(permitted_methods=('GET', 'POST',))),
    (r'^(?P<buildingblock_id>\d+)[/]?$',
        BuildingBlockEntry(permitted_methods=('GET', 'POST', 'PUT', 'DELETE',))),
    (r'^(?P<buildingblock_id>\d+)/vote[/]?$',
        VoteCollection(permitted_methods=('GET', 'POST',))),
    (r'^(?P<buildingblock_id>\d+)/tag[/]?$',
        TagCollection(permitted_methods=('GET', 'POST',))),
)