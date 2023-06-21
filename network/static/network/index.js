csrftoken = Cookies.get('csrftoken');
function publish_post(post) {
    fetch('/post', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrftoken },
        mode: 'same-origin', // Do not send CSRF token to another domain.
        body: JSON.stringify(post)
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log(error)
        });
}
function like_post(post_id) {
    if (current_username === '') {
        // User is not logged in, so redirect them
        alert("You must be logged in to like a post!");
        return
    }
    fetch(`/post/${post_id}`, {
        method: 'PUT',
        headers: { 'X-CSRFToken': csrftoken },
        mode: 'same-origin', // Do not send CSRF token to another domain.
        body: JSON.stringify({
            like: true
        })
    })
        .then(response => response.json())
        .then(post => {
            // Update the post's likes
            const post_container = document.querySelector(`[data-postid="${post.id}"]`)
            const like_count = post_container.querySelector('.post-likes')
            like_count.innerHTML = `${post.users_who_liked.length}`
            const like_icon = post_container.querySelector('i')
            like_icon.className = (post.users_who_liked.includes(current_username)) ? 'bi-heart-fill liked' : 'bi-heart'
            console.log(post.users_who_liked)
        })
        .catch(error => {
            console.log(error)
        })
}

function display_post(post, post_list) {
    const post_container = document.createElement('div')
    post_container.className = 'post-container'
    post_container.setAttribute('data-postid', post.id)
    const post_html =
        `
            <div class="post-author username-link">${post.author}</div>
            <div class="post-body">${post.body}</div>
            <div class="post-timestamp-created">${post.timestamp_created}</div>
            <button class="like-button" data-postid="${post.id}"><i class="${(post.users_who_liked.includes(current_username)) ? 'bi-heart-fill liked' : 'bi-heart'}"></i></button> <span class="post-likes">${post.users_who_liked.length}</span>
            `
    post_container.innerHTML = post_html
    post_list.append(post_container)
}

function link_user_pages() {
    document.querySelectorAll('.username-link').forEach(element => {
        const linked_user = element.innerHTML
        element.style.cursor = "pointer"
        element.onclick = function () {
            user_page(linked_user)
        }
    })
}

function update_follow_button(user_data) {
    follow_button = document.querySelector('#follow-button')
    if (user_data.followers.includes(current_username)) {
        follow_button.innerHTML = "Unfollow"
    } else {
        follow_button.innerHTML = "Follow"
    }

}

function follow_user(username) {
    fetch(`user/${username}`, {
        method: 'PUT',
        headers: { 'X-CSRFToken': csrftoken },
        mode: 'same-origin', // Do not send CSRF token to another domain.
        body: JSON.stringify({
            'follow': username
        })
    })
        .then(response => response.json())
        .then(response => {
            update_user_details(response)
        })
}

function update_user_details(user_data) {
    const follower_count = document.getElementById('follower-count')
    const following_count = document.getElementById('following-count')
    follower_count.innerHTML = `${user_data.followers.length} followers`
    following_count.innerHTML = `${user_data.following.length} following`
    update_follow_button(user_data)
}

function fetch_user_details(username) {
    fetch(`user/${username}`, {
        method: 'GET',
        headers: { 'X-CSRFToken': csrftoken },
        mode: 'same-origin', // Do not send CSRF token to another domain.
    })
        .then(response => response.json())
        .then(response => {
            update_user_details(response)
        })
}
function show_new_post() {
    new_post = document.getElementById('new-post')
    if (new_post !== null) {
        new_post.style.display = 'block'
    }
}

function user_page(username) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none'
    })
    document.getElementById('posts').style.display = 'block'
    document.getElementById('profile-details').style.display = 'block'
    document.getElementById('page-header').innerHTML = username
    fetch_user_details(username)
    const follow_button = document.getElementById('follow-button')
    if (username === current_username) {
        follow_button.style.display = 'none'
    } else {
        follow_button.onclick = function () {
            follow_user(username)
        }
    }
    fetch(`/posts/user/${username}?` + new URLSearchParams({
        page: current_page,
    }), {
        method: 'GET',
        headers: { 'X-CSRFToken': csrftoken },
        mode: 'same-origin', // Do not send CSRF token to another domain.
    })
        .then(response => response.json())
        .then(response => {
            console.log(response)
            const post_list = document.getElementById('posts')
            post_list.innerHTML = ''
            response.posts.forEach(post => {
                display_post(post, post_list);
            })
            // Make username links clickable
            link_user_pages();

            // Handle Page navigation 
            const page_nav = document.getElementById('page-navigation')
            // Clear previous page indices
            page_nav.querySelectorAll('.page-index').forEach(element => {
                element.remove()
            })
            if (parseInt(response.num_pages) > 1) {
                // Show the page navigator 
                document.getElementById('page-navigation').style.display = 'block'
                document.getElementById('next-page').onclick = function () {
                    if (current_page < response.num_pages) {
                        current_page++;
                    }
                    user_page(username)
                }
                document.getElementById('previous-page').onclick = function () {
                    if (current_page > 1) {
                        current_page--;
                    }
                    user_page(username)
                }
                const paginator = document.querySelector('.pagination')
                const next_page = paginator.querySelector('#next-page')

                for (let i = 1; i <= response.num_pages; i++) {
                    const page = document.createElement('li')
                    page.classList.add('page-item', 'page-index')
                    page.innerHTML = `<a class="page-link" href="#">${i}</a>`
                    page.onclick = function () {
                        current_page = i
                        user_page(username)
                    }
                    next_page.insertAdjacentElement('beforebegin', page)
                }
            } else {
                document.getElementById('page-navigation').style.display = 'none'
            }
        })
        .then(() => {
            document.querySelectorAll('.like-button').forEach(button => {
                button.onclick = function () {
                    like_post(this.dataset.postid);
                }
            })
        })
        .catch(error => {
            console.log(error)
        })
}

function following_page() {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none'
    })
    document.getElementById('posts').style.display = 'block'
    document.getElementById('page-header').innerHTML = 'Following'
    fetch(`/following?` + new URLSearchParams({
        page: current_page,
    }), {
        method: 'GET',
        headers: { 'X-CSRFToken': csrftoken },
        mode: 'same-origin', // Do not send CSRF token to another domain.
    })
        .then(response => response.json())
        .then(response => {
            console.log(response)
            const post_list = document.getElementById('posts')
            post_list.innerHTML = ''
            response.posts.forEach(post => {
                display_post(post, post_list);
            })
            // Make username links clickable
            link_user_pages();

            // Handle Page navigation 
            const page_nav = document.getElementById('page-navigation')
            // Clear previous page indices
            page_nav.querySelectorAll('.page-index').forEach(element => {
                element.remove()
            })
            if (parseInt(response.num_pages) > 1) {
                // Show the page navigator 
                document.getElementById('page-navigation').style.display = 'block'
                document.getElementById('next-page').onclick = function () {
                    if (current_page < response.num_pages) {
                        current_page++;
                    }
                    following_page()
                }
                document.getElementById('previous-page').onclick = function () {
                    if (current_page > 1) {
                        current_page--;
                    }
                    following_page()
                }
                const paginator = document.querySelector('.pagination')
                const next_page = paginator.querySelector('#next-page')

                for (let i = 1; i <= response.num_pages; i++) {
                    const page = document.createElement('li')
                    page.classList.add('page-item', 'page-index')
                    page.innerHTML = `<a class="page-link" href="#">${i}</a>`
                    page.onclick = function () {
                        current_page = i
                        following_page()
                    }
                    next_page.insertAdjacentElement('beforebegin', page)
                }
            } else {
                document.getElementById('page-navigation').style.display = 'none'
            }
        })
        .then(() => {
            document.querySelectorAll('.like-button').forEach(button => {
                button.onclick = function () {
                    like_post(this.dataset.postid);
                }
            })
        })
        .catch(error => {
            console.log(error)
        })
}

function all_posts() {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none'
    })
    show_new_post()
    document.getElementById('posts').style.display = 'block'
    document.getElementById('page-header').innerHTML = 'All Posts'
    fetch('/posts/all?' + new URLSearchParams({
        page: current_page,
    }), {
        method: 'GET',
        headers: { 'X-CSRFToken': csrftoken },
        mode: 'same-origin', // Do not send CSRF token to another domain.
    })
        .then(response => response.json())
        .then(response => {
            console.log(response)
            const post_list = document.getElementById('posts')
            post_list.innerHTML = ''
            response.posts.forEach(post => {
                display_post(post, post_list);
            })

            link_user_pages();

            // Handle Page navigation 
            const page_nav = document.getElementById('page-navigation')
            // Clear previous page indices
            page_nav.querySelectorAll('.page-index').forEach(element => {
                element.remove()
            })
            if (parseInt(response.num_pages) > 1) {
                // Show the page navigator 
                document.getElementById('page-navigation').style.display = 'block'
                document.getElementById('next-page').onclick = function () {
                    if (current_page < response.num_pages) {
                        current_page++;
                    }
                    all_posts();
                }
                document.getElementById('previous-page').onclick = function () {
                    if (current_page > 1) {
                        current_page--;
                    }
                    all_posts();
                }
                const paginator = document.querySelector('.pagination')
                const next_page = paginator.querySelector('#next-page')

                for (let i = 1; i <= response.num_pages; i++) {
                    const page = document.createElement('li')
                    page.classList.add('page-item', 'page-index')
                    page.innerHTML = `<a class="page-link" href="#">${i}</a>`
                    page.onclick = function () {
                        current_page = i
                        all_posts()
                    }
                    next_page.insertAdjacentElement('beforebegin', page)
                }
            } else {
                document.getElementById('page-navigation').style.display = 'none'
            }
        })
        .then(() => {
            document.querySelectorAll('.like-button').forEach(button => {
                button.onclick = function () {
                    like_post(this.dataset.postid);
                }
            })
        })
        .catch(error => {
            console.log(error)
        })
}

function set_nav_bar_links() {
    const following_link = document.getElementById('following-link')
    following_link.onclick = function () {
        following_page()
    }
}
function load() {
    current_page = 1
    console.log('Loaded DOM!');
    current_username = JSON.parse(document.getElementById('current_username').textContent);
    // Change the submit action for the create post form
    form = document.getElementById('create-post-form')
    if (form !== null) {
        document.getElementById('create-post-form').onsubmit = function () {
            const body = document.getElementById('create-post-content').value;
            post = {
                'body': body
            }
            publish_post(post)
        }
    }
    set_nav_bar_links()
    all_posts();
}

document.addEventListener('DOMContentLoaded', load);

