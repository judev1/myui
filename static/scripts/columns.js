function getColumns() {
    return document.querySelectorAll('.column');
}

function countColumns() {
    return getColumns().length;
}

function addColumn() {
    const column = document.createElement('div');
    column.classList.add('column', 'editing');
    dashboard.appendChild(column);

    const row = addRow(column);
    row.classList.remove('editing');

    const count = countColumns();
    var width = 100 / count;
    setWidth(column, width);

    if (count > 1) {
        makeColumnsResizable();
        if (count === 2) {
            makeColumnsDraggable();
        } else if (count > 2) {
            makeColumnDraggable(column);
            if (count === 3) {
                var quarter = false;
                getColumns().forEach(e => {
                    if (getWidth(e) === 25) {
                        quarter = true;
                    }
                });
                if (quarter) {
                    width = 25;
                    setWidth(column, width);
                }
            } else if (count === 4) {
                fadeOut(actions.add);
                actions.add.removeEventListener('click', addColumn);
                getColumns().forEach(e => {
                    interact(e).resizable({
                        edges: { left: false, right: false },
                    });
                });
            }
        }
    }

    fitNewChild(dashboard);
    saveScreenState();
}

function removeColumn() {
    dragged.element.remove();
    const parent = dragged.parent;
    const count = countColumns();
    if (count === 1) {
        const lastElement = parent.lastElementChild;
        interact(lastElement).unset();
    } else {
        if (count === 3) {
            fadeIn(actions.add);
            actions.add.addEventListener('click', addColumn);
        }
        makeColumnsResizable();
        fitChildren(parent);
    }
    saveScreenState();
}

function makeColumnDraggable(column) {
    column.classList.add('editing');
    if (countColumns() === 1) return;
    interact(column).draggable({
        listeners: {
            start: startDrag,
            move: onDrag,
            end: endDrag
        }
    });
}

function makeColumnsDraggable() {
    makeDragzone(dashboard);
    getColumns().forEach(column => {
        makeColumnDraggable(column);
    });
}

function makeColumnsResizable() {
    const columns = getColumns();
    if (columns.length === 4) return;
    columns.forEach((column, i) => {
        var left = true;
        var right = true;
        if (i === 0) {
            left = false;
        } else if (i === columns.length - 1) {
            right = false;
        }
        interact(column).resizable({
            edges: { left, right },
            listeners: {
                move: resize,
                end: endResize
            }
        });
    });
}

function disableColumnEdit() {
    fadeOut(actions.add);
    actions.add.removeEventListener('click', addColumn);
    getColumns().forEach(column => {
        column.classList.remove('editing');
        interact(column).unset();
    });
}

function enableColumnEdit() {
    if (countColumns() < 4) fadeIn(actions.add);
    actions.add.addEventListener('click', addColumn);
    makeColumnsDraggable();
    makeColumnsResizable();
    editing.disable = disableColumnEdit;
    editing.add = addColumn;
    editing.remove = removeColumn;
    editing.increment = 100 / 12;
    editing.minimum = editing.increment * 3;
    editing.resize = 'width';
}