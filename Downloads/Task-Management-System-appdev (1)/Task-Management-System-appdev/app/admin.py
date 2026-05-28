from django.contrib import admin
from .models import Project, Task, Report
from django.contrib.auth import get_user_model
# Register your models here.


admin.site.register(Project)
admin.site.register(Task)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['task', 'submitted_by', 'status', 'created_at', 'reviewed_by', 'reviewed_at']
    list_filter = ['status']
    search_fields = ['task__taskName', 'submitted_by__name']
