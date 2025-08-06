var editable = false;

const icons = {
    'pencil': null,
    'trash': null,
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

function addAction() {
    var action = document.querySelector('.action');
    if (action) {
        return;
    }
    const parser = new DOMParser();
    fetch('/static/images/pencil.svg')
        .then(response => response.text())
        .then(svg => {
            const body = document.querySelector('body');
            action = document.createElement('div');
            const doc = parser.parseFromString(svg, 'image/svg+xml');
            const icon = doc.querySelector('svg');
            icons['pencil'] = icon;
            action.classList.add('action');
            action.addEventListener('click', () => toggleEditable());
            action.appendChild(icon);
            body.appendChild(action);
            interact(action).dropzone({
                accept: '.tile',
                ondragenter: enterTrash,
                ondragleave: exitTrash,
            });
            fetch('/static/images/trash.svg')
                .then(response => response.text())
                .then(svg => {
                    const doc = parser.parseFromString(svg, 'image/svg+xml');
                    const icon = doc.querySelector('svg');
                    icons['trash'] = icon;
            });
            setTimeout(() => {
                action.style.opacity = '1';
            }, 100);
    });
}

function toggleEditable(override = null) {
    editable = override !== null ? override : !editable;
    const action = document.querySelector('.action');
    if (editable) {
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