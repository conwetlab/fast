
from django.conf.urls.defaults import patterns
from catalogue.views import *

urlpatterns = patterns('catalogue.views',
    (r'^(?P<operation>[\._\!_\s_\-_\|_\&_\/_\:_\(_\)_\w]+)$',
        CatalogueProxy(permitted_methods=('GET', 'POST', 'PUT', 'DELETE',))),
)
