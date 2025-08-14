function getRows(column) {
    return column.querySelectorAll('.row')
}

function addCreateRow(column) {
    const createRowDiv = document.createElement('div');
    createRowDiv.classList.add('row', 'create-row');
    createRowDiv.addEventListener('click', () => addRow(column, createRowDiv));
    column.appendChild(createRowDiv);
    const plusIcon = icons['plus'].cloneNode(true);
    createRowDiv.appendChild(plusIcon);
}

function addRow(column, createRowDiv) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row', 'editing');
    setHeight(rowDiv, 200);
    column.appendChild(rowDiv);
    if (createRowDiv) {
        column.appendChild(createRowDiv);
        makeRowDraggable(rowDiv);
        saveScreenState();
    }
    return rowDiv;
}

function removeRow() {
    dragged.element.remove();
    saveScreenState();
}

function makeRowDraggable(row) {
    interact(row).draggable({
        listeners: {
            start: startDrag,
            move: onDrag,
            end: endDrag
        }
    });
}

async function disableRowEdit() {
    await fadeOut(dashboard);
    getColumns().forEach(column => {
        column.removeChild(column.lastElementChild);
        interact(column).unset();
        getRows(column).forEach(row => {
            row.classList.remove('editing');
            interact(row).unset();
        });
    });
    removeEdit = null;
}

async function enableRowEdit() {
    getColumns().forEach(column => {
        makeDragzone(column);
        getRows(column).forEach(row => {
            row.classList.add('editing');
            makeRowDraggable(row);
        });
        addCreateRow(column);
    });
    editing.disable = disableRowEdit;
    editing.remove = removeRow;
    editing.axis = 'y';
    await fadeIn(dashboard);
}