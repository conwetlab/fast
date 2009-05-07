from django.conf.urls.defaults import patterns

urlpatterns = patterns('deploy.views',
    (r'^$', 'deployGadget'),
    (r'^ezweb', 'deployEzwebGadget'),
    (r'^igoogle', 'deployIgoogleGadget')
)
