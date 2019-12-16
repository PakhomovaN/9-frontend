import Http from './lib.js';
const baseUrl = 'https://more-posts-9.herokuapp.com';

let lastSeenId = 0;

const rootEl = document.getElementById('root');
const addFormEl = document.createElement('form');
addFormEl.className = 'form-inline mb-2';
addFormEl.innerHTML = `
    <div class="form-group">
        <input class="form-control" data-id="content">
    </div>
    <select class="custom-select" data-id="type">
        <option value="regular">Обычный</option>
        <option value="image">Изображение</option>
        <option value="audio">Аудио</option>
        <option value="video">Видео</option>
    </select>  
    <button class="btn btn-primary">Ok</button>
`;

rootEl.appendChild(addFormEl);

const contentEl = addFormEl.querySelector('[data-id=content]');
contentEl.value = localStorage.getItem('content');
contentEl.addEventListener('input', (evt) => {
    localStorage.setItem('content', contentEl.value);
});


const typeEl = addFormEl.querySelector('[data-id=type]');
typeEl.value = localStorage.getItem('type');
typeEl.addEventListener('input', (evt) => {
    localStorage.setItem('type', typeEl.value);
});



addFormEl.addEventListener('submit', (evt) => {
    evt.preventDefault();

    // const value = postInputEl;

    // const postEl = document.createElement('li');
    // postEl.textContent = value;
    // postEl.classList.add('sending');
    // postEl.appendChild(postEl);

    const data = {
            content: contentEl.value,
            type: typeEl.value,
        };

    fetch(`${baseUrl}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
        // postsEl.removeChild(postEl);
    }).catch(error => {
        console.log(error);
    });

    // postInputEl.value = '';

    
//     http.postRequest('/posts', (evt) => {
//         loadData();
//         contentEl.value = '';
//         localStorage.removeItem('link');
//     }, handleError, JSON.stringify(data), [{name: 'Content-Type', value: 'application/json'}]);
});

const postsEl = document.createElement('div');
rootEl.appendChild(postsEl);

const lastPosts = document.createElement('button');
lastPosts.textContent = 'Загрузить еще';
lastPosts.className = 'card mb-2';
lastPosts.addEventListener('click', () => {
    lastPost()
});
rootEl.appendChild(lastPosts);

function lastPost() {
    fetch(`${baseUrl}/posts/${lastSeenId}`)
        .then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }
        ).then(
            data => {
                console.log(data);
                renderPosts(data);
            }
        ).catch(error => {
            console.log(error);
        });
}

function renderPosts(posts) {
    for (const post of posts) {
        const postEl = document.createElement('li');
        postEl.textContent = post.content;
        postsEl.appendChild(postEl);
    }
}

setInterval(() => {

    const promise = fetch(`${baseUrl}/posts/${lastSeenId}`);
    promise.then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json(); 
    }).then(data => {
        console.log(data);
        if (data.length !== 0) {
            lastSeenId = data[data.length - 1].id;
            renderPosts(data);
        }
    }).catch(error => {
        console.log(error);
    });

  }, 5000); 


const listEl = document.createElement('div');
rootEl.appendChild(listEl);

const rebuildList = (evt) => {
    const items = JSON.parse(evt.currentTarget.responseText);
    listEl.innerHTML = '';

    items.sort((a, b) => {
        return a.likes - b.likes;
    });

    for (const item of items) {
        const postEl = document.createElement('div');
        postEl.className = 'card mb-2';
        if (item.type === 'regular') {
            postEl.innerHTML = `
                <div class="card-body">
                    <div class="card-text">${item.content}</div>
                    <button class="btn">♡ ${item.likes}</button>
                    <button class="btn btn-primary" data-action="like">like</button>
                    <button class="btn btn-danger" data-action="dislike">dislike</button>
                    <button class="btn btn-danger" data-action="remove>x</button> 
                </div>
            `;
        } else if (item.type === 'image') {
            postEl.innerHTML = `
                    <img src="${item.content}" class="card-img-top">
                    <div class="card-body">
                        <button class="btn">♡ ${item.likes}</button>
                        <button class="btn btn-primary" data-action="like">like</button>
                        <button class="btn btn-danger" data-action="dislike">dislike</button>
                        <button class="btn btn-danger" data-action="remove>x</button>
                    </div>
                `;
        } else if (item.type === 'audio') {
            postEl.innerHTML = `
                    <audio src="${item.content}" class="card-audio-top">
                    <div class="card-body">
                        <button class="btn">♡ ${item.likes}</button>
                        <button class="btn btn-primary" data-action="like">like</button>
                        <button class="btn btn-danger" data-action="dislike">dislike</button>
                        <button class="btn btn-danger" data-action="remove>x</button>
                    </div>
                `;
        } else if (item.type === 'video') {
            postEl.innerHTML = `
                    <video src="${item.content}" class="card-video-top">
                    <div class="card-body">
                        <button class="btn">♡ ${item.likes}</button>
                        <button class="btn btn-primary" data-action="like">like</button>
                        <button class="btn btn-danger" data-action="dislike">dislike</button>
                        <button class="btn btn-danger" data-action="remove>x</button>
                        </div>
                `;
        } else {
            postEl.innerHTML = `
                    <div class="card-body">
                        <div class="card-text">${item.content}</div>
                        <button class="btn">♡ ${item.likes}</button>
                        <button class="btn btn-primary" data-action="like">like</button>
                        <button class="btn btn-danger" data-action="dislike">dislike</button>
                        <button class="btn btn-danger" data-action="remove">x</button>
                    </div>
                `;
            
            postEl.querySelector('[data-action=like]').addEventListener('click', () => {
                fetch(`${baseUrl}/posts/${item.id}/likes`, {
                    method: 'POST'
                }).then(
                    response => {
                        if (!response.ok) {
                            throw new Error(response.statusText);
                        }
                        return response.json();
                    },
                ).then(
                    data => {
                        postsEl.querySelector('[data-action=like]').textContent=`like ${data}`;
                    }               
                ).catch(error => {
                    console.log(error);
                })
            });

            postEl.querySelector('[data-action=dislike]').addEventListener('click', () => {
                fetch(`${baseUrl}/posts/${item.id}/likes`, {
                    method: 'DELETE'
                }).then(
                    response => {
                        if (!response.ok) {
                            throw new Error(response.statusText);
                        }
                        return response.json();
                    },
                ).then(
                    data => {
                        postsEl.querySelector('[data-action=like]').textContent=`dislike ${data}`;
                    }               
                ).catch(error => {
                    console.log(error);
                })
            });
            postEl.querySelector('[data-action=remove]').addEventListener('click', () => {
                fetch(`${baseUrl}/posts/${item.id}`, {
                    method: 'DELETE'
                }).then(
                    response => {
                        if (!response.ok) {
                            throw new Error(response.statusText);
                        }
                        return response.json();
                    },              
                ).catch(error => {
                    console.log(error);
                })
                postsEl.removeChild(postEl);
            });
            listEl.appendChild(postEl);
        };
    }
};
// const handleError = (evt) => {
//     console.log(evt);
// };
// const loadData = () => {
//     http.getRequest('/posts', rebuildList, handleError);
// };
// loadData();