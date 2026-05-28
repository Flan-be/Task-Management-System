from rest_framework import serializers
from .models import Project, Task, Report, ReportMessage, KnowledgeBase, ChatMessage
from Kahoy.models import User, TaskAssignment, ProjectMember
import secrets
import string
from django.contrib.auth import get_user_model


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

# New serializers below:

class MemberSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'role']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data, role='member')
        user.set_password(password)
        user.save()
        return user

class TaskAssignmentSerializer(serializers.ModelSerializer):
    task_name = serializers.CharField(source='task.taskName', read_only=True)
    task_description = serializers.CharField(source='task.taskDescription', read_only=True)
    task_due = serializers.DateTimeField(source='task.timeDue', read_only=True)
    task_priority = serializers.IntegerField(source='task.priorityLevel', read_only=True)
    task_overdue = serializers.BooleanField(source='task.overdue', read_only=True)
    task_completed = serializers.BooleanField(source='task.completed', read_only=True)
    project_name = serializers.CharField(source='task.project.projectName', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)      
    user_name = serializers.CharField(source='user.name', read_only=True)    


    class Meta:
        model = TaskAssignment
        fields = [
            'id', 'task', 'task_name', 'task_description',
            'task_due', 'task_priority', 'task_overdue',
            'task_completed', 'project_name', 'assigned_at',
            'is_completed', 'report_status', 'comment', 'user_name', 
            'user_id',
        ]




class ProjectMemberCreateSerializer(serializers.Serializer):
    """Leader creates a new member account locked to a project"""
    name = serializers.CharField()
    email = serializers.EmailField()
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())

    def create(self, validated_data):
        # Auto-generate password
        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for _ in range(12))

        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=password,
            role='member',
        )

        ProjectMember.objects.create(
            project=validated_data['project'],
            user=user,
        )

        return {'user': user, 'password': password}

    def to_representation(self, instance):
        return {
            'id': instance['user'].id,
            'name': instance['user'].name,
            'email': instance['user'].email,
            'password': instance['password'],  # shown once
        }


class ProjectMemberSerializer(serializers.ModelSerializer):
    """List members of a project"""
    id = serializers.IntegerField(source='user.id')
    name = serializers.CharField(source='user.name')
    email = serializers.CharField(source='user.email')
    assigned_tasks = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMember
        fields = ['id', 'name', 'email', 'joined_at', 'assigned_tasks']

    def get_assigned_tasks(self, obj):
        assignments = TaskAssignment.objects.filter(
            user=obj.user,
            task__project=obj.project
        ).select_related('task')
        return [
            {
                'id': a.id,
                'task_id': a.task.id,
                'task_name': a.task.taskName,
                'completed': a.task.completed,
                'overdue': a.task.overdue,
                'is_completed': a.is_completed,       
                'report_status': a.report_status,     
                'comment': a.comment, 
            }
            for a in assignments
        ]
    


User = get_user_model()

class ReportMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)

    class Meta:
        model = ReportMessage
        fields = ['id', 'sender_name', 'sender_role', 'message', 'created_at']

class ReportSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.CharField(source='submitted_by.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.name', read_only=True)
    task_name = serializers.CharField(source='task.taskName', read_only=True)
    messages = ReportMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'task', 'task_name', 'submitted_by', 'submitted_by_name',
            'status', 'comment', 'feedback', 'reviewed_by', 'reviewed_by_name',
            'created_at', 'reviewed_at', 'messages',
        ]
        read_only_fields = ['submitted_by', 'reviewed_by', 'reviewed_at']


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeBase
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'