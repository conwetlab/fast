
from django.conf.urls.defaults import patterns
from catalogue.views import *

urlpatterns = patterns('catalogue.views',
    (r'^(?P<operation>[_\.\!\-\|\&\/\:\(\)\w\s]+)$',
        CatalogueProxy(permitted_methods=('GET', 'POST', 'PUT', 'DELETE',))),
)
