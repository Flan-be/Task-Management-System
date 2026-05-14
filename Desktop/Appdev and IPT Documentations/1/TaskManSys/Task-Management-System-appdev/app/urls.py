from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    ProjectViewSet, TaskViewSet,
    MemberViewSet, TaskAssignmentViewSet,
    ProjectMemberViewSet, AssignTaskToMemberView
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'members', MemberViewSet, basename='member')
router.register(r'assignments', TaskAssignmentViewSet, basename='assignment')

# Nested router: /projects/{project_pk}/members/
projects_router = routers.NestedDefaultRouter(router, r'projects', lookup='project')
projects_router.register(r'members', ProjectMemberViewSet, basename='project-members')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(projects_router.urls)),
    path('projects/<int:project_pk>/assign-task/', AssignTaskToMemberView.as_view()),
]