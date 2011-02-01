from django.db import models
from django.conf import settings
from django.utils import simplejson
from django.shortcuts import get_object_or_404
from django.template import Template, Context, loader
from urlparse import urljoin

from django.contrib.auth.models import User

from python_rest_client.restful_lib import Connection, isValidResponse

from commons.utils import cleanUrl, json_encode
from commons.httpUtils import validate_url, download_http_content

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
        pass # To be overriden

    def compile_code(self):
        pass # To be overriden

    def child_model(self):
        # For queries against BuildingBlock, it returns the child model instance
        return getattr(self, self.type)

    def complete_bb_data(self, data):
        if not data.has_key('creator'):
            data['creator'] = self.author.username
        if not data.has_key('id') or data.get('id') == None:
            data['id'] = self.pk
        if not data.has_key('type'):
            data['type'] = self.type

        self.data = json_encode(data)
        return self.data

    def create_code_structure(self, data):
        c = BuildingBlockCode.objects.get_or_create(buildingBlock=self)[0]

        # getting code
        code = None
        if data.has_key('codeInline'):
            code = data.get('codeInline')
        elif data.has_key('code'):
            code_url = data.get('code')
            if (validate_url(code_url)):
                code = download_http_content(code_url)
            else:
                raise Exception("Invalid Url in code parameter")

        c.unboundCode = code
        c.save()

    def update_unbound_code(self, data, server_url=None):
        c = BuildingBlockCode.objects.get(buildingBlock=self)
        if data.has_key('codeInline'):
            c.unboundCode = data.get('codeInline')
            c.save()
            if server_url:
                data['code'] = urljoin(server_url,'/buildingblock/%s/unbound_code' % (self.pk))

    def update_tags(self, tags, user=None):
        if not user:
            user = self.author
        for tag in tags:
            label = tag.get('label')
            means = None
            if tag.has_key('means'):
                means = tag.get('means')
            for lang in label.keys():
                t = Tag.objects.get_or_create(name=label.get(lang), language=lang, means=means)[0]
                usertag = UserTag.objects.get_or_create (user=user, tag=t, buildingBlock=self)[0]
                usertag.save()

    def share(self):
        if (self.uri == None) or (self.uri == ''):
            conn = Connection(cleanUrl(self.get_catalogue_url()))
            body = self.data
            result = conn.request_post('', body=body, headers={'Accept':'text/json'})
            if isValidResponse(result):
                self.data = result['body']
                obj = simplejson.loads(result['body'])
                self.uri = obj['uri']
                self.save()
            else:
                raise Exception(result['body'])
        else:
            conn = Connection(self.uri)
            result = conn.request_put('', body=self.data, headers={'Accept':'text/json'})
            if not isValidResponse(result):
                raise Exception(result['body'])


    def unshare(self):
        if (self.uri != None) and (self.uri != ''):
            conn = Connection(self.uri)
            result = conn.request_delete('', headers={'Accept':'text/json'})
            if not isValidResponse(result):
                raise Exception(result['body'])
            else:
                data = simplejson.loads(self.data)
                del data['uri']
                self.uri = None
                self.data = json_encode(data)
                self.save()

    def update_in_catalogue(self):
        if self.uri != None and self.uri != '':
            self.share()

    def delete(self, *args, **kwargs):
        self.unshare()
        super(BuildingBlock, self).delete(*args, **kwargs)

class Screenflow(BuildingBlock):
    def __unicode__(self):
        return u'Screenflow %s: %s' % (self.pk, self.name)

    def save(self, *args, **kwargs):
        self.type = "screenflow"
        super(BuildingBlock, self).save(*args, **kwargs)

    def get_catalogue_url(self):
        return cleanUrl(settings.CATALOGUE_URL) + "/screenflows"

    def compile_code(self):
        return None # Screenflow is not compiled here

    def delete(self, *args, **kwargs):
        for storage in self.storage_set.all():
            storage.delete()
        # Delete screen instances
        json = simplejson.loads(self.data)
        for screen in json['definition']['screens']:
            conn = Connection(screen['uri'])
            result = conn.request_delete('', headers={'Accept':'text/json'})
            if not isValidResponse(result):
                raise Exception(result['body'])
        super(Screenflow, self).delete(*args, **kwargs)



class Screen(BuildingBlock):
    def __unicode__(self):
        return u'Screen %s: %s' % (self.pk, self.name)

    def save(self, *args, **kwargs):
        self.type = "screen"
        super(BuildingBlock, self).save(*args, **kwargs)

    def get_catalogue_url(self):
        return cleanUrl(settings.CATALOGUE_URL) + "/screens"

    def compile_code(self):
        c = BuildingBlockCode.objects.get(buildingBlock=self)
        unbound_code = c.unboundCode

        data = simplejson.loads(self.data)
        if unbound_code:
            context = Context({'screenId': str(self.id)})
            t = Template(unbound_code)
            code =  t.render(context)
        elif data.has_key('definition'):
            bbcodes = {}
            definition = data.get('definition')
            for bbdefinition in definition['buildingblocks']:
                bb_aux = get_object_or_404(BuildingBlock, uri=bbdefinition.get('originalUri'))
                bbdata = simplejson.loads(bb_aux.data)
                bbdefinition['buildingblockId'] = bb_aux.id
                bbdefinition['type'] = bb_aux.type
                bbdefinition['actions'] = bbdata.get('actions')
                bbdefinition['parameter'] = bbdefinition.get('parameter')
                c_aux = get_object_or_404(BuildingBlockCode, buildingBlock=bb_aux)
                if not bbcodes.has_key(bb_aux.id):
                    if bb_aux.type == 'form':
                        context = Context({'buildingblockId': 'BB' + str(bb_aux.id),
                        'screenId': str(self.id), 'buildingblockInstance': bbdefinition['id']})
                        t = Template(c_aux.code)
                        code_aux = t.render(context)
                    else:
                        code_aux = c_aux.code
                    bbcodes[bb_aux.id] = {'libraries': bbdata.get('libraries'), 'code': code_aux, 'type': bbdefinition['type']}
            context = Context({'id': self.id, 'name': self.name, 'definition': definition, 'codes': bbcodes.itervalues(), 'pres': data.get('preconditions'), 'posts': data.get('postconditions')})
            t = loader.get_template('buildingblock/screen.html')
            code =  t.render(context)
        else: # Error
            code = None

        c.code = code
        c.save()
        return c



class Form(BuildingBlock):
    def __unicode__(self):
        return u'Form %s: %s' % (self.pk, self.name)

    def save(self, *args, **kwargs):
        self.type = "form"
        super(BuildingBlock, self).save(*args, **kwargs)

    def get_catalogue_url(self):
        return cleanUrl(settings.CATALOGUE_URL)  + "/forms"

    def compile_code(self):
        c = BuildingBlockCode.objects.get(buildingBlock=self)
        c.code = c.unboundCode
        c.save()
        return c


class Operator(BuildingBlock):
    def __unicode__(self):
        return u'Operator %s: %s' % (self.pk, self.name)

    def save(self, *args, **kwargs):
        self.type = "operator"
        super(BuildingBlock, self).save(*args, **kwargs)

    def get_catalogue_url(self):
        return cleanUrl(settings.CATALOGUE_URL) + "/operators"

    def compile_code(self):
        c = BuildingBlockCode.objects.get(buildingBlock=self)
        context = Context({'name': 'BB' + str(self.id), 'code': c.unboundCode})
        t = loader.get_template('buildingblock/code.js')
        c.code =  t.render(context)
        c.save()
        return c


class Resource(BuildingBlock):
    def __unicode__(self):
        return u'Resource %s: %s' % (self.pk, self.name)

    def save(self, *args, **kwargs):
        self.type = "resource"
        super(BuildingBlock, self).save(*args, **kwargs)

    def get_catalogue_url(self):
        return cleanUrl(settings.CATALOGUE_URL)  + "/services"

    def compile_code(self):
        c = BuildingBlockCode.objects.get(buildingBlock=self)
        context = Context({'name': 'BB' + str(self.id), 'code': c.unboundCode})
        t = loader.get_template('buildingblock/code.js')
        c.code =  t.render(context)
        c.save()
        return c


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
