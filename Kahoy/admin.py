from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'role', 'profile_image']
    search_fields = ['email', 'name']
    list_filter = ['role', 'is_active', 'is_staff']
    fields = ['email', 'name', 'role', 'profile_image', 'is_active', 'is_staff']