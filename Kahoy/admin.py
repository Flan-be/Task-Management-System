from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'profile_image']
    search_fields = ['email', 'name']
    fields = ['email', 'name', 'profile_image', 'is_active', 'is_staff']