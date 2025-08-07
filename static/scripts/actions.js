var editing = false;

function addActions() {
    const action = document.createElement('div');
    action.classList.add('action');
    action.addEventListener('click', () => toggleEditable());
    action.appendChild(icons['pencil']);

    const body = document.querySelector('body');
    body.appendChild(action);

    makeFadable(action);
    interact(action).dropzone({
        accept: '.tile',
        ondragenter: enterTrash,
        ondragleave: exitTrash,
    });

    const back = document.createElement('div');
    back.classList.add('back', 'item');
    back.addEventListener('click', () => navigateBack());
    back.innerHTML = 'Back';

    const navigation = document.querySelector('.navigation');
    navigation.appendChild(back);

    makeFadable(back);
}

function makeEditable() {
    document.querySelectorAll('.column').forEach(column => {
        makeRowsResizable(column);
        Array.from(column.children).forEach(row => {
            row.classList.add('edit');
            makeTilesResizable(row, false);
            interact(row).dropzone({
                accept: '.tile',
                overlap: 0.5,
                ondragenter: dragEnter,
                ondragleave: dragExit,
            });
            for (let i = 0; i < row.children.length; i++) {
                const tile = row.children[i];
                tile.classList.add('edit');
                interact(tile).draggable({
                    listeners: {
                        start: startDrag,
                        move: drag,
                        end: endDrag
                    }
                });
            }
        });
        newTileRow(column);
    });
};

function removeEditable() {
    document.querySelectorAll('.column').forEach(column => {
        Array.from(column.children).forEach(row => {
            row.classList.remove('edit');
            interact(row).unset();
            row.querySelectorAll('.tile').forEach(tile => {
                tile.classList.remove('edit');
                interact(tile).unset();
            });
        });
        const lastRow = column.lastElementChild;
        if (lastRow.classList.contains('empty')) {
            column.removeChild(lastRow);
        }
    });
}

function toggleEditable(override = null) {
    editing = override !== null ? override : !editing;
    const action = document.querySelector('.action');
    fadeIn(action);
    if (editing) {
        action.classList.add('active');
        makeEditable();
    } else {
        action.classList.remove('active');
        removeEditable();
    }
}

function isEmpty(row) {
    return row.classList.contains('empty') || row.children.length === 0;
}

function isLast(row) {
    const column = row.parentNode;
    return column.lastElementChild === row;
}

function newTile(event) {
    const row = event.currentTarget;
    row.removeEventListener('click', newTile);
    // get row index
    const rowIndex = Array.from(row.parentNode.children).indexOf(row);
    console.log('new tile in row', rowIndex, row);
    const tile = document.createElement('div');
    tile.classList.add('tile', 'edit');
    tile.style.width = 'calc(100% - 0px)';
    interact(tile).draggable({
        listeners: {
            start: startDrag,
            move: drag,
            end: endDrag
        }
    });
    row.classList.remove('empty');
    row.querySelector('.add').remove();
    row.appendChild(tile);
    makeTilesResizable(row);
    newTileRow(row.parentNode);
    saveScreenState();
}

function newTileRow(column) {
    const row = document.createElement('div');
    row.classList.add('row', 'empty');
    interact(row).dropzone({
        accept: '.tile',
        overlap: 0.5,
        ondragenter: dragEnter,
        ondragleave: dragExit,
    });
    row.addEventListener('click', newTile);
    const plus = document.createElement('div');
    plus.classList.add('add');
    plus.appendChild(icons['plus'].cloneNode(true));
    row.appendChild(plus);
    column.appendChild(row);
}

function activateTrash() {
    const action = document.querySelector('.action');
    action.classList.add('delete');
    if (icons['trash']) {
        action.innerHTML = '';
        action.appendChild(icons['trash']);
    }
}

function deactivateTrash() {
    const action = document.querySelector('.action');
    action.classList.remove('delete');
    if (icons['pencil']) {
        action.innerHTML = '';
        action.appendChild(icons['pencil']);
    }
}