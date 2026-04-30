from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from rest_framework import viewsets
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from Kahoy.serializers import CurrentUserSerializer  # ← correct import

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