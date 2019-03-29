let commentParams = new URLSearchParams(window.location.search);
const post = commentParams.get('post');
const bodyText = commentParams.get('body');
const username = commentParams.get('username');
let user = JSON.parse(getCookie(username))
const URL = window.location.hostname === 'localhost' ? 'http://127.0.0.1:3000' : 'https://flask-blogify.herokuapp.com';

console.log(user)
const socket = io();

const commentHelper = (comment) => {
    let commentDiv = document.querySelector('.comments_list');
    let comDiv = document.createElement('div');
    comDiv.className = 'comment_item';
    var commentItem = '';

    if (comment.username == username) {
        commentItem = `
            <b id='author_id'>${comment.username}</b>
            <p class='comment_text'>${comment.comment}</p>
            <button id='del'>delete</delete>
        `;
    } else {
        console.log(comment)
        commentItem = `
            <b id='author_id'>${comment.username}</b>
            <p class='comment_text'>${comment.comment}</p>
        `;
    }
    comDiv.innerHTML = commentItem;
    commentDiv.appendChild(comDiv)
    let delBtn = document.getElementById('del');
    console.log(commentDiv);
    if (delBtn) {
        console.log(delBtn.parentElement);
        if (delBtn) {
            delBtn.addEventListener('click', () => {
                console.log('clicked')
                fetch(`http://127.0.0.1:5000/api/v1/${comment.user_id}/${comment.post_id}/comments/${comment.id}`, {
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
                        let parent = delBtn.parentElement.parentElement;
                        let child = delBtn.parentElement;
                        document.location.reload()
                        parent.removeChild(child);
                        socket.emit('removeComment', delBtn)
                    });
            });
        }
    }
}

socket.on('newComment', (comment) => {
    commentHelper(comment);
    console.log('New comment!', comment);
});

socket.on('deletedComment', (comment) => {
    console.log('Comment deleted');
    console.log(comment);
    document.location.reload()
});

// fetch comments

if (post) {
    fetch(`http://127.0.0.1:5000/api/v1/${user.post}/comments`)
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
                    window.location.href = `${URL}/index.html?username=` + username;
                } else {
                    window.location.href = `${URL}/index.html`;
                }
            });

            if (jsonResponse.comments) {
                jsonResponse.comments.forEach(comment => {
                    commentHelper(comment);
                });
            }
            console.log(jsonResponse)
        });
}

// post a comment

const commentForm = document.getElementById('comment_form');

socket.on('connect', () => {
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const formData = new FormData(commentForm);
        let span = document.getElementById('span');
    
        if (formData.get('comment')) {
    
            span.innerHTML = ''
    
            let comment = {
                "comment": formData.get('comment')
            };

            let newComment = {
                comment: comment.comment,
                username: username

            }

            commentForm.reset();
    
            fetch(`http://127.0.0.1:5000/api/v1/${user.id}/${user.post}/comments`, {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(comment),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.auth_token}`
                }
            }).then(res => {
                    return res.json()
                },
                networkError => console.log(networkError.message)
            ).then(jsonResponse => {
                console.log(jsonResponse)
                document.location.reload()
                socket.emit('createComment', newComment)
            });
        } else {
            let b = `<b style='color:red;'>Please add a comment!</b>`;
            span.innerHTML = b;
        }
    });
});