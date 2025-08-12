function linkCallback(event) {
    const screen = event.target.getAttribute('screen');
    navigateTo(screen);
}

function attachLinkCallbacks() {
    const links = document.querySelectorAll('div[screen]');
    links.forEach(link => {
        link.addEventListener('click', linkCallback);
    });
}

function updateLinks() {
    const links = document.querySelectorAll('div[screen]');
    links.forEach(link => {
        if (link.getAttribute('screen') === getScreen()) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function saveScreenState() {
    const json = saveToJSON();
    const screen = getScreen();
    fetch('/save/' + screen, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: json
    });
}

function preLoadUpdate() {
    const edit = document.getElementById('edit');
    edit.classList.remove('active');
    editing = false
    const back = document.getElementById('back');
    if (navigation.length === 1) {
        fadeOut(back);
    }
}

function postLoadUpdate() {
    const edit = document.getElementById('edit');
    fadeIn(edit);

    const back = document.getElementById('back');
    if (navigation.length > 1) {
        fadeIn(back);
    }
}

async function loadElement(element, html) {
    element.innerHTML = html;
    await fadeIn(element);
}

function unloadElement(element) {
    element.style.opacity = '0';
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 200);
    });
}

async function loadScreen(screen) {
    const response = await fetch('/page/' + screen, {method: 'GET'});
    const json = await response.json();
    const html = loadFromJSON(json);

    preLoadUpdate();

    const element = document.querySelector('.content');
    await unloadElement(element);

    postLoadUpdate();
    updateLinks();

    await loadElement(element, html);
}