from django.utils.translation import ugettext as _

from django.utils.translation import ugettext as _

from django.contrib.auth.models import User

from django.contrib.auth.views import logout_then_login

class Http403(Exception):
    pass

def user_authentication(request, user_name):
    user = request.user
    if not user.is_authenticated():
        raise Http403 (_("You must be logged"))

    if user_name and user.username != user_name:
        raise Http403 (_("You do not have permission"))

    return user

def get_user_authentication(request):
    user = request.user
    if not user.is_authenticated():
        raise Http403 (_("You must be logged"))

    return user

def logout(request, login_url):
    return logout_then_login(request, login_url)
