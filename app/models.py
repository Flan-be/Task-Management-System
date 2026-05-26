# app/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

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
    timeDue = models.DateTimeField(null=True, blank=True)
    overdue = models.BooleanField(default=False)
    taskDescription = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.timeDue and self.timeDue < timezone.now():
            self.overdue = True
        super().save(*args, **kwargs)

    def __str__(self):
        return self.taskName
    
class Report(models.Model):
    STATUS_CHOICES = [
        ('complete', 'Complete'),
        ('incomplete', 'Incomplete'),
        ('blocked', 'Blocked'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='reports')
    submitted_by = models.ForeignKey(
        'kahoy_app.User', on_delete=models.CASCADE, related_name='reports'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    comment = models.TextField(blank=True)
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        'kahoy_app.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reviewed_reports'
    )

    def __str__(self):
        return f"Report for {self.task.taskName} - {self.status}"
    
class ReportMessage(models.Model):
    SENDER_CHOICES = [
        ('member', 'Member'),
        ('manager', 'Manager'),
    ]
    report = models.ForeignKey('Report', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('kahoy_app.User', on_delete=models.CASCADE)
    sender_role = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender_role} - {self.created_at}"