const defaults = {
    row: null,
    index: null,
    children: null,
    widths: null
}

const shadow = {
    tile: null,
    siblings: null,
    row: null,
    delete: false
}

const screen = {
    width: null,
    height: null
}

const colors = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#F0F0F0',
    '#FF33A1',
    '#A133FF',
];

function startDrag(event) {
    activateTrash();
    const tile = event.target;
    const row = tile.parentNode;
    const children = Array.from(row.children);
    const dashboard = document.querySelector('.dashboard');

    defaults.row = row;
    defaults.index = children.indexOf(tile);
    defaults.children = children;
    defaults.widths = children.map(
        child => getWidth(child)
    );

    var width = tile.getBoundingClientRect().width;
    if (width > 300) {
        width = 300;
    }

    shadow.tile = tile.cloneNode(true);
    shadow.tile.classList.add('shadow');
    setWidth(shadow.tile, 100);

    tile.style.width = `${width}px`;
    tile.style.height = '190px';
    tile.style.position = 'absolute';
    tile.style.top = '0';
    tile.style.left = '0';
    tile.classList.add('dragging');
    dashboard.appendChild(tile);

    makeTilesResizable(row);

    const dashboardRect = dashboard.getBoundingClientRect();
    screen.width = dashboardRect.width;
    screen.height = dashboardRect.height;
}

function drag(event) {
    const tile = event.target;

    const width = tile.getBoundingClientRect().width;
    const height = tile.getBoundingClientRect().height;

    var offsetX = event.pageX - width / 2;
    var offsetY = event.pageY - height / 2;

    const navHeight = document.querySelector('.navigation').getBoundingClientRect().height;

    if (offsetX < 0) {
        offsetX = 0;
    } else if (offsetX > screen.width - width) {
        offsetX = screen.width - width;
    }

    if (offsetY < navHeight) {
        offsetY = navHeight;
    } else if (offsetY > screen.height - height + navHeight) {
        offsetY = screen.height - height + navHeight;
    }

    tile.style.transform =
        `translate(${offsetX}px, ${offsetY}px)`;

    if (shadow.row) {
        var inserted = false;
        Array.from(shadow.row.children).forEach(child => {
            if (inserted) return;
            const offsetTile = child.getBoundingClientRect();
            const mouseX = event.pageX;
            if (mouseX < offsetTile.left + offsetTile.width / 2) {
                shadow.row.insertBefore(shadow.tile, child);
                inserted = true;
            }
        });
        if (!inserted) {
            shadow.row.appendChild(shadow.tile);
        }
    }
}

function endDrag(event) {
    deactivateTrash();
    const tile = event.target;

    tile.style.transform = '';
    tile.style.height = '';
    tile.style.position = '';
    tile.style.top = '';
    tile.style.left = '';
    tile.classList.remove('dragging');

    if (shadow.delete) {
        tile.remove();
        shadow.tile.remove();
        shadow.row = null;
        shadow.tile = null;
        shadow.delete = false;
        if (defaults.row.children.length === 0) {
            defaults.row.remove();
        }
        defaults.row = null;
        defaults.index = null;
        defaults.children = null;
        defaults.widths = null;
        saveScreenState();
        return;
    }

    if (shadow.row) {
        const row = shadow.row;
        const siblings = Array.from(row.children);
        const index = siblings.indexOf(shadow.tile);
        row.removeChild(shadow.tile);
        row.insertBefore(tile, shadow.row[index]);
        if (shadow.row !== defaults.row) {
            setWidth(tile, MIN);
            makeTilesResizable(row);
            makeTilesResizable(defaults.row);
        } else {
            const widths = defaults.widths;
            const width = widths[defaults.index];
            widths.splice(defaults.index, 1);
            widths.splice(index, 0, width);
            widths.forEach((width, i) => {
                setWidth(row.children[i], width);
            });
            makeTilesResizable(row, false);
        }
        var lastRow = defaults.row.parentNode.lastElementChild;
        if (defaults.row.children.length === 0 && defaults.row !== lastRow) {
            defaults.row.remove();
        }
        var lastRow = shadow.row.parentNode.lastElementChild;
        if (row.children.length !== 0 && row === lastRow) {
            const column = row.parentNode;
            const emptyRow = document.createElement('div');
            emptyRow.classList.add('row', 'empty');
            column.appendChild(emptyRow);
            makeRowsResizable(column);
            interact(emptyRow).dropzone({
                accept: '.tile',
                overlap: 0.5,
                ondragenter: dragEnter,
                ondragleave: dragExit,
            });
        }
        shadow.row = null;
    } else {
        const row = defaults.row;
        row.insertBefore(tile, row.children[defaults.index]);
        defaults.widths.forEach((width, i) => {
            setWidth(defaults.children[i], width);
        });
    }

    defaults.row = null;
    defaults.index = null;
    defaults.children = null;
    defaults.widths = null;

    shadow.tile.remove();
    shadow.tile = null;
    saveScreenState();
}

function dragEnter(event) {
    if (event.target.children.length < 4) {
        shadow.row = event.target;
        shadow.row.classList.remove('empty');
    }
}

function dragExit(event) {
    if (shadow.row) {
        shadow.row.removeChild(shadow.tile);
        shadow.row = null;
        if (event.target.children.length === 0) {
            event.target.classList.add('empty');
        }
    }
}

function enterTrash(event) {
    shadow.delete = true;
}

function exitTrash(event) {
    shadow.delete = false;
}