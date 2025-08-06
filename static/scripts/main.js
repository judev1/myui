function attachLinkCallbacks() {
    const links = document.querySelectorAll('div[screen]');
    links.forEach(link => {
        link.addEventListener('click', linkCallback);
    });
}

function removeDisplays() {
    const navigation = getNavigation();
    const backButton = document.querySelector('.back');
    toggleEditable(false);
    if (navigation.length === 1) {
        backButton.style.opacity = '0';
        backButton.style.pointerEvents = 'none';
    }
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

function addDisplays() {
    const navigation = getNavigation();
    const backButton = document.querySelector('.back');
    if (navigation.length > 1) {
        backButton.style.opacity = '1';
        backButton.style.pointerEvents = 'auto';
    }
}

function loadContent(html) {
    const content = document.querySelector('.content');
    content.innerHTML = html;
    content.style.opacity = '1';
    setTimeout(() => {
        attachLinkCallbacks();
    }, 200);
}

function unloadContent(postUnload=() => {}) {
    const content = document.querySelector('.content');
    content.style.opacity = '0';
    removeDisplays();
    return Promise.resolve(setTimeout(() => {
        content.innerHTML = '';
        postUnload();
    }, 200));
}

async function loadScreen(screen, headers={}) {
    return fetch('/page/' + screen, {
        method: 'GET',
        headers: headers
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Failed to load content: ${screen}`);
        }
    }).then(json => {
        unloadContent(() => {
            const html = loadFromJSON(json);
            loadContent(html);
            addDisplays();
            // editable = false;
        });
    }).catch(error => {
        console.error('Error:', error);
    });
}

function getNavigation() {
    const navCookie = document.cookie.split('; ')
        .find(row => row.startsWith('navigation='));
    if (navCookie) {
        return JSON.parse(navCookie.split('=')[1]);
    }
    return [];
}

function pushToNavigation(screen) {
    const navigation = getNavigation();
    if (navigation.length > 0 && navigation[navigation.length - 1] === screen) {
        return;
    }
    navigation.push(screen);
    document.cookie = "navigation=" + JSON.stringify(navigation);
}

function popFromNavigation() {
    const navigation = getNavigation();
    const screen = navigation.pop();
    document.cookie = "navigation=" + JSON.stringify(navigation);
    return screen;
}

function getScreen() {
    const navigation = getNavigation();
    if (navigation.length > 0) {
        return navigation[navigation.length - 1];
    } else {
        return null;
    }
}

function navigateTo(screen) {
    if (screen === getScreen()) { return }
    pushToNavigation(screen);
    loadScreen(screen);
}

function navigateBack() {
    popFromNavigation();
    loadScreen(getScreen());
}

function linkCallback(event) {
    const screen = event.target.getAttribute('screen');
    navigateTo(screen);
}

document.addEventListener('DOMContentLoaded', () => {
    const screen = popFromNavigation() || 'index';
    addAction();
    navigateTo(screen);
});