function loadFromJSON(json) {
    const dashboard = document.createElement('div');
    const columnDiv = document.createElement('div');
    const rowDiv = document.createElement('div');
    const tileDiv = document.createElement('div');
    dashboard.classList.add('dashboard');
    columnDiv.classList.add('column');
    rowDiv.classList.add('row');
    tileDiv.classList.add('tile');
    json.columns.forEach(column => {
        const columnClone = columnDiv.cloneNode();
        column.rows.forEach(row => {
            const rowClone = rowDiv.cloneNode();
            const height = `${row.height - 10}px`;
            rowClone.style.height = height;
            row.tiles.forEach(tile => {
                const tileClone = tileDiv.cloneNode();
                setWidth(tileClone, tile.width);
                // tileClone.textContent = tile.content;
                rowClone.appendChild(tileClone);
            });
            columnClone.appendChild(rowClone);
        });
        dashboard.appendChild(columnClone);
    });
    return dashboard.outerHTML;
}

function saveToJSON() {
    const dashboard = { columns: [] };
    document.querySelectorAll('.column').forEach(column => {
        const columnData = { rows: [] };
        column.querySelectorAll('.row').forEach(row => {
            if (row.classList.contains('empty')) return;
            const rowData = { height: parseInt(getComputedStyle(row).height) + 10, tiles: [] };
            row.querySelectorAll('.tile').forEach(tile => {
                const tileData = { width: getWidth(tile), content: tile.textContent };
                rowData.tiles.push(tileData);
            });
            columnData.rows.push(rowData);
        });
        dashboard.columns.push(columnData);
    });
    return JSON.stringify(dashboard);
}