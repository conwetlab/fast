#...............................licence...........................................#
#
#    (C) Copyright 2011 FAST Consortium
#
#     This file is part of FAST Platform.
#
#     FAST Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     FAST Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the FAST Consortium
#     is available at
#
#     http://fast.morfeo-project.eu
#
#...............................licence...........................................#
from django.db import models
from buildingblock.models import Screenflow
from django.conf import settings
from django.utils import simplejson
from python_rest_client.restful_lib import Connection, isValidResponse

from os import path
import shutil


STORAGE_DIR = path.join(settings.BASEDIR, 'static')

class Storage(models.Model):
    name = models.CharField(max_length=150)
    owner = models.CharField(max_length=150)
    version = models.CharField(max_length=150)
    screenflow = models.ForeignKey(Screenflow)
    data = models.TextField()
    creationDate = models.DateTimeField(auto_now=True)

    def delete(self, *args, **kwargs):
        try:
            json = simplejson.loads(self.data)

            if json['gadgetResource'] != None:
                conn = Connection(json['gadgetResource'])
                result = conn.request_delete(resource='', headers={'Accept':'application/json'})
                if not isValidResponse(result):
                    raise Exception(result['body'])
        except Exception, e:
            pass

        gadget_relative_path = str(self.pk)
        gadget_path = path.join(STORAGE_DIR, gadget_relative_path)
        if path.isdir(gadget_path):
            shutil.rmtree(gadget_path)
        if self.id != None:
            super(Storage, self).delete(*args, **kwargs)

    class Meta:
        unique_together = ('name', 'owner', 'version')
