from django.db import models
from buildingblock.models import Screenflow

class Storage(models.Model):
    name = models.CharField(max_length=150)
    owner = models.CharField(max_length=150)
    version = models.CharField(max_length=150)
    screenflow = models.ForeignKey(Screenflow)
    data = models.TextField()
    creationDate = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'owner', 'version')