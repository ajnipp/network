from .models import User, Post

def get_all_user_posts(username):
    """
    Gets all user posts and returns as a list of Django model objects. Will throw User.DoesNotExist
    exception if the username does not match a user.
    """
    user = User.objects.get(username=username)
    posts = Post.objects.filter(author=user).order_by('-timestamp_created')
    return posts