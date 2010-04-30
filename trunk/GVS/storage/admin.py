from django.contrib import admin
from storage.models import Storage

class AdminStorage (admin.ModelAdmin):
    list_display   = ('id', 'name', 'owner', 'version', 'screenflow', 'creationDate')
    ordering       = ('id', )

admin.site.register(Storage, AdminStorage)