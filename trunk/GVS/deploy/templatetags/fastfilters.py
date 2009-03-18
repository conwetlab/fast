"""FAST variable filters."""

from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

###################
# STRINGS         #
###################

#TODO is this class needed?

@register.filter
@stringfilter
def cap_and_cut(value):
    """
    Replaces the spaces with _ 
    """
    return value.replace(' ', '_')
cap_and_cut.is_safe = True
