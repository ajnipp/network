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
                const post_html =
                    `
            <div class="post-author">${post.author}</div>
            <div class="post-body">${post.body}</div>
            <div class="post-timestamp-created">${post.timestamp_created}</div>
            <i class="bi-heart"></i> <span class="post-likes">${post.users_who_liked.length}</span>
            `
                post_container.innerHTML = post_html
                const post_list = document.getElementById('posts')
                post_list.append(post_container)
            })
        })
        .catch(error => {
            console.log(error)
        })
}
function load() {
    console.log('Loaded DOM!');

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

