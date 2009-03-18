# -*- coding: utf-8 -*-

from urlparse import urlparse

from urllib import urlopen, urlcleanup

from django.conf import settings

def download_http_content (uri):
    urlcleanup()
    
    try:
        proxy = settings.PROXY_SERVER
        
        #The proxy must not be used with local address
        host = urlparse(uri)[1]
    
        if (host.startswith(('localhost','127.0.0.1'))):
            proxy = False
        else:
            proxy = {'http': 'http://' + proxy}
            
    except Exception:
        proxy = False
        
    if proxy:
        return urlopen(uri,proxies=proxy).read()
    else:
        return urlopen(uri).read()