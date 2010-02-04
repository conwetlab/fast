from django.db.models import Q
import re

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
