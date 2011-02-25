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
from django.core.management.base import BaseCommand, CommandError
from django.utils import simplejson
from django.contrib.auth.models import User

from buildingblock.models import BuildingBlock
from buildingblock.utils import create_bb

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
    json_pattern = re.compile(r'^.*\.json$')

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
        for bbtype in ("form", "operator", "resource", "screen",):
            bbdir = path.join(gvs_data, bbtype + "s")
            self.__load_bb(bbdir, bbtype)

    def __load_bb(self, folder, bbtype):
        for filename in filter(Command.json_pattern.match, os.listdir(folder)):
            filepath = path.join(folder,filename)
            if not path.isdir(filepath):
                print "Importing %s... " % filepath,
                f = open(filepath)
                create_bb(simplejson.load(f), bbtype, User.objects.get(id=1))
                print "OK"
        for inner_folder in get_dirs(folder):
            self.__load_bb(inner_folder,bbtype)

def get_dirs(folder):
    return [ os.path.join(folder,name) for name in os.listdir(folder) if os.path.isdir(os.path.join(folder, name)) and re.match(r"\.svn",name) == None]

