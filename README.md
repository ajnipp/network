# Network
A social networking web app built with custom front and back ends. The front end was created with HTML, CSS, and JavaScript. The back end uses Django and 
SQLite. 

Much like Twitter, users can log in, share posts, like posts, and follow other users. The front end uses JavaScript and the Fetch API to let users interact with
the application without needless refreshing. This front end makes calls to a custom Django API that returns JSON responses. 

# Walkthrough
When a user first visits the site, they're brought to an "All Posts" feed. They cannot like or create posts until they log in.

<p align="center">
  <img src="images/all-feed-anon.png" width="500">
</p>

If a user hasn't created an account before, they can register with a username, email, and password.

<p align="center">
  <img src="images/register.png" width="500">
</p>

Once the user has logged in, they can create a new post!

<p align="center">
  <img src="images/new-post.png" width="500">
</p>

Users can also like posts. The like count/status will update without page refresh via an asynchronous JavaScript call to the back end API.

<p align="center">
  <img src="images/like-posts.png" width="500">
</p>

Users' feed is paginated, with a maximum of ten posts per page. This pagination is supported on both the front and back ends.

<p align="center">
  <img src="images/pagination.png" width="500">
</p>

Clicking on a username will navigate to their profile page. A user will then have the option to start following that profile.

<p align="center">
  <img src="images/profile-view.png" width="500">
</p>

Every user has a "Following" page where they can view all posts made by the profiles they follow, organized by date.

<p align="center">
  <img src="images/following-feed.png" width="500">
</p>

Users also have the opportunity to edit their own posts.

<p align="center">
  <img src="images/edit-post.png" width="500">
</p>

This project was completed with knowledge gained from Harvard's CS50W course.
