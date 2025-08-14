var dummy = null;

const dragged = {
    cls: null,
    element: null,
    parent: null,
    index: null,
    width: null,
    widths: null
}

const dropzone = {
    element: null,
    widths: null,
    createTile: null
}

function dragEnter(event) {
    dropzone.element = event.target;
    if (dropzone.element.children.length === 1) {
        const child = dropzone.element.firstElementChild;
        if (child.classList.contains('create-tile')) {
            dropzone.createTile = child;
            dropzone.element.removeChild(child);
            dropzone.element.appendChild(dragged.element);
        }
    }
    if (editing.axis === 'x') {
        dropzone.widths = Array.from(dropzone.element.children).map(
            child => getWidth(child)
        );
        if (dropzone.element == dragged.parent) {
            const children = dragged.parent.children;
            dragged.parent.insertBefore(
                dragged.element,
                children[dragged.index]
            );
            dragged.widths.forEach((width, i) => {
                setWidth(children[i], width);
            });
        }
    }
    if (dropzone.element.classList.contains('empty')) {
        dropzone.element.classList.remove('empty');
        dropzone.element.appendChild(dragged.element);
    }
}

function dragLeave(event) {
    setWidth(dragged.element, dragged.width);
    const parent = dragged.element.parentNode;
    if (parent) {
        parent.removeChild(dragged.element);
        if (editing.axis === 'x') {
            if (parent.children.length === dropzone.widths.length) {
                Array.from(parent.children).forEach((child, i) => {
                    setWidth(child, dropzone.widths[i]);
                });
            }
            dropzone.widths = null;
            fitChildren(parent);
        }
    }
    if (dropzone.element) {
        if (dropzone.createTile) {
            dropzone.element.appendChild(dropzone.createTile);
            dropzone.createTile = null;
        }
        if (dropzone.element === dragged.parent) {
            if (dropzone.element.children.length === 0) {
                dropzone.element.classList.add('empty');
            }
        }
        dropzone.element = null;
    }
}

function startDrag(event) {
    activateTrash()
    const element = event.target;
    const parent = element.parentNode;
    const children = parent.children;

    element.classList.add('shadow')

    dragged.element = element
    dragged.parent = parent;
    dragged.index = Array.from(children).indexOf(element);

    const rect = element.getBoundingClientRect();
    dummy.style.height = `${rect.height}px`;
    dummy.style.width = `${rect.width}px`;

    if (editing.axis === 'x') {
        dragged.width = getWidth(element);
        dragged.widths = Array.from(children).map(
            child => getWidth(child)
        );
    }

    dummy.style.display = 'flex';
}

function onDrag(event) {
    const width = dummy.getBoundingClientRect().width;
    const height = dummy.getBoundingClientRect().height;

    let offsetX = event.pageX - width / 2;
    let offsetY = event.pageY - height / 2;

    if (offsetX < 0) {
        offsetX = 0;
    } else if (offsetX > window.innerWidth - width) {
        offsetX = window.innerWidth - width;
    }

    if (offsetY < 0) {
        offsetY = 0;
    } else if (offsetY > window.innerHeight - height) {
        offsetY = window.innerHeight - height;
    }

    dummy.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

    if (dropzone.element) {
        if (dropzone.element === trash) return;
        if (editing.axis === 'x') sortHorizontal(event);
        else if (editing.axis === 'y') sortVertical(event);
    }
}

function sortHorizontal(event) {
    const parent = dropzone.element;
    const element = dragged.element;
    const parentRect = parent.getBoundingClientRect();

    if (event.pageX < parentRect.left) return;
    if (event.pageX > parentRect.right) return;
    if (parent.children.length === 1 && parent.firstElementChild === element) {
        setWidth(element, 100);
    }
    if (!element.parentNode) {
        parent.appendChild(element);
        fitNewChild(parent);
    } else {
        parent.appendChild(element);
    }
    const children = Array.from(parent.children);
    for (i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        if (event.pageX < rect.left + rect.width + 5) {
            parent.insertBefore(element, children[i]);
            break;
        }
    }
}

function sortVertical(event) {
    const parent = dropzone.element;
    const element = dragged.element;
    const parentRect = parent.getBoundingClientRect();

    if (event.pageY < parentRect.top) return;
    if (event.pageY > parentRect.bottom) return;
    parent.appendChild(element);
    const children = Array.from(parent.children);
    for (i = 0; i < children.length; i++) {
        if (i === children.length - 1) {
            parent.insertBefore(element, children[i - 1]);
        }
        const rect = children[i].getBoundingClientRect();
        if (event.pageY < rect.top + rect.height + 5) {
            parent.insertBefore(element, children[i]);
            break;
        }
    }
}

function endDrag(event) {
    deactivateTrash()
    dummy.style.display = 'none';
    if (dropzone.element) {
        const parent = dragged.parent;
        if (dropzone.element === trash) {
            editing.remove(dragged.element);
            if (editing.axis === 'x') fitChildren(parent);
        }

    if (dragged.parent.classList.contains('empty')) {
        addCreateTile(dragged.parent);
    }
    } else {
        const parent = dragged.parent;
        const children = parent.children;
        parent.insertBefore(
            dragged.element,
            children[dragged.index]
        );
        if (editing.axis === 'x') {
            dragged.widths.forEach((width, i) => {
                setWidth(children[i], width);
            });
        }
    }

    dragged.element.classList.remove('shadow')
    dragged.parent.classList.remove('empty');

    dragged.element = null;
    dragged.parent = null;
    dragged.index = null;
    dragged.widths = null;

    dropzone.element = null;
    dropzone.createTile = null;
    saveScreenState();
}

function makeDragzone(dragzone) {
    interact(dragzone).dropzone({
        ondragenter: dragEnter,
        ondragleave: dragLeave,
    });
}

function makeDragDummy() {
    dummy = document.createElement('div');
    dummy.classList.add('dummy');
    document.body.appendChild(dummy);
}

function unmakeDraggable(element) {
    interact(element).draggable({
        enabled: false
    });
}