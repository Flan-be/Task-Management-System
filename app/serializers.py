from rest_framework import serializers
from .models import Project, Task

class TaskSerializer(serializers.ModelSerializer):
    timeDue = serializers.DateTimeField(
        required=False,
        allow_null=True,
        initial=None,
        input_formats=["%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "iso-8601"],
        style={'input_type': 'text', 'placeholder': 'YYYY-MM-DDTHH:MM:SS'}
    )

    class Meta:
        model = Task
        fields = ['id', 'taskName', 'taskDescription', 'priorityLevel', 'project', 'timeDue', 'overdue', 'completed']

class ProjectSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'projectName', 'projectDescription', 'priorityLevel', 'tasks']