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
from django.db.models import Q
from buildingblock.models import BuildingBlock, Screenflow, Screen, Form, Operator, Resource
import re
from datetime import datetime


def check_required_fields(fields, data):
    emptyFields = []

    for field in fields:
        if not data.has_key(field) or data[field] == '':
            emptyFields.append(field)

    return emptyFields

def print_plain_list(list):
    result = ''
    if len(list) > 0:
        result += list[0]

    for i in range(1, len(list)):
        result += ', ' + list[i]

    return result

def proccess_filter_operand(operand):
    filter = {}
    if not operand.has_key('type'):
        raise Exception('The field "type" is required')

    if operand['type'] == "field":
        emptyFields = check_required_fields(['field', 'value', 'condition'],
                                            operand)
        if len(emptyFields) > 0:
            msg = 'The following required fields are empty for "field" type operator: %(emptyFields)s'
            msg = msg % {'emptyFields': print_plain_list(emptyFields)}
            raise Exception(msg)

        value = operand['value']
        field = operand['field']

        if is_blacklisted_field(field):
            raise Exception("Invalid field: %(field)" % {'field': field})

        if operand['condition'] == "is":
            filter[str(operand['field'])] = value
        elif operand['condition'] == "contains":
            filter[str(operand['field'] + "__icontains")] = value
        elif operand['condition'] == "greater":
            filter[str(operand['field'] + "__gt")] = value
        elif operand['condition'] == "less":
            filter[str(operand['field'] + "__lt")] = value
        else:
            raise Exception("Invalid operand: %s" % operand['condition'])

        return Q(**filter)
    elif operand['type'] == "and":
        q = Q()
        for andOperand in operand['operands']:
            q = q & proccess_filter_operand(andOperand)

        return q
    elif operand['type'] == "or":
        q = Q()
        for orOperand in operand['operands']:
            q = q & proccess_filter_operand(orOperand)

        return q
    else:
        raise Exception('Invalid operand type: %(type)s' % {'type': operand['type']})

    return None

def is_blacklisted_field(field):
    blacklist = ["author(?:_.+|)"]
    for test in blacklist:
        if re.match(test, field):
            return True

    return False


def get_info_field(model, field):
    steps = field.split('_')
    result = model
    for step in steps:
        result = getattr(result, step)

    return result



def create_bb(data, bbtype, author, server_url=None):

    now = datetime.utcnow()
    # Drop microseconds
    now = datetime(now.year, now.month, now.day, now.hour, now.minute, now.second)

    data['creationDate'] = now.isoformat() + "+0000" #UTC
    if data.get('version') == '':
        data['version'] = now.strftime("%Y%m%d-%H%M")

    bb = None
    if bbtype == 'screenflow':
        bb = Screenflow(author=author, name=data.get('name'), version=data.get('version'))
    elif bbtype == 'screen':
        bb = Screen(author=author, name=data.get('name'), version=data.get('version'))
    elif bbtype == 'form':
        bb = Form(author=author, name=data.get('name'), version=data.get('version'))
    elif bbtype == 'operator':
        bb = Operator(author=author, name=data.get('name'), version=data.get('version'))
    elif bbtype == 'resource':
        bb = Resource(author=author, name=data.get('name'), version=data.get('version'))
    else:
        raise Exception(_('Expecting building block type.'))

    bb.creationDate = now
    bb.save()

    bb.create_code_structure(data)
    bb.update_unbound_code(data, server_url)

    bb.update_tags(data.get('tags'))

    json_data = bb.complete_bb_data(data)
    bb.save()

    return json_data
