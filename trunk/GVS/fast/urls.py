from django.conf.urls.defaults import patterns

urlpatterns = patterns('fast.views',
    (r'^$', 'index'),
    (r'^register$', 'register'),
    (r'^signup$', 'signup'),
    (r'^confirm/(?P<activation_key>\w+)$', 'confirm'),
    (r'^debugger/(?P<buildingblock_type>\w+)$', 'buildingblock_debugger'),
    # Comment on production
    (r'^unittests/(?P<test_name>\w+)$', 'test'),
)
