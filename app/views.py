from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer


# Create your views here.

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
        print("Now UTC:", now)
        updated = Task.objects.filter(
        timeDue__lt=now,
        overdue=False
        ).update(overdue=True)
        print("Tasks updated to overdue:", updated)
        return Task.objects.all()