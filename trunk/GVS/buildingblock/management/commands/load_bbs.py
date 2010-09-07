from django.core.management.base import BaseCommand, CommandError
from django.utils import simplejson
from django.contrib.auth.models import User

from buildingblock.models import BuildingBlock
from buildingblock.views import create_bb

from commons.utils import json_encode, cleanUrl
from optparse import make_option

import os
from os import path
import re

class Command(BaseCommand):
    args = "GVS_data_dir"
    help = "Empties the building block database and load it again"
    option_list = BaseCommand.option_list + (
        make_option('--delete', '-d',
            action='store_true',
            dest='delete',
            default=False,
            help='Delete existing building blocks before creating the new ones'),
    )

    def handle(self, *args, **options):
        if len(args) == 0:
            raise CommandError("GVS_Data folder is missing")
        elif len(args) > 1:
            raise CommandError("more than one GVS_Data folder")

        gvs_data = args[0]
        if not path.isdir(gvs_data):
            raise CommandError("'%s' is not a valid directory" % gvs_data)

        # Delete old building blocks
        if options["delete"]:
            BuildingBlock.objects.all().delete()

        # Create the new building blocks
        json_pattern = re.compile(r'^.*\.json$')
        for bbtype in ("form", "operator", "resource", "screen",):
            bbdir = path.join(gvs_data, bbtype + "s")
            for filename in filter(json_pattern.match, os.listdir(bbdir)):
                filepath = path.join(bbdir,filename)
                print "Importing %s... " % filepath,
                f = open(filepath)
                create_bb(simplejson.load(f), bbtype, User.objects.get(id=1))
                print "OK"

