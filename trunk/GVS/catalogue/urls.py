
from django.conf.urls.defaults import patterns
from catalogue.views import *

urlpatterns = patterns('catalogue.views',
    (r'^screens', find),
    (r'^(?P<operation>[\._\!_\s_\-_\|_\&_\/_\:_\(_\)_\w]+)$', catalogueProxy),

)
