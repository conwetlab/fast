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
def capAndCut(value):
    """
    Replaces the spaces with _ 
    """
    return value.replace(' ', '_')
capAndCut.is_safe = True
