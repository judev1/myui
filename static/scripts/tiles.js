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
    const tileDiv = document.createElement('div');
    tileDiv.classList.add('tile', 'editing');
    const count = countTiles(row);
    const createTileDiv = row.querySelector('.create-tile');
    makeTileDraggable(tileDiv);
    row.appendChild(tileDiv);
    if (count === 4) {
        interact(row).unset();
        createTileDiv.remove();
        setWidth(tileDiv, 25);
        fitNewChild(row);
    } else {
        createTileDiv.remove();
        setWidth(tileDiv, 100 / count);
        fitNewChild(row);
    }
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
        createTileDiv.classList.add('hidden');
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

async function disableTileEdit() {
    fadeOut(actions.add);
    await fadeOut(dashboard);
    actions.add.removeEventListener('click', addTile);
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
            } else {
                addCreateTile(row);
            }
        }
    });
    editing.disable = disableTileEdit;
    editing.remove = removeTile;
    editing.axis = 'x';
    await fadeIn(dashboard);
}