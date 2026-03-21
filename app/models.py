from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

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
    completed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.timeDue and self.timeDue < timezone.now():
            self.overdue = True
        super().save(*args, **kwargs)

    def __str__(self):
        return self.taskName

    