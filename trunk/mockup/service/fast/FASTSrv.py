# -*- coding: cp1252 -*-
import web
from os import path, walk
from gadget import getEzWebTemplate, getEzWebHTML, parseWirings
import zipfile, shutil, urllib

class view:

    def POST(self):

        try:
            
            parameters = web.input()
            
            if (not parameters.has_key('screens')):
                return web.badrequest()
            screens = parameters.get('screens')
            if (parameters.has_key('gadgeturl')):
                url = urllib.unquote(parameters.get('gadgeturl'))
            else:
                url = "http://piccolo.ls.fi.upm.es/gadgets"           
            if (parameters.has_key('name')):
                name = parameters.get('name')
            else:
                name = "FAST Gadget"
            if (parameters.has_key('vendor')):
                vendor = parameters.get('vendor')
            else:
                vendor = "Morfeo"
            if (parameters.has_key('version')):
                version = parameters.get('version')
            else:
                version = "1.0"
            if (parameters.has_key('info')):
                info = parameters.get('info')
            else:
                info = "Gadget information"
            if (parameters.has_key('author')):
                author = parameters.get('author')
            else:
                author = "author"   
            if (parameters.has_key('email')):
                email = parameters.get('email')
            else:
                email = "email@email.com"
            if (parameters.has_key('slots')):
                sls = parameters.get('slots')
            else:
                sls = ""
            if (parameters.has_key('events')):
                evs = parameters.get('events')
            else:
                evs = ""
            
            slots = parseWirings(sls)
            events = parseWirings(evs)

     
            list = screens.split(',')
            
            base = path.dirname(path.abspath(__file__))
            
            html = getEzWebHTML(base, url, name, list, slots, events)
            
            ezWebTemplate = getEzWebTemplate(base, url + '/FASTGadget.html', name, vendor, version, info, author, email, slots, events)

            templateFile = open (base + '/tmp/' + 'template.xml', 'w')
            templateFile.write (ezWebTemplate)
            templateFile.close()
            
            htmlFile = open (base + '/tmp/' + 'FASTGadget.html','w')
            htmlFile.write(html)
            htmlFile.close ()
            
            shutil.copyfile (base + '/gadget_base.zip', base + '/../static/gadget.zip')
            zipFile = zipfile.ZipFile (base + '/../static/gadget.zip','a')
            zipFile.write(base + '/tmp/FASTGadget.html','./FASTGadget.html')
            zipFile.write(base + '/tmp/template.xml','./template.xml')
            zipFile.close()
            web.http.redirect('static/gadget.zip')
        except Exception, e:
            web.ctx.status = "500 Internal Server Error"
            web.ctx.headers = [('Content-Type', 'text/html')]
            web.ctx.output = "Message not sent: %s." % e
        
