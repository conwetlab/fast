from django.db import models
from django.contrib.auth.models import User

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
    version = models.CharField(max_length=150)
    data = models.TextField()
    popularity = models.DecimalField(null=True, max_digits=3, decimal_places=2)
    
    class Meta:
        unique_together = ('name', 'type', 'version')
        
    def __unicode__(self):
        return u'%s %s: %s' % (self.type, self.pk, self.name)
 
class Screenflow(BuildingBlock):
    ezWebStoreURL = models.URLField(null=True)
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
        
    def __unicode__(self):
        return u'%s:' % (self.buildingBlock, )
    
class Tag(models.Model):
    name = models.CharField(max_length=20, unique = True)
    
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