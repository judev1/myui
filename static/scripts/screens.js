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
    actions.edit.classList.remove('active');
    editing.active = false;
    if (navigation.length === 1) {
        fadeOut(actions.back);
    }
}

function postLoadUpdate() {
    fadeIn(actions.edit);
    if (navigation.length > 1) fadeIn(actions.back);
}

async function loadElement(parent, element) {
    parent.appendChild(element);
    await fadeIn(parent);
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
    const element = loadFromJSON(json);
    makeFadable(element);

    preLoadUpdate();

    const content = document.querySelector('.content');
    await unloadElement(content);

    postLoadUpdate();
    updateLinks();

    await loadElement(content, element);
}