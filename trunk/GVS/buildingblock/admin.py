from django.contrib import admin
from buildingblock.models import BuildingBlock, Screenflow, Screen, Form, Operator, Resource, BuildingBlockCode, UserVote, UserTag, Tag

class AdminTag (admin.ModelAdmin):
    list_display   = ('id', 'name',)
    ordering       = ('name', )

class AdminUserTag (admin.ModelAdmin):
    list_display   = ('id', 'buildingBlock', 'tag', 'user',)
    ordering       = ('buildingBlock', 'tag', 'user',)
    
class AdminUserVote (admin.ModelAdmin):
    list_display   = ('id', 'buildingBlock', 'user', )
    ordering       = ('buildingBlock', 'user', )
    
class AdminBuildingBlockCode (admin.ModelAdmin):
    list_display   = ('id', 'buildingBlock',)
    ordering       = ('buildingBlock',)
    
class AdminBuildingBlock (admin.ModelAdmin):
    list_display   = ('id', 'type', 'author', 'name', 'version',)
    ordering       = ('id',)
    
class AdminResource (admin.ModelAdmin):
    list_display   = ('id', 'author', 'name', 'version',)
    ordering       = ('id',)

class AdminOperator (admin.ModelAdmin):
    list_display   = ('id', 'author', 'name', 'version',)
    ordering       = ('id',)

class AdminForm (admin.ModelAdmin):
    list_display   = ('id', 'author', 'name', 'version',)
    ordering       = ('id',)

class AdminScreen (admin.ModelAdmin):
    list_display   = ('id', 'author', 'name', 'version',)
    ordering       = ('id',)

class AdminScreenflow (admin.ModelAdmin):
    list_display   = ('id', 'author', 'name', 'version',)
    ordering       = ('id',)

admin.site.register(Tag, AdminTag)
admin.site.register(UserTag, AdminUserTag)
admin.site.register(UserVote, AdminUserVote)
admin.site.register(BuildingBlockCode, AdminBuildingBlockCode)
admin.site.register(BuildingBlock, AdminBuildingBlock)
admin.site.register(Resource, AdminResource)
admin.site.register(Operator, AdminOperator)
admin.site.register(Form, AdminForm)
admin.site.register(Screen, AdminScreen)
admin.site.register(Screenflow, AdminScreenflow)

