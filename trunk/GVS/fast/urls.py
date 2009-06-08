from django.conf.urls.defaults import patterns

urlpatterns = patterns('fast.views',
    (r'^$', 'index'),
    (r'^register$', 'register'),
    (r'^signup$', 'signup'),
    (r'^confirm/(?P<activation_key>\w+)$', 'confirm'),
)