from django.conf.urls.defaults import patterns
from deploy.views import *

urlpatterns = patterns('deploy.views',
    (r'^$',
        GadgetDeployment(permitted_methods=('POST', ))),
)