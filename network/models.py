from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='followers')

class Post(models.Model):
    id = models.AutoField(primary_key=True)
    timestamp_created = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    body = models.CharField(max_length=140)
    users_who_liked = models.ManyToManyField(User, related_name='liked_posts')
    

