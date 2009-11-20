from django.db import models
from buildingblock.models import Screenflow

class Storage(models.Model):
    name = models.CharField(max_length=150)
    owner = models.CharField(max_length=150)
    version = models.CharField(max_length=150)
    screenflow = models.ForeignKey(Screenflow)
    gadgetURL = models.URLField(null=True)
    gadgetResource = models.URLField(null=True)
    gadgetPath = models.CharField(max_length=1000)
    creationDate = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'owner', 'version')