from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import TaskAssignment
from app.models import Task  # ← add this

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'password')

class UserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'profile_image', 'role')

class CurrentUserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        model = User
        fields = ['id', 'email', 'name', 'profile_image', 'role']

class TaskAssignmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='member'),
        source='user',
        write_only=True
    )

    class Meta:
        model = TaskAssignment
        fields = ['id', 'user', 'user_id', 'assigned_at']

class TaskSerializer(serializers.ModelSerializer):
    assignments = TaskAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Task  # ← now works
        fields = [
            'id', 'taskName', 'priorityLevel', 'project',
            'timeDue', 'overdue', 'taskDescription', 'completed',
            'assignments'
        ]