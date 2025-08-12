const resizing = {
    element: null,
}

function round(num, increment) {
    return Math.round(parseFloat(num) / increment) * increment;
}

function setWidth(element, width) {
    width = round(width, 0.001);
    const offset = 10 * (1 - width / 100);
    element.style.width = `calc(${width}% - ${offset}px)`;
}

function getWidth(element) {
    const text = element.style.width;
    const match = text.match(/calc\((.*)%/);
    return parseFloat(match[1]);
}

function fitChildren(parent) {
    const children = Array.from(parent.children);
    const count = children.length;
    if (count === 0) return;
    var width = 0
    children.forEach(child => {
        width += getWidth(child);
    });
    const factor = 100 / width;
    children.forEach(child => {
        setWidth(child, getWidth(child) * factor);
    });
}

function fitNewChild(parent, element, childWidth) {
    const children = Array.from(parent.children);
    const count = children.length;
    if (count === 0) return;
    if (!childWidth) {
        const boxWidth = parent.getBoundingClientRect().width - 10 * (count - 1);
        childWidth = (dragged.width / boxWidth) * 100;
    }
    var width = -childWidth;
    children.forEach(child => {
        if (child !== element) {
            width += getWidth(child);
        }
    });
    const factor = width / 100;
    children.forEach(child => {
        if (child === element) {
            setWidth(child, childWidth);
        } else {
            setWidth(child, getWidth(child) * factor);
        }
    });
}

function startResize(event) {
    resizing.element = event.target;
}

function endResize(event) {
    resizeElement(event.target, event.edges);
    resizing.element = null;
    saveScreenState();
}

function resizeColumn(event) {
    var column = resizing.element;

    const count = countColumns();
    const parent = column.parentNode;
    const parentRect = parent.getBoundingClientRect();
    const parentWidth = parentRect.width - 10 * (count - 1);

    var oldWidth = getWidth(column);
    var width = event.rect.width / parentWidth * 100;

    const columns = Array.from(parent.children);
    var index = columns.indexOf(column);

    var left = event.edges.left;
    var right = event.edges.right;

    if (left) {
        if (event.deltaRect.width < 0) {
            if (index > 0) {
                index--;
                left = false;
                right = true;
                column = columns[index];
                width = getWidth(column) + (oldWidth - width);
                oldWidth = getWidth(column);
            }
        }
    } else if (right) {
        if (event.deltaRect.right < 0) {
            if (index < count - 1) {
                index++;
                left = true;
                right = false;
                column = columns[index];
                width = getWidth(column) + (oldWidth - width);
                oldWidth = getWidth(column);
            }
        }
    }

    if (count === 2) {
        if (width < 25) {
            width = 25;
        } else if (width > 75) {
            width = 75;
        }
        columns.forEach(column => {
            if (column !== column) {
                setWidth(column, 100 - width);
            }
        })
    } else if (count === 3) {
        if (width < 25) {
            width = 25;
        } else if (width > 50) {
            width = 50;
        }

        var overflow = 0;
        var first = null;
        var second = null;

        if (left) {
            if (index === 1) {
                first = columns[0];
            } else if (index === 2) {
                first = columns[1];
                second = columns[0];
            }
        } else if (right) {
            if (index === 1) {
                first = columns[2];
            } else if (index === 0) {
                first = columns[1];
                second = columns[2];
            }
        }
        const totalWidth = getWidth(first) + oldWidth;
        if (width > totalWidth - 25 && second) {
            overflow = width - (totalWidth - 25);
            setWidth(first, 25);
            setWidth(second, getWidth(second) - overflow);
        } else {
            if (width > totalWidth - 25) {
                width = totalWidth - 25;
            }
            setWidth(first, totalWidth - width);
        }
    }
    setWidth(column, width);
}

function correctColumnWidths(element, edges) {
    const count = countColumns();
    var width;
    var altwidth;
    var altrounded;
    if (element) {
        width = round(getWidth(element), 1);
        if (edges) {
            const children = Array.from(element.parentNode.children);
            const index = children.indexOf(element);
            if (index !== 0 && edges.left) {
                altwidth = round(getWidth(children[index - 1]), 1);
            } else if (index !== count - 1 && edges.right) {
                altwidth = round(getWidth(children[index + 1]), 1);
            }
            altrounded = round(altwidth, 25);
        }
    } else {
        width = 100 / count;
    }
    const columns = Array.from(document.querySelectorAll('.column'));
    if (count === 2) {
        columns.forEach(column => {
            setWidth(column, round(getWidth(column), 25));
        })
    } else if (count === 3) {
        const rounded = round(width, 25);
        console.log('correctColumnWidths', width, rounded, altwidth, altrounded);
        if (width === rounded || (altwidth && altwidth === altrounded)) {
            columns.forEach(column => {
                setWidth(column, round(getWidth(column), 25));
            });
        } else {
            columns.forEach(column => {
                setWidth(column, round(getWidth(column), 100 / 3));
            });
        }
    } else if (count === 4) {
        columns.forEach(column => {
            setWidth(column, 25);
        });
    }
}