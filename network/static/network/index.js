function publish_post(post) {
    const csrftoken = Cookies.get('csrftoken');
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
    fetch(`/post/${post_id}`, {
        method: 'PUT',
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
function all_posts() {
    document.getElementById('posts').style.display = 'block'
    fetch('/posts/all', {
        method: 'GET'
    })
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => {
                const post_container = document.createElement('div')
                post_container.className = 'post-container'
                post_container.setAttribute('data-postid', post.id)
                const post_html =
                    `
            <div class="post-author">${post.author}</div>
            <div class="post-body">${post.body}</div>
            <div class="post-timestamp-created">${post.timestamp_created}</div>
            <button class="like-button" data-postid="${post.id}"><i class="${(post.users_who_liked.includes(current_username)) ? 'bi-heart-fill liked' : 'bi-heart'}"></i></button> <span class="post-likes">${post.users_who_liked.length}</span>
            `
                post_container.innerHTML = post_html
                const post_list = document.getElementById('posts')
                post_list.append(post_container)
            })
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
function load() {
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
    all_posts();
}

document.addEventListener('DOMContentLoaded', load);

