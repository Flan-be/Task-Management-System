from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Project, Task
from .serializers import (
    ProjectSerializer, TaskSerializer,
    MemberSerializer, TaskAssignmentSerializer,
    ProjectMemberCreateSerializer, ProjectMemberSerializer
)
from Kahoy.models import User, TaskAssignment, ProjectMember
from Kahoy.serializers import CurrentUserSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'overdue']

    def get_queryset(self):
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
        Task.objects.filter(timeDue__lt=now, overdue=False).update(overdue=True)
        return Task.objects.all()


class UpdateProfileImageView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = CurrentUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='member')

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Only leaders can create member accounts.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class TaskAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = TaskAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task', 'user']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'member':
            return TaskAssignment.objects.filter(user=user).select_related('task', 'task__project')
        return TaskAssignment.objects.all().select_related('task', 'task__project')

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['leader', 'admin']:
            return Response(
                {'error': 'Only leaders can assign tasks.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], url_path='complete')
    def mark_complete(self, request, pk=None):
        assignment = self.get_object()
        if request.user != assignment.user:
            return Response({'error': 'Not your task.'}, status=403)
        assignment.task.completed = True
        assignment.task.save()
        return Response({'status': 'Task marked complete.'})
    

class ProjectMemberViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request, project_pk=None):
        """List all members of a project"""
        members = ProjectMember.objects.filter(
            project_id=project_pk
        ).select_related('user', 'project')
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data)

    def create(self, request, project_pk=None):
        """Create a new member account for a project"""
        if request.user.role not in ['leader', 'admin']:
            return Response({'error': 'Only leaders can create members.'}, status=403)

        data = {**request.data, 'project': project_pk}
        serializer = ProjectMemberCreateSerializer(data=data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(serializer.to_representation(result), status=201)
        return Response(serializer.errors, status=400)

    def destroy(self, request, project_pk=None, pk=None):
        """Remove a member from a project"""
        if request.user.role not in ['leader', 'admin']:
            return Response({'error': 'Only leaders can remove members.'}, status=403)
        try:
            membership = ProjectMember.objects.get(project_id=project_pk, user_id=pk)
            membership.delete()
            return Response(status=204)
        except ProjectMember.DoesNotExist:
            return Response({'error': 'Member not found.'}, status=404)


class AssignTaskToMemberView(APIView):
    """Assign a task to a member within a project"""
    permission_classes = [IsAuthenticated]

    def post(self, request, project_pk=None):
        if request.user.role not in ['leader', 'admin']:
            return Response({'error': 'Only leaders can assign tasks.'}, status=403)

        task_id = request.data.get('task')
        user_id = request.data.get('user')

        # Verify task belongs to project
        try:
            task = Task.objects.get(id=task_id, project_id=project_pk)
        except Task.DoesNotExist:
            return Response({'error': 'Task not in this project.'}, status=400)

        # Verify user is member of project
        if not ProjectMember.objects.filter(project_id=project_pk, user_id=user_id).exists():
            return Response({'error': 'User is not a member of this project.'}, status=400)

        assignment, created = TaskAssignment.objects.get_or_create(task=task, user_id=user_id)
        return Response({'status': 'assigned', 'created': created})

    def delete(self, request, project_pk=None):
        """Unassign a task from a member"""
        task_id = request.data.get('task')
        user_id = request.data.get('user')
        TaskAssignment.objects.filter(task_id=task_id, user_id=user_id).delete()
        return Response(status=204)