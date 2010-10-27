from django.core.management.base import BaseCommand, CommandError
from django.http import HttpResponse
from django.utils import simplejson
from django.conf import settings

from buildingblock.models import BuildingBlock

from python_rest_client.restful_lib import Connection, isValidResponse
from commons.utils import json_encode, cleanUrl
from optparse import make_option

import os
from os import path
import re

class Command(BaseCommand):
    concepts_url = cleanUrl(settings.CATALOGUE_URL) + "/concepts"
    help = "Republish all the building block's into the catalogue"
    option_list = BaseCommand.option_list + (
        make_option('--concepts', '-c',
            action='store',
            dest='concepts_dir',
            type='string',
            help='Publish all the concepts stored in the parameter dir'),
        make_option('--all', '-a',
            action='store_true',
            dest='all',
            help='Share all the building blocks instead the previously shared ones'),
    )


    def handle(self, *args, **options):
        if options["all"]:
            bb_list = BuildingBlock.objects.all()
        else:
            bb_list = BuildingBlock.objects.exclude(uri=None)
        for bb in bb_list:
            bb = bb.child_model()
            if bb.uri != None and bb.uri != '':
                try:
                    bb.unshare()
                except Exception, e:
                    print e

            bb.compile_code()
            try:
                bb.share()
            except Exception, e:
                print e

        concepts_dir = options["concepts_dir"]
        if concepts_dir:
            if not path.isdir(concepts_dir):
                raise CommandError("'%s' is not a valid directory" % concepts_dir)

            json_pattern = re.compile(r'^.*\.json$')
            for filename in filter(json_pattern.match, os.listdir(concepts_dir)):
                filepath = path.join(concepts_dir, filename)
                print "\nImporting %s..." % filepath,
                f = open(filepath)
                concepts = simplejson.load(f)
                for concept in concepts:
                    conn = Connection(self.concepts_url)
                    body = simplejson.dumps(concept)
                    result = conn.request_post('', body=body, headers={'Accept':'text/json'})
                    if isValidResponse(result):
                        print "OK ",
                    else:
                        print "Error"
                        print result
