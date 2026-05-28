"""
URL configuration for Kahoy project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from app.views import KnowledgeBaseView, UpdateProfileImageView, ChatbotView
from .views import MemberListView, TaskAssignmentListView, TaskAssignmentDetailView, TaskReportView
from django.http import JsonResponse

def debug_email(request):
    import os
    return JsonResponse({
        'EMAIL_HOST_USER': os.environ.get('EMAIL_HOST_USER'),
        'EMAIL_HOST': os.environ.get('EMAIL_HOST'),
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('app.urls')),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    path('api/auth/profile/image/', UpdateProfileImageView.as_view()),
    path('members/', MemberListView.as_view()),
    path('tasks/<int:task_id>/assignments/', TaskAssignmentListView.as_view()),
    path('tasks/<int:task_id>/assignments/<int:pk>/', TaskAssignmentDetailView.as_view()),
    path("api/assignments/<int:pk>/report/", TaskReportView.as_view()),
    path('chat/', ChatbotView.as_view()),
    path('knowledge/', KnowledgeBaseView.as_view()),
    path('debug-email/', debug_email),
]

