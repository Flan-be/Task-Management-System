from rest_framework import serializers
from .models import Project, Task

# serializers.py

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'taskName', 'taskDescription', 'priorityLevel', 'project', 'timeDue', 'overdue', 'completed']

class ProjectSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'projectName', 'projectDescription', 'priorityLevel', 'tasks']