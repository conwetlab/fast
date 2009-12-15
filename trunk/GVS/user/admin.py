from django.contrib import admin
from user.models import UserProfile

class AdminUserProfile (admin.ModelAdmin):
    list_display   = ('id', 'user',)
    ordering       = ('id',)
    
admin.site.register(UserProfile, AdminUserProfile)