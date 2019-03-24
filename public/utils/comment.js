let commentParams = new URLSearchParams(window.location.search);
const post = commentParams.get('post');
const bodyText = commentParams.get('body');
const username = commentParams.get('username');
const id = JSON.parse(localStorage.getItem(username)).post;
const socket = io();

socket.on('connect', () => {
    console.log('comment.js connected')
})

const commentHandler = (comment) => {
    let user = JSON.parse(localStorage.getItem(username));
    let contentDiv = document.createElement('div');
    let commentDiv = document.querySelector('.comments_list');
    contentDiv.className = 'comment_item';
    let b = document.createElement('b');
    b.textContent = comment.username;
    let p = document.createElement('p');
    p.className = 'comment_text';
    p.textContent = comment.comment;
    contentDiv.appendChild(b);
    contentDiv.appendChild(p);
    commentDiv.appendChild(contentDiv);
    if (comment.username == username) {
        let commentForm = document.createElement('form');
        let textarea = document.createElement('textarea');
        textarea.name = 'updateComment';
        let del = document.createElement('button');
        commentData = new FormData(commentForm)
        textarea.value = p.textContent;
        const onChange = (e) => {
            console.log(textarea.value);
            console.log(commentData.get('updateComment'));
            textarea.value = e.target.value;
            console.log(textarea.value);
        }
        textarea.onchange = onChange;
        let updateComment = document.createElement('button');
        updateComment.textContent = 'update';
        commentForm.appendChild(textarea);
        commentForm.appendChild(updateComment);
        console.log(textarea);
        commentValue = commentData.get('updateComment')
        updatedComment = {
            comment: textarea.value
        }
        console.log(updatedComment)
        commentForm.style.display = 'none';
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            fetch(`http://127.0.0.1:5000/api/v1/${comment.user_id}/comments/${comment.id}`, {
                method: 'PUT',
                mode: 'cors',
                body: JSON.stringify(updatedComment),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.auth_token}`,
                }
            }).then(res => {
                    return res.json();
                },
                networkError => console.log(networkError)
            ).then(jsonResponse => {
                console.log(jsonResponse);
                commentForm.previousElementSibling.textContent = jsonResponse.comment
                console.log(commentForm.previousElementSibling);
            });
        });
        p.parentElement.appendChild(commentForm);
        del.textContent = 'delete';
        b.style.cursor = 'pointer';

        b.addEventListener('click', () => {
            if (commentForm.style.display == 'none') {
                commentForm.style.display = 'block';
            } else {
                commentForm.style.display = 'none';
            }
        });

        del.addEventListener('click', () => {
            fetch(`http://127.0.0.1:5000/api/v1/${comment.user_id}/comments/${comment.id}`, {
                    method: 'DELETE',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.auth_token}`,
                    }
                })
                .then(res => {
                        return res.json();
                    },
                    networkError => console.log(networkError)
                ).then(jsonResponse => {
                    console.log(jsonResponse);
                    let parent = del.parentElement.parentElement;
                    let child = del.parentElement;
                    parent.removeChild(child);
                });
        });
        contentDiv.appendChild(del);
    }
}

socket.on('newComment', (comment) => {
    commentHandler(comment);
    console.log('New comment!', comment)
});


// fetch comments

if (post) {
    fetch(`http://127.0.0.1:5000/api/v1/${id}/comments`)
        .then(res => {
                return res.json();
            },
            networkError => console.log(networkError.message)
        ).then(jsonResponse => {
            const title = document.getElementById('post_title');
            const body = document.getElementById('post_body');
            title.textContent = post;
            body.textContent = bodyText;

            let home = document.getElementById('home_id');
            home.style.cursor = 'pointer';
            home.addEventListener('click', () => {
                if (window.location.href.includes('username')) {
                    const username = commentParams.get('username');
                    window.location.href = `http://127.0.0.1:3000/index.html?username=` + username;
                } else {
                    window.location.href = `http://127.0.0.1:3000/index.html`;
                }
            });

            if (jsonResponse.comments) {
                jsonResponse.comments.forEach(comment => {
                    commentHandler(comment)
                });
            }
            console.log(jsonResponse)
        });
}

// post a comment

const commentForm = document.getElementById('comment_form');

commentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(commentForm);
    let span = document.getElementById('span');

    if (formData.get('comment')) {

        span.innerHTML = ''

        const comment = {
            "comment": formData.get('comment')
        };
        commentForm.reset();
        const commentUrl = window.location.href; // url

        if (commentUrl.includes('username')) {
            const params = new URLSearchParams(window.location.search);
            let username = params.get('username');
            let user = JSON.parse(localStorage.getItem(username)); // Local storage key

            fetch(`http://127.0.0.1:5000/api/v1/${user.id}/${id}/comments`, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(comment),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.auth_token}`,
                    'Access-Control-Allow-Credentials': true
                }
            }).then(res => {
                    return res.json()
                },
                networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                let now = new Date().getHours();
                socket.emit('createComment', comment)
                let diff = now - user.timestamp;
                if (diff >= 24) {
                    localStorage.removeItem(`${jsonResponse.email}`);
                    window.location.href('http://127.0.0.1:3000/login.html');
                } else {
                    console.log('Token is valid!')
                    console.log(jsonResponse)
                }
            });
        } else {
            window.location.href = "http://127.0.0.1:3000/login.html"
        }
    } else {
        let b = document.createElement('b');

        b.textContent = 'Please add a comment!'
        b.style.color = 'red';
        span.innerHTML = '';
        span.appendChild(b)
    }
});