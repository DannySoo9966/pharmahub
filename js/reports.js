let allReports = [];
let isAscending = false;

function renderTable(dataList) {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '';

    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No transaction records found.</td></tr>';
        return;
    }

    dataList.forEach(row => {
        const time = row.txn_time ? row.txn_time.replace('T', ' ').slice(0, 19) : '-';
        const reasonText = (row.reason || '').toLowerCase();

        // Reason with difference colour
        let qtyClass = 'text-addStock'; // Green (Add Stock)

        if (reasonText.includes('loss') || reasonText.includes('expired') || reasonText.includes('damaged')) {
            qtyClass = 'text-loss';  // Red (Loss)
        } 
        else if (reasonText.includes('sale') || reasonText.includes('dispense') || reasonText.includes('selling')) {
            qtyClass = 'text-selling';    // Blue (Selling)
        }

        tbody.innerHTML += `
            <tr>
                <td>${row.txn_code}</td>
                <td>${time}</td>
                <td>${row.medicine_name || row.medicine_id}</td>
                <td>${row.batch_id}</td>
                <td>${row.txn_type}</td>
                <td class="${qtyClass}"><b>${row.qty_change}</b></td>
                <td>${row.reason}</td>
            </tr>
        `;
    });
}

function processAndDisplay() {
    const keyword = document.getElementById('filterKeyword').value.toLowerCase().trim();
    const type = document.getElementById('filterType').value;

    let filtered = allReports.filter(row => {
        const medName = (row.medicine_name || '').toLowerCase();
        const code = (row.txn_code || '').toLowerCase();
        const matchKeyword = !keyword || medName.includes(keyword) || code.includes(keyword);
        const matchType = !type || row.txn_type === type;
        return matchKeyword && matchType;
    });

    filtered.sort((a, b) => {
        const timeA = new Date(a.txn_time);
        const timeB = new Date(b.txn_time);
        return isAscending ? (timeA - timeB) : (timeB - timeA);
    });

    renderTable(filtered);
}

fetch('/api/reports')
    .then(res => res.json())
    .then(data => {
        allReports = data;
        processAndDisplay();
    });

document.getElementById('applyFilterBtn').addEventListener('click', () => {
    processAndDisplay();
});

document.getElementById('resetFilterBtn').addEventListener('click', () => {
    document.getElementById('filterKeyword').value = '';
    document.getElementById('filterType').value = '';
    processAndDisplay();
});

document.getElementById('sortTimeBtn').addEventListener('click', () => {
    isAscending = !isAscending;
    const btn = document.getElementById('sortTimeBtn');
    btn.innerHTML = isAscending ? '&#x25B2; (ASC)' : '&#x25BC; (DESC)';
    processAndDisplay();
});