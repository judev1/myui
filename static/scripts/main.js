const icons = {
    'pencil': null,
    'trash': null,
    'plus': null
}

async function loadIcons() {
    const parser = new DOMParser();
    const iconPromises = Object.keys(icons).map(async (key) => {
        const response = await fetch(`/static/images/${key}.svg`);
        const svg = await response.text();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        icons[key] = doc.querySelector('svg');
    });
    await Promise.all(iconPromises);
}

async function onLoad() {
    await loadIcons();

    addActions();
    attachLinkCallbacks();

    const content = document.querySelector('.content');
    makeFadable(content);

    loadNavigation();
    const screen = popFromNavigation();
    await navigateTo(screen);
}

document.addEventListener('DOMContentLoaded', onLoad);