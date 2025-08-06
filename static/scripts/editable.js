var editable = false;

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

function addEditButton() {
    var editButton = document.querySelector('.edit-button');
    if (editButton) {
        return;
    }
    fetch('/static/images/pencil.svg')
        .then(response => response.text())
        .then(svg => {
            const body = document.querySelector('body');
            editButton = document.createElement('div');
            const parser = new DOMParser();
            const doc = parser.parseFromString(svg, 'image/svg+xml');
            const icon = doc.querySelector('svg');
            editButton.classList.add('edit-button');
            editButton.addEventListener('click', () => toggleEditable());
            editButton.appendChild(icon);
            body.appendChild(editButton);
            setTimeout(() => {
                editButton.style.opacity = '1';
            }, 100);
    });
}

function toggleEditable(override = null) {
    editable = override !== null ? override : !editable;
    const editButton = document.querySelector('.edit-button');
    if (editable) {
        editButton.classList.add('active');
        makeEditable();
    } else {
        editButton.classList.remove('active');
        removeEditable();
    }
}