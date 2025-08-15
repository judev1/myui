var tileHovering = false;

function countTiles(row) {
    return row.querySelectorAll('.tile').length;
}

function getAllRows() {
    return Array.from(document.querySelectorAll('.row'));
}

function getTiles(row) {
    return row.querySelectorAll('.tile');
}

function addTile(row) {
    const createTileDiv = row.querySelector('.create-tile');
    if (createTileDiv) createTileDiv.remove();
    const tileDiv = document.createElement('div');
    tileDiv.classList.add('tile', 'editing');
    makeTileDraggable(tileDiv);
    row.appendChild(tileDiv);
    const count = countTiles(row);
    if (count < 4) {
        if (count > 1) {
            makeTilesResizable(row);
            setWidth(tileDiv, 100 / (count - 1));
        } else {
            setWidth(tileDiv, 100);
        }
        fitNewChild(row);
    } else {
        interact(row).unset();
        setWidth(tileDiv, 25);
        fitNewChild(row);
        makeTilesResizable(row);
    }
    if (tileHovering) tileCancelHover();
    saveScreenState();
}

function tileAddHover() {
    tileHovering = true;
    fadeIn(actions.cancel);
    getAllRows().forEach(row => {
        getTiles(row).forEach(tile => {
            tile.style.pointerEvents = 'none';
        });
        if (countTiles(row) === 4) return;
        var createTile = row.querySelector('.create-tile');
        if (!createTile) {
            createTile = addCreateTile(row);
            createTile.classList.add('hidden');
        }
        createTile.classList.add('hover');
        createTile.style.pointerEvents = 'auto';
        const rect = row.getBoundingClientRect();
        createTile.style.width = `${rect.width}px`;
        createTile.style.height = `${rect.height}px`;
    });
}

function tileCancelHover() {
    fadeOut(actions.cancel);
    getAllRows().forEach(row => {
        getTiles(row).forEach(tile => {
            tile.style.pointerEvents = 'auto';
        });
        const firstChild = row.firstElementChild;
        const createTile = row.querySelector('.create-tile');
        if (firstChild !== createTile) return;
        if (countTiles(row) === 1) {
            createTile.classList.remove('hover');
        } else createTile.remove();
    });
    tileHovering = false;
}

function removeTile() {
    dragged.element.remove();
}

function addCreateTile(row) {
    const createTileDiv = document.createElement('div');
    createTileDiv.classList.add('tile', 'create-tile');
    createTileDiv.addEventListener('click', () => addTile(row));
    const plusIcon = icons['plus'].cloneNode(true);
    createTileDiv.appendChild(plusIcon);
    if (row.children.length === 0) {
        row.appendChild(createTileDiv);
    } else {
        const firstChild = row.firstElementChild;
        row.insertBefore(createTileDiv, firstChild);
    }
    return createTileDiv;
}

function makeTileDraggable(tile) {
    interact(tile).draggable({
        listeners: {
            start: startDrag,
            move: onDrag,
            end: endDrag
        }
    });
}

function makeTilesResizable(row) {
    const children = Array.from(row.children);
    if (children.length === 1 || children.length === 4) {
        if (children.length === 4) interact(row).unset();
        children.forEach(tile => {
            interact(tile).resizable({
                edges: { left: false, right: false },
            });
        });
        return;
    }
    children.forEach((tile, i) => {
        var left = true;
        var right = true;
        if (i === 0) {
            left = false;
        } else if (i === children.length - 1) {
            right = false;
        }
        interact(tile).resizable({
            edges: { left, right },
            listeners: {
                move: resize,
                end: endResize
            }
        });
    });
}

async function disableTileEdit() {
    if (tileHovering) {
        tileCancelHover();
        actions.add.style.display = 'none';
    }
    fadeOut(actions.add);
    await fadeOut(dashboard);
    actions.add.style.display = 'flex';
    actions.add.removeEventListener('click', addTile);
    actions.cancel.removeEventListener('click', tileCancelHover);
    getAllRows().forEach(row => {
        interact(row).unset();
        const firstChild = row.firstElementChild;
        if (firstChild.classList.contains('create-tile')) {
            row.removeChild(firstChild);
        } else {
            getTiles(row).forEach(tile => {
                tile.classList.remove('editing');
                interact(tile).unset();
            });
        }
    });
}

async function enableTileEdit() {
    editing.increment = 100 / 12;
    editing.minimum = editing.increment * 3;
    getAllRows().forEach(row => {
        const count = countTiles(row);
        getTiles(row).forEach(tile => {
            tile.classList.add('editing');
            makeTileDraggable(tile);
        });
        if (count < 4) {
            makeDragzone(row);
            if (count > 0) {
                fitChildren(row);
                if (count > 1) makeTilesResizable(row);
            } else {
                addCreateTile(row);
            }
        }
    });
    fadeIn(actions.add);
    actions.add.addEventListener('click', tileAddHover);
    actions.cancel.addEventListener('click', tileCancelHover);
    editing.disable = disableTileEdit;
    editing.remove = removeTile;
    editing.axis = 'x';
    await fadeIn(dashboard);
}