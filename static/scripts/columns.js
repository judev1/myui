var newColumn = null;

function countColumns() {
    const dashboard = document.querySelector('.dashboard');
    return dashboard.querySelectorAll('.column').length;
}

function addColumn() {
    const dashboard = document.querySelector('.dashboard');
    const column = document.createElement('div');
    column.classList.add('column', 'editing');
    dashboard.appendChild(column);

    const count = countColumns();
    var width = 100 / count;
    setWidth(column, width);

    if (count !== 1) {
        makeColumnsResizable();
    }
    if (count === 2) {
        makeColumnsDraggable();
    } else if (count > 2) {
        makeColumnDraggable(column);
        const columns = document.querySelectorAll('.column');
        if (count === 3) {
            var quarter = false;
            columns.forEach(e => {
                if (getWidth(e) === 25) {
                    quarter = true;
                }
            });
            if (quarter) {
                width = 25;
                setWidth(column, width);
            }
        } else if (count === 4) {
            fadeOut(add);
            add.removeEventListener('click', addColumn);
            columns.forEach(e => {
                interact(e).resizable({
                    edges: { left: false, right: false },
                });
            });
        }
    }

    fitNewChild(dashboard, column, width);
    resizeElement(column);
    saveScreenState();
}

function removeColumn() {
    fadeIn(add);
    add.addEventListener('click', addColumn);
    dragged.element.remove();
    const parent = dragged.parent;
    if (countColumns() === 1) {
        const lastElement = parent.lastElementChild;
        interact(lastElement).unset();
    } else {
        makeColumnsResizable();
        correctColumnWidths();
    }
    saveScreenState();
}

function makeColumnDraggable(column) {
    column.classList.add('editing');
    if (countColumns() === 1) {
        return;
    }
    interact(column).draggable({
        listeners: {
            start: startDrag,
            move: onDrag,
            end: endDrag
        }
    });
}

function makeColumnsDraggable() {
    const dashboard = document.querySelector('.dashboard');
    makeDragzone(dashboard);
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        makeColumnDraggable(column);
    });
}

function makeColumnsResizable() {
    const columns = document.querySelectorAll('.column');
    if (columns.length === 0) return;
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
                start: startResize,
                move: resizeColumn,
                end: endResize
            }
        });
    });
}

function viewColumns() {
    fadeOut(add);
    add.removeEventListener('click', addColumn);
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.classList.remove('editing');
    });
    removeEdit = null;
    removeElement = null;
    resizeElement = null;
}

function editColumns() {
    if (countColumns() < 4) fadeIn(add);
    add.addEventListener('click', addColumn);
    makeColumnsDraggable();
    removeEdit = viewColumns;
    removeElement = removeColumn;
    resizeElement = correctColumnWidths;
}