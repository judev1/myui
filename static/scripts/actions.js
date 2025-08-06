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
        const emptyRow = document.createElement('div');
        emptyRow.classList.add('row', 'empty');
        interact(emptyRow).dropzone({
            accept: '.tile',
            overlap: 0.5,
            ondragenter: dragEnter,
            ondragleave: dragExit,
        });
        column.appendChild(emptyRow);
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
        if (lastRow.children.length === 0) {
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