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
import StringIO

import os
import codecs

from datetime import datetime

from django.conf import settings

from django.utils.translation import ugettext as _

class FileLogManager:
    logging = 2   #Default value

    def __init__(self, logging_level):
        self.logging = logging_level

    def open_file(self, file_name):
        try:
            log_file = os.path.join(settings.LOG_PATH, file_name + '.log')
        except Exception:
            log_file = os.path.join(settings.MEDIA_ROOT, 'logs', file_name + '.log')

        return codecs.open(log_file, "a+", "utf-8")

    def write_text(self, message, file_name):
        """Prints text to file_name log file and INSERT a line separator"""

        #Not logging when level == 0
        if self.logging == 0:
            return

        try:
            f = self.open_file(file_name)

            line = unicode('%s' % (message))
            f.write(line)
            f.close()
        except UnicodeDecodeError, e:
            print e
        except IOError, e:
            print e

    def write_log_header(self, request, response, file_name):
        """Prints request general info and DO NOT insert a line separator"""

        #Not logging when level == 0
        if self.logging == 0:
            return

        try:
            f = self.open_file(file_name)

            if request.user.username == "":
                user = "[" + _("Anonymous") + "]"
            else:
                user = request.user.username

            if response == None:
                line = unicode('\n[%s]  %s  %s  %s  %s' % ( datetime.today().strftime('%d/%m/%Y %H:%M:%S'), request.method, request.path, user, 'ERROR'))
            else:
                line = unicode('\n[%s]  %s  %s  %s  %s' % ( datetime.today().strftime('%d/%m/%Y %H:%M:%S'), request.method, request.path, user, response.status_code))

            f.write(line)

            f.close()
        except UnicodeDecodeError, e:
            print e
        except IOError, e:
            print e
