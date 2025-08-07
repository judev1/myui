const defaults = {
    row: null,
    index: null,
    widths: null,
    delete: false,
    drop: false
}

const shadow = {
    tile: null,
    row: null,
    drop: false
}

const screen = {
    width: null,
    height: null
}

function startDrag(event) {
    activateTrash();
    const tile = event.target;
    const row = tile.parentNode;
    const children = Array.from(row.children);
    const dashboard = document.querySelector('.dashboard');

    defaults.row = row;
    defaults.index = children.indexOf(tile);
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

    var maxHeight = screen.height - height + navHeight;
    if (maxHeight < window.innerHeight - height - 1) {
        maxHeight = window.innerHeight - height - 1;
    }
    if (offsetY < navHeight) {
        offsetY = navHeight;
    } else if (offsetY > maxHeight) {
        offsetY = maxHeight;
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

    if (defaults.delete) {
        tile.remove();
        shadow.row = null;
        defaults.delete = false;
    } else if (shadow.drop) {
        const row = shadow.row;
        const siblings = Array.from(row.children);
        const index = siblings.indexOf(shadow.tile);
        row.removeChild(shadow.tile);
        row.insertBefore(tile, row.children[index]);
        if (defaults.drop) {
            const widths = defaults.widths;
            const width = widths[defaults.index];
            widths.splice(defaults.index, 1);
            widths.splice(index, 0, width);
            widths.forEach((width, i) => {
                setWidth(row.children[i], width);
            });
            makeTilesResizable(row, false);
        } else {
            if (isEmpty(row)) {
                row.classList.remove('empty');
                row.querySelector('.add').remove();
                newTileRow(row.parentNode);
            }
            setWidth(tile, MIN);
            makeTilesResizable(row);
            makeTilesResizable(defaults.row);
        }
    } else {
        const row = defaults.row;
        row.insertBefore(tile, row.children[defaults.index]);
        defaults.widths.forEach((width, i) => {
            setWidth(row.children[i], width);
        });
        row.classList.remove('empty');
    }

    if (isEmpty(defaults.row)) {
        defaults.row.remove();
    }

    defaults.row = null;
    defaults.index = null;
    defaults.widths = null;
    defaults.drop = false;

    shadow.row = null;
    shadow.tile.remove();
    shadow.tile = null;
    shadow.drop = false;

    saveScreenState();
}

function dragEnter(event) {
    const row = event.target;
    shadow.row = row;
    if (row.children.length < 4) {
        row.classList.add('active');
        if (isEmpty(row)) {
            if (isLast(row)) {
                const plus = row.querySelector('.add');
                plus.style.display = 'none';
            } else {
                row.classList.remove('empty');
            }
        }
        shadow.drop = true;
        if (row === defaults.row) {
            defaults.drop = true;
        }
    }
}

function dragExit(event) {
    if (shadow.row) {
        const row = shadow.row;
        row.classList.remove('active');
        row.removeChild(shadow.tile);
        if (isEmpty(row)) {
            if (isLast(row)) {
                const plus = row.querySelector('.add');
                plus.style.display = '';
            } else {
                row.classList.add('empty');
            }
        }
        shadow.drop = false;
        defaults.drop = false;
        shadow.row = null;
    }
}

function enterTrash(event) {
    defaults.delete = true;
}

function exitTrash(event) {
    defaults.delete = false;
}