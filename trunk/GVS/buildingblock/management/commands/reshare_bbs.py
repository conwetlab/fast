from django.core.management.base import BaseCommand, CommandError
from django.http import HttpResponse
from django.utils import simplejson

from buildingblock.models import BuildingBlock
from buildingblock.views import unshareBuildingBlock

from python_rest_client.restful_lib import Connection, isValidResponse
from commons.utils import json_encode, cleanUrl

class Command(BaseCommand):

    def handle(self, *args, **options):
        for bb in BuildingBlock.objects.exclude(uri=None):
            try:
                unshareBuildingBlock(bb)
            except Exception, e:
                pass
            conn = Connection(cleanUrl(bb.get_catalogue_url()))
            body = bb.data
            result = conn.request_post('', body=body, headers={'Accept':'text/json'})
            if isValidResponse(result):
                response = HttpResponse(result['body'], mimetype='application/json; charset=UTF-8')
                bb.data = response.content
                obj = simplejson.loads(response.content)
                bb.uri = obj['uri']
                bb.save()
