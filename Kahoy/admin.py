from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name']
    search_fields = ['email', 'name']
    fields = ['email', 'name', 'is_active', 'is_staff']