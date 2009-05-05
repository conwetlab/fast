
from django.conf.urls.defaults import patterns
from catalogue.views import *

urlpatterns = patterns('catalogue.views',
    (r'^screens', find),
    (r'^find$', find),
    (r'^findandcheck', findandcheck),
    (r'^check', check),
    (r'^getmetadata', getmetadata),
    (r'^createscreen', createscreen),
    (r'^(?P<operation>[\._\!_\s_\-_\|_\&_\/_\:_\(_\)_\w]+)$', catalogueProxy)
)
