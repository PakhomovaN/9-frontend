const baseUrl = 'https://frontend9.herokuapp.com';

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

    const data = {
            id: 0,
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
    }).then(data => {
        contentEl.value = '';
        typeEl.value = 'regular';
        localStorage.clear();
        renderPosts(data);
    }).catch(error => {
        console.log(error);
    });   
});

const postsEl = document.createElement('div');
rootEl.appendChild(postsEl);

const lastPostsBtn = document.createElement('button');
lastPostsBtn.textContent = 'Загрузить еще';
lastPostsBtn.className = 'card mb-2';
lastPostsBtn.addEventListener('click', () => {
    lastPostsBtn()
});
rootEl.appendChild(lastPostsBtn);

function addlastPosts() {
    fetch(`${baseUrl}/posts/lastPosts/${lastSeenId}`)
        .then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }
        ).then(data => {
                renderPosts(data);
            }
        ).catch(error => {
            console.log(error);
        });
}

function renderPosts(data) {
    if (data.length < 5) {
        lastPostsBtn.style.display = 'none';
        if (data.length === 0) {
            return;
        }
    } else {
        fetch(`${baseUrl}/posts/postId/${data[data.length - 1].id}`)
        .then(
            response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.text();
            },
        ).then (
            data => {
                console.log(data);
                if (data === 'true') {
                    lastPostsBtn.style.display = "block";
                };
            }
        ).catch(error => {
            console.log(error);
        })
    }
    lastSeenId = data[data.length - 1].id;

    for (const item of data) {
        postsEl.appendChild(rebuildList(item));
    }
}

setInterval(() => {

    fetch(`${baseUrl}/posts/${lastSeenId}`)
        .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json(); 
    }).then(data => {
        if (data === 'false') {
            return;
        }
    }).catch(error => {
        console.log(error);
    });

  }, 5000); 

const listEl = document.createElement('div');
rootEl.appendChild(listEl);

function rebuildList(item) {
    listEl.innerHTML = '';

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
