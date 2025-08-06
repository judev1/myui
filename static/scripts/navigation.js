var navigation = [];

function loadNavigation() {
    const nav = localStorage.getItem('navigation');
    if (nav) {
        navigation = JSON.parse(nav);
    } else {
        navigation = ['home'];
        localStorage.setItem('navigation', JSON.stringify(navigation));
    }
}

function pushToNavigation(screen) {
    navigation.push(screen);
    localStorage.setItem('navigation', JSON.stringify(navigation));
}

function popFromNavigation() {
    const nav = localStorage.getItem('navigation');
    if (nav) {
        navigation = JSON.parse(nav);
    }
    const screen = navigation.pop();
    localStorage.setItem('navigation', JSON.stringify(navigation));
    return screen;
}

function getScreen() {
    return navigation[navigation.length - 1];
}

async function navigateTo(screen) {
    if (screen === getScreen()) { return }
    pushToNavigation(screen);
    await loadScreen(screen);
}

async function navigateBack() {
    if (navigation.length === 1) { return }
    navigation.pop();
    await loadScreen(getScreen());
}

