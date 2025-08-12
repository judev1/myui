var add = null;
var trash = null;
var editing = false;

var removeEdit = null;
var removeElement = null;
var resizeElement = null;

function addActions() {
    const body = document.body;
    const navbar = document.querySelector('.navigation');

    const edit = document.createElement('div');
    edit.id = 'edit';
    edit.classList.add('action', 'edit');
    edit.addEventListener('click', () => toggleEditing());
    edit.appendChild(icons['pencil']);
    body.appendChild(edit);

    add = document.createElement('div');
    add.id = 'spawn';
    add.classList.add('action', 'spawn', 'add');
    add.appendChild(icons['plus']);
    body.appendChild(add);

    trash = document.createElement('div');
    trash.id = 'trash';
    trash.classList.add('action', 'spawn', 'trash');
    trash.appendChild(icons['trash']);
    body.appendChild(trash);

    interact(trash).dropzone({
        ondragenter: (event) => {
            dropzone.element = event.target;
        }
    });

    const tileEdit = document.createElement('div');
    tileEdit.id = 'tile-edit';
    tileEdit.classList.add('action', 'edit-type', 'edit-tile');
    tileEdit.appendChild(icons['tile']);
    tileEdit.addEventListener('click', () => toggleEditType(tileEdit));
    body.appendChild(tileEdit);

    const rowEdit = document.createElement('div');
    rowEdit.id = 'row-edit';
    rowEdit.classList.add('action', 'edit-type', 'edit-row');
    rowEdit.appendChild(icons['row']);
    rowEdit.addEventListener('click', () => toggleEditType(rowEdit));
    body.appendChild(rowEdit);

    const columnEdit = document.createElement('div');
    columnEdit.id = 'column-edit';
    columnEdit.classList.add('action', 'edit-type', 'edit-column');
    columnEdit.appendChild(icons['column']);
    columnEdit.addEventListener('click', () => toggleEditType(columnEdit));
    body.appendChild(columnEdit);

    const back = document.createElement('div');
    back.id = 'back';
    back.classList.add('back', 'item');
    back.addEventListener('click', () => navigateBack());
    back.innerHTML = 'Back';
    navbar.appendChild(back);

    makeFadable(edit);
    makeFadable(add);
    makeFadable(trash);

    makeFadable(tileEdit);
    makeFadable(rowEdit);
    makeFadable(columnEdit);

    makeFadable(back);
}

function toggleEditType(element) {
    if (removeEdit) {
        removeEdit();
    }
    element.parentNode.querySelectorAll('.edit-type').forEach(e => {
        if (e === element) {
            e.classList.add('active');
        } else {
            e.classList.remove('active');
        }
    });
    const type = element.id;
    if (type === 'column-edit') {
        editColumns();
    }
}

function toggleEditing(override = null) {
    editing = override !== null ? override : !editing;
    const edit = document.getElementById('edit');
    fadeIn(edit);
    if (editing) {
        edit.classList.add('active');
        document.querySelectorAll('.edit-type').forEach(editType => {
            editType.classList.add('editing');
            fadeIn(editType);
        });
    } else {
        fadeOut(add);
        edit.classList.remove('active');
        document.querySelectorAll('.edit-type').forEach(editType => {
            editType.classList.remove('editing', 'active');
            fadeOut(editType);
        });
        if (removeEdit) {
            removeEdit();
        }
    }
}

function activateTrash() {
    fadeIn(trash);
}

function deactivateTrash() {
    fadeOut(trash);
}