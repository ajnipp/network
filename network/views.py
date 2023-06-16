import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def publish(request):
    """
    Handles a POST request for a new post
    """
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)
    user = request.user

    post = Post(author=user, body = data['body'])
    print(post)
    post.save()

    print(data)

    return JsonResponse({"message": "Post created successfully."}, status=201)

def user_posts(request, username):
    page = request.GET.get('page', '1')
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    posts = Post.objects.filter(author=user).order_by('-timestamp_created')
    paginator = Paginator(posts, 10)
    out = paginator.page(page).object_list 
    return JsonResponse({"posts" : [post.serialize() for post in out],
                        "current_page": int(page),
                        "num_pages" : paginator.num_pages},
                        safe=False)
def all_posts(request):
    page = request.GET.get('page', '1')
    posts = Post.objects.all().order_by('-timestamp_created')
    paginator = Paginator(posts, 10)
    out = paginator.page(page).object_list 
    return JsonResponse({"posts" : [post.serialize() for post in out],
                        "current_page": page,
                        "num_pages" : paginator.num_pages},
                        safe=False)

@csrf_exempt
def post(request, post_id):
    """
    Handles GET and PUT requests to get or edit the post with the id. When successful,
    both return the current post in JSON form.
    """
    # Query for requested post
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)
    if request.method == 'GET':
        return JsonResponse(post.serialize())
    
    if request.method == 'PUT':
        if not request.user.is_authenticated:
             return JsonResponse({'error': 'User must be authenticated to like'})

        data = json.loads(request.body)

        if data.get("body") is not None:
            # User wants to update body
            if request.user != post.author:
                return JsonResponse({"error": "Must be the owner of the post to modify it!"})
            post.body = data.get("body")
            post.save()
            return JsonResponse(post.serialize(), safe=True)
        
        if data.get("like") is not None:
            try:
                liked = post.users_who_liked.get(pk=request.user.id)
                # if the user has liked the post already, remove them
                post.users_who_liked.remove(liked)
                post.save()
            except User.DoesNotExist:
                # if user hasn't liked it, add them to the list of likers
                post.users_who_liked.add(request.user)
                post.save()
            return JsonResponse(post.serialize(), safe=True)
