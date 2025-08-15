const actions = {
    add: null,
    cancel: null,
    remove: null,
    edit: null,
    tileEdit: null,
    rowEdit: null,
    columnEdit: null,
    editTypes: [],
    back: null
}

const editing = {
    active: false,
    type: null,
    disable: null,
    remove: null,
    increment: null,
    minimum: null,
    axis: null
}

function addActions() {
    const body = document.body;
    const navbar = document.querySelector('.navigation');

    actions.edit = document.createElement('div');
    actions.edit.id = 'edit';
    actions.edit.classList.add('action', 'edit');
    actions.edit.addEventListener('click', () => toggleEditing());
    actions.edit.appendChild(icons['pencil']);
    body.appendChild(actions.edit);

    actions.add = document.createElement('div');
    actions.add.id = 'add';
    actions.add.classList.add('action', 'spawn', 'add');
    actions.add.appendChild(icons['plus']);
    body.appendChild(actions.add);

    actions.cancel = document.createElement('div');
    actions.cancel.id = 'cancel';
    actions.cancel.classList.add('action', 'spawn', 'cancel');
    actions.cancel.appendChild(icons['plus'].cloneNode(true));
    body.appendChild(actions.cancel);

    actions.remove = document.createElement('div');
    actions.remove.id = 'trash';
    actions.remove.classList.add('action', 'spawn', 'trash');
    actions.remove.appendChild(icons['trash']);
    body.appendChild(actions.remove);

    interact(actions.remove).dropzone({
        ondragenter: (event) => {
            dropzone.element = event.target;
        }
    });

    actions.tileEdit = document.createElement('div');
    actions.tileEdit.id = 'tile-edit';
    actions.tileEdit.classList.add('action', 'edit-type', 'edit-tile');
    actions.tileEdit.appendChild(icons['tile']);
    actions.tileEdit.addEventListener('click', () => toggleEditType('tile'));
    body.appendChild(actions.tileEdit);
    actions.editTypes.push(actions.tileEdit);

    actions.rowEdit = document.createElement('div');
    actions.rowEdit.id = 'row-edit';
    actions.rowEdit.classList.add('action', 'edit-type', 'edit-row');
    actions.rowEdit.appendChild(icons['row']);
    actions.rowEdit.addEventListener('click', () => toggleEditType('row'));
    body.appendChild(actions.rowEdit);
    actions.editTypes.push(actions.rowEdit);

    actions.columnEdit = document.createElement('div');
    actions.columnEdit.id = 'column-edit';
    actions.columnEdit.classList.add('action', 'edit-type', 'edit-column');
    actions.columnEdit.appendChild(icons['column']);
    actions.columnEdit.addEventListener('click', () => toggleEditType('column'));
    body.appendChild(actions.columnEdit);
    actions.editTypes.push(actions.columnEdit);

    actions.back = document.createElement('div');
    actions.back.id = 'back';
    actions.back.classList.add('back', 'item');
    actions.back.addEventListener('click', () => navigateBack());
    actions.back.innerHTML = 'Back';
    navbar.appendChild(actions.back);

    makeFadable(actions.edit);
    makeFadable(actions.add);
    makeFadable(actions.cancel);
    makeFadable(actions.remove);

    makeFadable(actions.tileEdit);
    makeFadable(actions.rowEdit);
    makeFadable(actions.columnEdit);

    makeFadable(actions.back);
}

async function toggleEditType(type) {
    if (editing.type === type) return;
    if (editing.disable) await editing.disable();
    resetEditing();
    editing.active = true;
    actions.editTypes.forEach(e => {
        if (e.id === type + '-edit') e.classList.add('active');
        else e.classList.remove('active');
    });
    editing.type = type;
    if (editing.type === 'column') await enableColumnEdit();
    else if (editing.type === 'row') await enableRowEdit();
    else if (editing.type === 'tile') await enableTileEdit();
}

async function toggleEditing(override = null) {
    editing.active = override === true || !editing.active;
    if (editing.active) {
        fadeIn(actions.edit);
        actions.edit.classList.add('active');
        actions.editTypes.forEach(e => {
            e.classList.add('editing');
            fadeIn(e);
        });
    } else {
        fadeOut(dashboard);
        fadeOut(actions.add);
        actions.edit.classList.remove('active');
        actions.editTypes.forEach(e => {
            e.classList.remove('editing', 'active');
            fadeOut(e);
        });
        if (editing.disable) editing.disable();
        resetEditing();
    }
}

function resetEditing() {
    editing.active = false;
    editing.type = null;
    editing.disable = null;
    editing.remove = null;
    editing.increment = null;
    editing.minimum = null;
    editing.axis = null;
}

function activateTrash() {
    fadeIn(actions.remove);
}

function deactivateTrash() {
    fadeOut(actions.remove);
}