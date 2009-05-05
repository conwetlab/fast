"""FAST variable filters."""

from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

###################
# STRINGS         #
###################

@register.filter
@stringfilter
def capAndCut(value):
    """
    Replaces the spaces with _ 
    """
    return value.replace(' ', '_')
capAndCut.is_safe = True

@register.filter
@stringfilter
def hash(h,key):
    """
    Extracts a key value from a hash 
    """
    if key in h:
        return h[key]
    else:
        return None
hash.is_safe = True
