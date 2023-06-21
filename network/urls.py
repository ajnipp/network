
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API urls
    path("post", views.publish, name="publish"),
    path("posts/user/<str:username>", views.user_posts, name="user_posts"),
    path("post/<int:post_id>", views.post, name="post"),
    path("posts/all", views.all_posts, name="all_posts"),
    path("user/<str:username>", views.user, name="user"),
    path("following", views.following_posts, name="following"),
]
