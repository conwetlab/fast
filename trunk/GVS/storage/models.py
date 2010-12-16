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
        json = simplejson.loads(self.data)
        if json['gadgetResource'] != None:
            conn = Connection(json['gadgetResource'])
            result = conn.request_delete(resource='', headers={'Accept':'application/json'})
            if not isValidResponse(result):
                raise Exception(result['body'])

        gadget_relative_path = str(self.pk)
        gadget_path = path.join(STORAGE_DIR, gadget_relative_path)
        if path.isdir(gadget_path):
            shutil.rmtree(gadget_path)
        super(Storage, self).delete(*args, **kwargs)

    class Meta:
        unique_together = ('name', 'owner', 'version')
