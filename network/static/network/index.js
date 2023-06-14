function publish_post(post) {
    const csrftoken = Cookies.get('csrftoken');
    fetch('/post', {
        method: 'POST',
        headers: {'X-CSRFToken': csrftoken},
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
function load() {
    console.log('Loaded DOM!');
   
    // Change the submit action for the create post form
    document.getElementById('create-post-form').onsubmit = function() {
        const body = document.getElementById('create-post-content').value;
        post = {
            'body': body 
        }
        publish_post(post)
    }
}

document.addEventListener('DOMContentLoaded', load);

