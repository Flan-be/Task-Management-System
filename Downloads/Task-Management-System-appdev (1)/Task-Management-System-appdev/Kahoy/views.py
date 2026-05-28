from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .models import TaskAssignment
from .serializers import TaskAssignmentSerializer, UserSerializer, TaskSerializer, TaskReportSerializer
from app.models import Task
from django.utils import timezone


User = get_user_model()

class IsAdminOrLeader(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'leader']

class MemberListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrLeader]
    queryset = User.objects.filter(role='member')

class TaskAssignmentListView(generics.ListCreateAPIView):
    serializer_class = TaskAssignmentSerializer
    permission_classes = [IsAdminOrLeader]

    def get_queryset(self):
        return TaskAssignment.objects.filter(task_id=self.kwargs['task_id'])

    def perform_create(self, serializer):
        task = Task.objects.get(pk=self.kwargs['task_id'])
        serializer.save(task=task)

class TaskAssignmentDetailView(generics.DestroyAPIView):
    serializer_class = TaskAssignmentSerializer
    permission_classes = [IsAdminOrLeader]
    queryset = TaskAssignment.objects.all()

class TaskReportView(generics.RetrieveUpdateAPIView):
    serializer_class = TaskReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TaskAssignment.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        is_completed = self.request.data.get("is_completed")
        if is_completed is True:
            serializer.save(completed_at=timezone.now())
            serializer.instance.task.completed = True     
            serializer.instance.task.save()
        elif is_completed is False:
            serializer.save(completed_at=None)
            serializer.instance.task.completed = False     
            serializer.instance.task.save()
        else:
            serializer.save()