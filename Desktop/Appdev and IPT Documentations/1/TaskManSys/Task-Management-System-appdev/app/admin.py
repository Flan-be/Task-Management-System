from django.contrib import admin
from .models import Project, Task
from django.contrib.auth import get_user_model
# Register your models here.


admin.site.register(Project)
admin.site.register(Task)


