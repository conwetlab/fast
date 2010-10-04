from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from commons.utils import cleanUrl

VOTES = (
    (u'0', 0),
    (u'1', 1),
    (u'2', 2),
    (u'3', 3),
    (u'4', 4),
    (u'5', 5),
)

BBTYPE = (
    (u'screenflow', 'screenflow'),
    (u'screen', 'screen'),
    (u'form', 'form'),
    (u'operator', 'operator'),
    (u'resource', 'resource'),
)

class BuildingBlock(models.Model):
    type = models.CharField(max_length=15, choices=BBTYPE)
    author = models.ForeignKey(User)
    name = models.CharField(max_length=150)
    creationDate = models.DateTimeField()
    version = models.CharField(max_length=150)
    data = models.TextField()
    popularity = models.DecimalField(null=True, max_digits=3, decimal_places=2)
    uri = models.URLField(null=True, db_index=True)

    class Meta:
        unique_together = ('name', 'type', 'version')

    def __unicode__(self):
        return u'%s %s: %s' % (self.type, self.pk, self.name)

    def get_catalogue_url(self):
        if self.type == "screenflow":
            return cleanUrl(settings.CATALOGUE_URL) + "/screenflows"
        elif self.type == "screen":
            return cleanUrl(settings.CATALOGUE_URL) + "/screens"
        elif self.type == "form":
           return cleanUrl(settings.CATALOGUE_URL)  + "/forms"
        elif self.type == "operator":
            return cleanUrl(settings.CATALOGUE_URL) + "/operators"
        elif self.type == "resource":
            return cleanUrl(settings.CATALOGUE_URL)  + "/services"
        else:
            return cleanUrl(settings.CATALOGUE_URL)

class Screenflow(BuildingBlock):
    def __unicode__(self):
        return u'Screenflow %s: %s' % (self.pk, self.name)

class Screen(BuildingBlock):
    def __unicode__(self):
        return u'Screen %s: %s' % (self.pk, self.name)

class Form(BuildingBlock):
    def __unicode__(self):
        return u'Form %s: %s' % (self.pk, self.name)

class Operator(BuildingBlock):
    def __unicode__(self):
        return u'Operator %s: %s' % (self.pk, self.name)

class Resource(BuildingBlock):
    def __unicode__(self):
        return u'Resource %s: %s' % (self.pk, self.name)

class BuildingBlockCode(models.Model):
    buildingBlock = models.ForeignKey(BuildingBlock, unique = True)
    code = models.TextField(null=True)
    unboundCode = models.TextField(null=True)

    def __unicode__(self):
        return u'%s:' % (self.buildingBlock, )

class Tag(models.Model):
    name = models.CharField(max_length=20)
    language = models.CharField(max_length=20)
    means = models.URLField(null=True)

    class Meta:
        unique_together = ('name', 'language', 'means')

    def __unicode__(self):
        return self.name

class UserTag(models.Model):
    tag = models.ForeignKey(Tag)
    user = models.ForeignKey(User)
    buildingBlock = models.ForeignKey(BuildingBlock)

    class Meta:
        unique_together = ('tag', 'user', 'buildingBlock')

    def __unicode__(self):
        return u'%s: user %s tags %s' % (self.buildingBlock, self.user, self.tag, )


class UserVote(models.Model):
    user = models.ForeignKey(User)
    buildingBlock = models.ForeignKey(BuildingBlock)
    value = models.SmallIntegerField(null=True, choices=VOTES)

    class Meta:
        # One vote per user per object
        unique_together = ('user', 'buildingBlock')

    def __unicode__(self):
        return u'%s: user %s votes %s' % (self.buildingBlock, self.user, self.value, )
