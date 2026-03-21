from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


# Create your models here.

class Project(models.Model):
    projectName = models.CharField(max_length=255)
    priorityLevel = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    projectDescription = models.TextField(blank=True, null=True)

class Task(models.Model):
    taskName = models.CharField(max_length=255)
    priorityLevel = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    timeDue = models.DateTimeField()
    overdue = models.BooleanField(default=False)
    taskDescription = models.TextField(blank=True, null=True)