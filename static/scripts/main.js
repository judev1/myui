const icons = {
    'pencil': null,
    'trash': null,
    'plus': null,
    'tile': null,
    'row': null,
    'column': null
}

function loadFromJSON(json) {
    const dashboard = document.createElement('div');
    const columnDiv = document.createElement('div');
    const rowDiv = document.createElement('div');
    const tileDiv = document.createElement('div');
    dashboard.classList.add('dashboard');
    columnDiv.classList.add('column');
    rowDiv.classList.add('row');
    tileDiv.classList.add('tile');
    json.columns.forEach(column => {
        const columnClone = columnDiv.cloneNode();
        setWidth(columnClone, column.width);
        dashboard.appendChild(columnClone);
    });
    return dashboard.outerHTML;
}

function saveToJSON() {
    const dashboard = { columns: [] };
    document.querySelectorAll('.column').forEach(column => {
        const columnData = { rows: [] };
        columnData.width = getWidth(column);
        dashboard.columns.push(columnData);
    });
    return JSON.stringify(dashboard);
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
    makeDragDummy();

    const content = document.querySelector('.content');
    makeFadable(content);

    loadNavigation();
    const screen = popFromNavigation();
    await navigateTo(screen);
}

document.addEventListener('DOMContentLoaded', onLoad);