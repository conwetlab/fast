# Django settings for GVS project.

# Django settings for mymem project.
from os import path
from django.utils.translation import ugettext_lazy as _

DEBUG = True
TEMPLATE_DEBUG = DEBUG

APPEND_SLASH=False

BASEDIR = path.dirname(path.abspath(__file__))

ADMINS = (
    # ('Your Name', 'your_email@domain.com')
)

MANAGERS = ADMINS

DATABASE_ENGINE = 'postgresql_psycopg2'           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
#DATABASE_OPTIONS = {"init_command": "SET storage_engine=InnoDB"}
DATABASE_NAME = 'fast'             # Or path to database file if using sqlite3.
DATABASE_USER = 'fast'             # Not used with sqlite3.
DATABASE_PASSWORD = 'fast'         # Not used with sqlite3.
DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Madrid'
DATE_FORMAT = 'd/m/Y'

#Encoding
DEFAULT_CHARSET = 'utf-8'
FILE_CHARSET = 'utf-8'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = path.join(BASEDIR, 'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = '/fast/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/media/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'uw0p=0t07t6uk-n2^62y69n1^tw0n-gqbb^4ppm7a(0fd1cusv'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.load_template_source',
    'django.template.loaders.app_directories.load_template_source',
#     'django.template.loaders.eggs.load_template_source',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'processors.context_processors.fast'
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
)

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
    path.join(BASEDIR, 'fast','templates'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'fast',
    'storage',
    'user',
    'buildingblock',
)

#Authentication
AUTHENTICATION_BACKENDS = (
'django.contrib.auth.backends.ModelBackend',
)

LOGIN_REDIRECT_URL = "/"

FORCE_SCRIPT_NAME=""

SESSION_COOKIE_NAME='fastgvsid'
SESSION_COOKIE_AGE = 5184000    #2 months
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

REGISTRATION_CONFIRMATION = False
ACCOUNT_ACTIVATION_DAYS = 7
REGISTRATION_SENDER="noreply@host.com"
EMAIL_USE_TLS = True
EMAIL_HOST = 'hostname'
EMAIL_HOST_USER = 'username'
EMAIL_HOST_PASSWORD = 'pwd'
EMAIL_PORT = 25

AUTH_PROFILE_MODULE = 'user.UserProfile'

NOT_PROXY_FOR = ['localhost', '127.0.0.1']

# Url to the server that holds the semantic catalogue
CATALOGUE_URL = 'http://localhost:9000/FASTCatalogue'

# Url to the server that holds the storage service (empty if local storage in GVS)
STORAGE_URL = 'http://fast.cyntelix.com/Storage/v1.2/Service.svc'

# Format of the gadget sent to storage service ('URL' or 'base64string')
STORAGE_FORMAT = 'base64string'

# Url to the ezweb platform where the gadgets will be deployed
EZWEB_URL = 'http://localhost:8000/'

# Url of the wrapping service
WRAPPER_SERVICE_URL = 'http://tomdev.cs.uni-kassel.de:8080/ServiceDesignerWep/'
DATA_MEDIATION_URL = 'http://fast.morfeo-project.eu' # To be modified
FACT_TOOL_URL = 'http://fast.morfeo-project.eu' # To be modified

#Gadget Default Info
DEFAULT_GADGET_IMAGE_URI='http://demo.fast.morfeo-project.org/fast/images/FASTLogo.png'
DEFAULT_GADGET_HOMEPAGE_URI='http://fast.morfeo-project.eu'
DEFAULT_EZWEB_GADGET_HEIGHT='40'
DEFAULT_EZWEB_GADGET_WIDTH='10'
DEFAULT_EZWEB_AUTHOR_NAME='FAST'
DEFAULT_EZWEB_AUTHOR_EMAIL='admin@admin.com'

ONLY_ONE_JS_FILE = not DEBUG

try:
    from settings_local import *
except ImportError:
    pass

