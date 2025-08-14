function sum(array) {
    return array.reduce((sum, value) => sum + value, 0);
}

function round(num, increment) {
    return Math.round(parseFloat(num) / increment) * increment;
}

function setWidth(element, width) {
    width = round(width, 0.001);
    const offset = 10 * (1 - width / 100);
    element.style.width = `calc(${width}% - ${offset}px)`;
}

function setHeight(element, height) {
    height = round(height, 200) - 10;
    element.style.height = `${height}px`;
}

function getWidth(element) {
    const text = element.style.width;
    const match = text.match(/calc\((.*)%/);
    return parseFloat(match[1]);
}

function getHeight(element) {
    const text = element.style.height;
    const match = text.match(/(\d+)px/);
    return parseFloat(match[1]);
}

function fitChildren(parent) {
    const children = Array.from(parent.children);
    const count = children.length;
    if (count === 0) return;
    var width = 0;
    children.forEach(child => {
        width += getWidth(child);
    });
    const factor = 100 / width;
    children.forEach(child => {
        const childWidth = getWidth(child) * factor;
        setWidth(child, round(childWidth, editing.increment));
    });
}

function fitNewChild(parent, element) {
    const children = Array.from(parent.children);
    const totalWidth = sum(children.map(getWidth));
    var excess =  round(totalWidth - 100, editing.increment);
    while (excess > 0) {
        const lastExcess = excess;
        for (const child of children) {
            if (child === element) continue;
            var width = getWidth(child);
            if (width > editing.minimum) {
                width = width - editing.increment
                setWidth(child, round(width, editing.increment));
                excess -= editing.increment;
                excess = round(excess, editing.increment);
                if (excess <= 0) break;
            }
        }
        if (lastExcess === excess) break;
    }
    if (excess > 0) {
        const width = getWidth(element) - excess;
        setWidth(element, round(width, editing.increment));
    }
}

function resize(event) {
    var element = event.target;
    const parent = element.parentNode;

    const children = Array.from(parent.children);
    var index = children.indexOf(element);

    const parentRect = parent.getBoundingClientRect();
    const parentWidth = parentRect.width - 10 * (children.length - 1);

    var left = event.edges.left;
    var right = event.edges.right;
    var dWidth;

    const rect = element.getBoundingClientRect();
    if (left) dWidth = rect.left - event.clientX;
    else if (right) dWidth = event.clientX - rect.right;

    var oldWidth = getWidth(element);
    var change = (dWidth / parentWidth) * 100;
    var width = oldWidth + change;

    if (left) {
        if (change < 0) {
            if (index > 0) {
                index--;
                left = false;
                right = true;
                element = children[index];
                change = -change;
                width = getWidth(element) + change;
                oldWidth = getWidth(element);
            }
        }
    } else if (right) {
        if (change < 0) {
            if (index < children.length - 1) {
                index++;
                left = true;
                right = false;
                element = children[index];
                change = -change;
                width = getWidth(element) + change;
                oldWidth = getWidth(element);
            }
        }
    }

    const adjacent = [];

    if (right) {
        for (let i = index + 1; i < children.length; i++) {
            adjacent.push(children[i]);
        }
    } else if (left) {
        for (let i = index - 1; i >= 0; i--) {
            adjacent.push(children[i]);
        }
    }

    const adjacentWidth = sum(adjacent.map(getWidth));
    var totalWidth = adjacentWidth + oldWidth

    const minimum = editing.minimum;
    const maximum = totalWidth - (minimum * adjacent.length);

    if (width < minimum) {
        width = minimum;
        change = minimum - oldWidth;
    } else if (width > maximum) {
        width = maximum;
        change = maximum - oldWidth;
    }

    var overflow = change;
    for (const child of adjacent) {
        if (overflow === 0) break;
        var childWidth = getWidth(child);
        const newWidth = Math.max(childWidth - overflow, minimum);
        overflow -= (childWidth - newWidth);
        setWidth(child, newWidth);
    }

    setWidth(element, width);
}

function endResize(event) {
    const parent = event.target.parentNode;
    const children = Array.from(parent.children);
    children.forEach(child => {
        const width = getWidth(child);
        setWidth(child, round(width, editing.increment));
    });
    saveScreenState();
}