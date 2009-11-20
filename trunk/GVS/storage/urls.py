from django.conf.urls.defaults import patterns

from storage.views import *

urlpatterns = patterns('storage.views',
    (r'^$',
        GadgetStorage(permitted_methods=('POST', 'GET'))),
    (r'^(?P<storage_id>\d+)[/]?$',
        StorageEntry(permitted_methods=('GET', 'DELETE'))),
)