# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#

import types
from decimal import Decimal
from xml.dom.minidom import getDOMImplementation

from django.db import models
from django.core.serializers.json import DateTimeAwareJSONEncoder
from django.utils import simplejson
def cleanUrl(data):
    if data.endswith('/'):
        data = data[:-1]
    return data

def json_encode(data, ensure_ascii=False, fields=None):
    """
    The main issues with django's default json serializer is that properties that
    had been added to a object dynamically are being ignored (and it also has 
    problems with some models).
    """

    def _any(data, fields = None):
        ret = None
        if type(data) is types.ListType:
            ret = _list(data)
        elif type(data) is types.DictType:
            ret = _dict(data, fields)
        elif isinstance(data, Decimal):
            # json.dumps() cant handle Decimal
            ret = str(data)
        elif isinstance(data, models.query.QuerySet):
            # Actually its the same as a list ...
            ret = _list(data)
        elif isinstance(data, models.Model):
            ret = _model(data, fields)
        else:
            ret = data
        return ret
    
    def _model(data, fields):
        ret = {}
        # If we only have a model, we only want to encode the fields.
        for f in data._meta.fields:
            if(_validateField(f.attname, fields)):
                ret[f.attname] = _any(getattr(data, f.attname), _getFields(f.attname, fields))
        # And additionally encode arbitrary properties that had been added.
        f = dir(data.__class__) + ret.keys()
        add_ons = [k for k in dir(data) if k not in f]
        for k in add_ons:
            if(_validateField(k, fields)):
                ret[k] = _any(getattr(data, k), _getFields(k, fields))
        return ret
    
    def _list(data):
        ret = []
        for v in data:
            ret.append(_any(v))
        return ret
    
    def _dict(data, fields):
        ret = {}
        for k,v in data.items():
            if(_validateField(k, fields)):
                ret[k] = _any(v, _getFields(k, fields))
        return ret
    
    def _validateField(field, fields):
        if fields == None:
            return True
        return fields.has_key(field)
    
    def _getFields(field_name, fields):
        if fields == None:
            return None
        elif fields.has_key(field_name):
            return fields[field_name]
        return None
    
    ret = _any(data, fields)
    
    return simplejson.dumps(ret, cls=DateTimeAwareJSONEncoder, ensure_ascii=ensure_ascii)

def get_xml_error(value):
    dom = getDOMImplementation()

    doc = dom.createDocument(None, "error", None)
    rootelement = doc.documentElement
    text = doc.createTextNode(value)
    rootelement.appendChild(text)
    errormsg = doc.toxml("utf-8")
    doc.unlink()

    return errormsg

def multipleReplace(text, wordDict):
    for key in wordDict:
        text = text.replace(key, wordDict[key])
    return text

def presentAndNotEmpty(dict, key):
    return dict.get(key)!='' if dict.has_key(key) else false

def valueOrEmpty(dict, key):
    return valueOrDefault(dict, key, '')

def valueOrDefault(dict, key, default):
    return dict.get(key) if dict.has_key(key) else default

def notEmptyValueOrDefault(dict, key, default):
    return dict.get(key) if presentAndNotEmpty(dict, key) else default


