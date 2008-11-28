# -*- coding: cp1252 -*-
import web
from os import path, walk, mkdir
from gadget import getEzWebTemplate, getEzWebHTML, parseWirings
from utils import unzip

def getDeploymentHTML(baseFile, ezWebURI):
    deploymentFile = open(baseFile + '/deploy.html', 'r')
    deployment = deploymentFile.read()
    deploymentFile.close()
    deployment = deployment.replace('$$ezwebGadgetURL$$', ezWebURI)
    return deployment

class view:       
    def POST(self):

        try:
            
            parameters = web.input()
            
            if (not parameters.has_key('storeScreens')):
                return web.badrequest()
            screens = parameters.get('storeScreens')
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
            if (parameters.has_key('storeSlots')):
                sls = parameters.get('storeSlots')
            else:
                sls = ""
            if (parameters.has_key('storeEvents')):
                evs = parameters.get('storeEvents')
            else:
                evs = ""
            
            slots = parseWirings(sls)
            events = parseWirings(evs)
        
            base = path.dirname(path.abspath(__file__))
            
            gadget_name = (vendor + '-' + name + '-' + version).replace(' ', '_')
            
            gadget_path = base + '/../static/' + gadget_name + '/'
            
            if not path.isdir(gadget_path):
                mkdir(gadget_path)
            else:
                raise Exception ('Gadget already exists')
                      
            list = screens.split(',')
            
            base_uri = web.ctx.homedomain + '/static'
            url_path = base_uri + '/'+gadget_name
            html_uri = base_uri + '/'+gadget_name+'/' + gadget_name + '.html'
            template_uri = base_uri + '/'+gadget_name+'/' + gadget_name + '.xml'
            
            ezWebTemplate = getEzWebTemplate(base, html_uri, name, vendor, version, info, author, email, slots, events)
            templateFile = open (gadget_path + gadget_name + '.xml', 'w')
            templateFile.write (ezWebTemplate)
            templateFile.close()
            
            html = getEzWebHTML(base, url_path, name, list, slots, events)
            htmlFile = open (gadget_path + gadget_name + '.html','w')
            htmlFile.write(html)
            htmlFile.close()
            
            un = unzip.unzip()
            un.extract(base + '/gadget_base.zip', gadget_path)
            
            web.ctx.headers = [('Content-Type', 'text/html')]
            
            print getDeploymentHTML(base, template_uri)
            
        except Exception, e:
            web.ctx.status = "500 Internal Server Error"
            web.ctx.headers = [('Content-Type', 'text/plain')]
            web.ctx.output = e.message
        
