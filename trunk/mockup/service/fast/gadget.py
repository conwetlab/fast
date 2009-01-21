# -*- coding: cp1252 -*-
# MORFEO Project
# http://morfeo-project.org
#
# Component: FAST
#
# (C) Copyright 2008 Telefónica Investigación y Desarrollo
#     S.A.Unipersonal (Telefónica I+D)
#
# Info about members and contributors of the MORFEO project
# is available at:
#
#   http://morfeo-project.org/
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
#
# If you want to use this software an plan to distribute a
# proprietary application in any way, and you are not licensing and
# distributing your source code under GPL, you probably need to
# purchase a commercial license of the product.  More info about
# licensing options is available at:
#
#   http://morfeo-project.org/
from string import Template

SCREEN_DEF = '$$screen_def$$'
SCREEN_HTML = '$$screen_html$$'
GADGET_URL = '$$gadgetURI$$'
GADGET_VENDOR = '$$gadget_vendor$$'
GADGET_TITLE = '$$gadget_title$$'
GADGET_VERSION = '$$gadget_version$$'
GADGET_AUTHOR = '$$gadget_author$$'
GADGET_EMAIL = '$$gadget_mail$$'
GADGET_DESCRIPTION = '$$gadget_description$$'
GADGET_SLOT = '$$gadget_slot$$'
GADGET_EVENT = '$$gadget_event$$'

SCREENS = {'amazonSearch': "screens.set('Search', {title: 'Search', contentEl:'search', pre: []});",
           'amazonList': "screens.set('List', {title: 'List', contentEl:'list', pre: ['filter']});",
           'amazonProduct': "screens.set('Product', {title: 'Product', contentEl:'product', pre: ['item']});",
           'amazonShopping': "screens.set('ShoppingCart', {title: 'ShoppingCart', contentEl:'shoppingCart', pre: ['cart']});",
           'amazonOrder': "screens.set('Order', {title: 'Order', contentEl:'order', pre: ['purchase']});",
           'amazonSuggestion': "screens.set('SuggestionList', {title: 'Suggestion List', contentEl:'suggestionlist', pre: ['item']});",
           'amazonPrice': "screens.set('PriceComparative', {title: 'Price Comparative', contentEl:'priceComparative', pre: ['item']});",
           'eBayList': "screens.set('eBayList', {title: 'eBay List', contentEl:'eBayList', pre: ['item']});" }

class Wiring:
    name = ''
    label = ''
    friendcode  = ''
    fact_name = ''
    fact_attr = ''
    
def parseWirings(connectors):
    ret = []
    if (connectors != ''):
        conns = connectors.split(';')
        for conn in conns:
            vals = conn.split(',')
            w = Wiring()
            w.name = vals[0]
            w.label = vals[1]
            w.friendcode = vals[2]
            w.fact_name = vals[3]
            if(len(vals)>=5):
                w.fact_attr = vals[4]
            else:
                w.fact_attr = ''
            ret.append(w)
    return ret


def getEzWebTemplate(base, url, name, vendor, version, info, author, email, slots, events):
    ezWebTemplateFile = open(base + '/template.xml', 'r')
    ezWebTemplate = ezWebTemplateFile.read()
    ezWebTemplateFile.close()
    #replace template info
    ezWebTemplate = ezWebTemplate.replace(GADGET_URL, url)
    ezWebTemplate = ezWebTemplate.replace(GADGET_TITLE, name)
    ezWebTemplate = ezWebTemplate.replace(GADGET_VENDOR, vendor)
    ezWebTemplate = ezWebTemplate.replace(GADGET_VERSION, version)
    ezWebTemplate = ezWebTemplate.replace(GADGET_AUTHOR, author)
    ezWebTemplate = ezWebTemplate.replace(GADGET_EMAIL, email)
    ezWebTemplate = ezWebTemplate.replace(GADGET_DESCRIPTION, info)
    
    for slot in slots:
        ezWebTemplate = ezWebTemplate.replace(GADGET_SLOT, __getTemplateSlot(slot) + '\n' + GADGET_SLOT, 1)
        
    for event in events:
        ezWebTemplate = ezWebTemplate.replace(GADGET_EVENT, __getTemplateEvent(event) + '\n' + GADGET_EVENT, 1)
    
    ezWebTemplate = ezWebTemplate.replace(GADGET_SLOT, '', 1)
    ezWebTemplate = ezWebTemplate.replace(GADGET_EVENT, '', 1)
    
    return ezWebTemplate

def __getTemplateSlot(slot):
    slotTemplate = Template('<Slot name="$name" type="text" label="$label" friendcode="$friendcode"/>')
    return slotTemplate.substitute(name=slot.name, label=slot.label, friendcode=slot.friendcode)
    
def __getTemplateEvent(event):
    slotTemplate = Template('<Event name="$name" type="text" label="$label" friendcode="$friendcode"/>')
    return slotTemplate.substitute(name=event.name, label=event.label, friendcode=event.friendcode)

def getEzWebHTML(base, url, name, list, slots, events):
        
    screenflowTemplate = open(base + '/fast.ezweb.html', 'r')
    html = screenflowTemplate.read()
    screenflowTemplate.close()
    for screenId in list:
        if (SCREENS[screenId]):
            screenTemplate = open(base + '/' + screenId + '.scr.html', 'r')
            screenHTML = screenTemplate.read()
            screenTemplate.close()
            html = html.replace(SCREEN_DEF, SCREENS[screenId] + '\n' + SCREEN_DEF, 1)
            html = html.replace(SCREEN_HTML, screenHTML + '\n' + SCREEN_HTML, 1)
            
    for slot in slots:
        html = html.replace(GADGET_SLOT, __getHTMLSlot(slot) + '\n' + GADGET_SLOT, 1)
        
    for event in events:
        html = html.replace(GADGET_EVENT, __getHTMLEvent(event) + '\n' + GADGET_EVENT, 1)
    
    html = html.replace(SCREEN_DEF, '', 1)
    html = html.replace(SCREEN_HTML, '', 1)
    html = html.replace(GADGET_URL, url)
    html = html.replace(GADGET_TITLE, name)
    html = html.replace(GADGET_SLOT, '', 1)
    html = html.replace(GADGET_EVENT, '', 1)
    return html

def __getHTMLSlot(slot):
    slotTemplate = Template('''
        var $name = EzWebAPI.createRGadgetVariable("$name", set$name);\n
        function set$name(val){\n
        \tvar fact = EngineFactory.getInstance().transformFact("$fact_name", "$fact_attr", val);\n
        \tEngineFactory.getInstance().manageVarFacts([fact],[]);\n
        }'''
        );
    return slotTemplate.substitute(name=slot.name, fact_name=slot.fact_name, fact_attr=slot.fact_attr)
    
def __getHTMLEvent(event):
    eventTemplate = Template('''
        var $name = EzWebAPI.createRWGadgetVariable("$name");\n
        getEventVariables(events, "$fact_name").set("$name", {variable: $name, fact_attr: "$fact_attr"});
        ''')
    return eventTemplate.substitute(name=event.name, fact_name=event.fact_name, fact_attr=event.fact_attr)
