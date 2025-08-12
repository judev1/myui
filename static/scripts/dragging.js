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
    widths: null
}

function dragEnter(event) {
    dropzone.element = event.target;
    dropzone.widths = Array.from(dropzone.element.children).map(
        child => getWidth(child)
    );
}

function dragLeave(event) {
    const parent = dragged.element.parentNode;
    if (parent) {
        parent.removeChild(dragged.element);
        if (parent.children.length === dropzone.widths.length) {
            Array.from(parent.children).forEach((child, i) => {
                setWidth(child, dropzone.widths[i]);
            });
        }
        dropzone.element = null;
        dropzone.widths = null;
        fitChildren(parent);
        resizeElement();
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

    const rect = element.getBoundingClientRect();
    dummy.style.height = `${rect.height}px`;
    dummy.style.width = `${rect.width}px`;

    dragged.width = rect.width;
    dragged.widths = Array.from(children).map(
        child => getWidth(child)
    );

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

    const parent = dragged.parent;
    const element = dragged.element;
    const parentRect = parent.getBoundingClientRect()

    if (dropzone.element) {
        if (dropzone.element === trash) return;
        if (event.pageX < parentRect.left) return;
        if (event.pageX > parentRect.right) return;
        if (!element.parentNode) {
            parent.appendChild(element)
            fitNewChild(parent, element)
            resizeElement(element);
        } else {
            parent.appendChild(element)
        }
        const children = Array.from(parent.children);
        for (i = 0; i < children.length; i++) {
            const rect = children[i].getBoundingClientRect();
            if (event.pageX < rect.left + rect.width + 5) {
                parent.insertBefore(element, children[i]);
                break
            }
        }
    }
}

function endDrag(event) {
    deactivateTrash()
    dummy.style.display = 'none';
    if (dropzone.element) {
        const parent = dragged.parent;
        if (dropzone.element === trash) {
            removeElement();
            fitChildren(parent);
        }
    } else {
        const parent = dragged.parent;
        const children = parent.children;
        parent.insertBefore(
            dragged.element,
            children[dragged.index]
        );
        dragged.widths.forEach((width, i) => {
            setWidth(children[i], width);
        });
    }

    dragged.element.classList.remove('shadow')

    dragged.element = null;
    dragged.parent = null;
    dragged.index = null;
    dragged.widths = null;

    dropzone.element = null;
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