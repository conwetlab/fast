from django.conf.urls.defaults import patterns
from user.views import *

urlpatterns = patterns('user.views',
    (r'^preferences$', Preferences(permitted_methods=('GET', 'POST', 'PUT',))),
)
