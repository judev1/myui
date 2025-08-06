const INCREMENT = 100 / 12;
const MIN = INCREMENT * 2;

const resizing = {
    tile: null,
    lastWidth: null,
    height: null
}

function round(num, incr) {
    return Math.round(parseFloat(num) / incr) * incr;
}

function setWidth(tile, width) {
    width = round(width, 0.001);
    const offset = 10 * (1 - width / 100);
    tile.style.width = `calc(${width}% - ${offset}px)`;
}

function getWidth(tile) {
    const text = tile.style.width;
    const match = text.match(/calc\((.*)%/);
    return parseFloat(match[1]);
}

function resizeTileStart(event) {
    resizing.tile = event.target;
    resizing.lastWidth = getWidth(resizing.tile);
}

function resizeTile(event) {
    const tile = resizing.tile;
    const row = tile.parentNode;

    const rowWidth = row.getBoundingClientRect().width;
    const ratio = event.deltaRect.width / rowWidth * 100;
    const lastWidth = round(resizing.lastWidth, 0.001);
    var width = round(lastWidth + ratio, 0.001);

    if (event.deltaRect.bottom !== 0) {
        const height = event.rect.height;
        row.style.height = `${height}px`;
    }

    if (width < MIN) {
        width = MIN;
    }

    if (width === lastWidth) {
        return;
    } else if (width < lastWidth) {
        var adjacent = null;
        if (event.edges.left) {
            adjacent = tile.previousElementSibling;
        } else if (event.edges.right) {
            adjacent = tile.nextElementSibling;
        }
        const adjacentWidth = getWidth(adjacent);
        const diff = lastWidth - width;
        setWidth(adjacent, adjacentWidth + diff);
    } else {
        const adjacentArray = [];
        const index = Array.from(row.children).indexOf(tile);
        if (event.edges.left) {
            for (let i = index - 1; i >= 0; i--) {
                adjacentArray.push(row.children[i]);
            }
        } else if (event.edges.right) {
            for (let i = index + 1; i < row.children.length; i++) {
                adjacentArray.push(row.children[i]);
            }
        }
        var overflow = width - lastWidth;
        for (let i = 0; i < adjacentArray.length; i++) {
            const adjacent = adjacentArray[i];
            const adjacentWidth = getWidth(adjacent);
            if (adjacentWidth - overflow >= MIN) {
                setWidth(adjacent, adjacentWidth - overflow);
                overflow = 0;
                break;
            } else {
                setWidth(adjacent, MIN);
                overflow -= (adjacentWidth - MIN);
            }
        }
        if (overflow > 0) {
            width -= overflow
        }
    }
    setWidth(tile, width);
    resizing.lastWidth = width;
}

function endResizeTile(event) {
    const tile = resizing.tile;
    const row = tile.parentNode;
    const lastWidth = resizing.lastWidth;
    var width = round(lastWidth, INCREMENT);

    endResize(row, event.rect.height);

    if (width < MIN) {
        width = MIN;
    }

    if (width < lastWidth) {
        var adjacent = null;
        if (event.edges.left) {
            adjacent = tile.previousElementSibling;
        } else if (event.edges.right) {
            adjacent = tile.nextElementSibling;
        }
        const adjacentWidth = getWidth(adjacent);
        const diff = lastWidth - width;
        const newWidth = round(adjacentWidth + diff, INCREMENT);
        setWidth(adjacent, newWidth);
    } else {
        const adjacentArray = [];
        const index = Array.from(row.children).indexOf(tile);
        if (event.edges.left) {
            for (let i = index - 1; i >= 0; i--) {
                adjacentArray.push(row.children[i]);
            }
        } else if (event.edges.right) {
            for (let i = index + 1; i < row.children.length; i++) {
                adjacentArray.push(row.children[i]);
            }
        }
        var overflow = width - lastWidth;
        for (let i = 0; i < adjacentArray.length; i++) {
            const adjacent = adjacentArray[i];
            const adjacentWidth = getWidth(adjacent);
            if (adjacentWidth - overflow >= MIN) {
                setWidth(adjacent, adjacentWidth - overflow);
                overflow = 0;
                break;
            } else {
                setWidth(adjacent, MIN);
                overflow -= (adjacentWidth - MIN);
            }
        }
        if (overflow > 0) {
            width -= overflow
        }
    }
    setWidth(tile, width);
    resizing.tile = null;
    resizing.lastWidth = null;
    saveScreenState();
}

function makeTilesResizable(row, update=true) {
    const count = row.children.length;
    if (count === 1) {
        if (update) {
            setWidth(row.children[0], 100);
        }
        interact(row.children[0]).resizable({
            edges: { left: false, right: false, bottom: true },
            listeners: {
                move: (event) => { resizeRow(row, event.rect.height) },
                end: (event) => { endResize(row, event.rect.height) }
            }
        });
        return;
    }
    const width = 100 / count;
    for (let i = 0; i < count; i++) {
        const tile = row.children[i];
        if (update) {
            setWidth(tile, width);
        }
        if (i === 0) {
            interact(tile).resizable({
                edges: { left: false, right: true, bottom: true },
                listeners: {
                    start: resizeTileStart,
                    move: resizeTile,
                    end: endResizeTile
                }
            });
        } else if (i === count - 1) {
            interact(tile).resizable({
                edges: { left: true, right: false, bottom: true },
                listeners: {
                    start: resizeTileStart,
                    move: resizeTile,
                    end: endResizeTile
                }
            });
        } else {
            interact(tile).resizable({
                edges: { left: true, right: true, bottom: true },
                listeners: {
                    start: resizeTileStart,
                    move: resizeTile,
                    end: endResizeTile
                }
            });
        }
    }
}

function resizeRow(row, height) {
    row.style.height = `${height}px`;
}

function endResize(row, height) {
    const increment = 200;
    height = round(height, increment);
    if (height < increment) {
        row.style.height = `calc(${increment}px - 10px)`;
    } else {
        row.style.height = `calc(${height}px - 10px)`;
    }
    saveScreenState();
}

function makeRowsResizable(column) {
    const count = column.children.length;
    for (let i = 0; i < count; i++) {
        const row = column.children[i];
        interact(row).resizable({
            edges: { bottom: true },
            listeners: {
                move: (event) => { resizeRow(row, event.rect.height) },
                end: (event) => { endResize(row, event.rect.height) }
            }
        });
    }
}