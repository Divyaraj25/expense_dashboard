// JavaScript functionality for the financial tracking dashboard
// Externalized to avoid document length issues

let globalData = [];

// File upload and drag-and-drop logic
const uploadArea = document.getElementById('upload-area');
const uploadInput = document.getElementById('upload');

uploadArea.addEventListener('click', () => uploadInput.click());
uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.backgroundColor = 'transparent';
});
uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.style.backgroundColor = 'transparent';
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
});
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
});

document.getElementById('download-sample').addEventListener('click', () => {
    const sampleData = [
        ['Date', 'Day', 'Time', 'Unique Keyword', 'Get/Spend Type', 'Money', 'Description', 'Money Type', 'Place', 'Remaining Money in Cash', 'Remaining Money in Online', 'Whole Total'],
        ['05-01-2025', 'Sunday', '11:00 PM', 'elluminati', '0', '? 5000.00', 'Elluminati stipend', '1', 'home', '? 400.00', '? 5900.38', '? 6300.38']
    ];
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    document.getElementById('download-sample').href = url;
});

function processFile(file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const csvData = e.target.result;
            console.log(csvData)
            const jsonData = await convertCSVToJSON(csvData);
            console.log(jsonData)
            if (!Array.isArray(jsonData)) {
                alert('Invalid CSV format. Please provide an array of transaction records.');
                return;
            }
            globalData = jsonData;
            document.getElementById('dashboard').style.display = 'grid';
            document.getElementById('filters').style.display = 'block';
            populateFilters(jsonData);
            generateDashboard(jsonData);
        } catch (error) {
            alert('Invalid CSV file. Please check the structure and try again.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function convertCSVToJSON(csv) {
    const csvData = csv;
    const lines = csvData.split('\n').filter(line => line.trim() !== ''); // remove empty lines
    const headers = lines[0].split(',');

    const tickMarkIndex = headers.indexOf('Tick mark');
    if (tickMarkIndex !== -1) {
        headers.splice(tickMarkIndex, 1); // remove 'tick mark' header
    }

    const result = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/);

        if (tickMarkIndex !== -1) {
            values.splice(tickMarkIndex, 1); // remove 'tick mark' value
        }

        // process the values as needed
        const obj = headers.reduce((acc, header, index) => {
            let value = values[index]?.trim() || '';
            // Special cleaning for currency columns like 'Money', 'Remaining Money', 'Whole Total'
            if (header.toLowerCase().includes('money') || header.toLowerCase().includes('total')) {
                value = value.replace(/[",?]/g, ''); // Remove double quotes, "?" and "," from currency values
                value = parseFloat(value); // Parse currency value as float
            }
            acc[header.trim()] = value;
            return acc;
        }, {});
        return obj;
    });
    return result;
}

function convertCSVToJSON2() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a CSV file first.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result;
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        const result = lines.slice(1).map(line => {
            const values = line.split(',');

            // Clean up currency values and format properly
            const cleanMoney = (value) => {
                return parseFloat(value.replace(/[^\d.-]/g, '').replace(',', '')) || 0;
            };

            const obj = headers.reduce((acc, header, index) => {
                let value = values[index]?.trim() || '';

                // Special cleaning for currency columns like 'Money', 'Remaining Money', 'Whole Total'
                if (header.toLowerCase().includes('money') || header.toLowerCase().includes('total')) {
                    value = cleanMoney(value);
                }

                acc[header.trim()] = value;
                return acc;
            }, {});

            return obj;
        });

        const jsonResult = JSON.stringify(result, null, 4);
        displayJSON(jsonResult);
    };

    reader.readAsText(file);
}

// this function convert csv to json and return json
async function convertCSVToJSON3(csv) {
    return new Promise((resolve, reject) => {
        try {
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            const result = lines.slice(1).map(line => {
                const values = line.split(',').map(value => value.trim().replace(/[,\?]/g, ''));
                const obj = headers.reduce((acc, header, index) => {
                    let value = values[index];
                    // Special cleaning for currency columns like 'Money', 'Remaining Money', 'Whole Total'
                    if (header.toLowerCase().includes('money') || header.toLowerCase().includes('total')) {
                        value = cleanMoney(value);
                    }
                    acc[header] = value;
                    return acc;
                }, {});
                return obj;
            });
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

// this function convert csv to json and return json
async function convertCSVToJSON4(csv) {
    return new Promise((resolve, reject) => {
        try {
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            const result = lines.slice(1).map(line => {
                const values = line.split(',').map(value => value.trim());
                const obj = headers.reduce((acc, header, index) => {
                    let value = values[index];
                    // Special cleaning for currency columns like 'Money', 'Remaining Money', 'Whole Total'
                    if (header.toLowerCase().includes('money') || header.toLowerCase().includes('total')) {
                        value = cleanMoney(value);
                    }
                    acc[header] = value;
                    return acc;
                }, {});
                return obj;
            });
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
}

// this function convert csv to json and return json
async function convertCSVToJSON5(csv) {
    return new Promise((resolve, reject) => {
        try {
            console.log(csv)

            // /*************  ✨ Codeium Command 🌟  *************/
            // i am getting this type of csv data, adjust it in converting to json
            // Date,Day,Time,Unique Keyword,Get/Spend Type,Money,Description,Money Type,Place,Remaining Money in Cash,Remaining Money in Online,Whole Total
            // 05-01-2025,Sunday,11:00 PM,elluminati,0,"? 5,000.00",Elluminati stipend,1,home,? 400.00,"? 5,900.38","? 6,300.38"
            // 06-01-2025,Monday,7:30 PM,binance,0,? 704.08,Binance withdraw,1,home,? 400.00,"? 6,604.46","? 7,004.46"
            // 06-01-2025,Monday,7:30 PM,anonymous,0,? 40.00,Ankit given to me for bike taken,1,home,? 400.00,"? 6,644.46","? 7,044.46"
            // 07-01-2025,Tuesday,7:30 PM,binance,0,? 519.48,Binance withdraw,1,home,? 400.00,"? 7,163.94","? 7,563.94"
            // 14-01-2025,Tuesday,11:00 AM,anonymous,0,? 100.00,given by baa,0,home,? 500.00,"? 7,163.94","? 7,663.94"
            // 16-01-2025,Thursday,9:00 PM,miraj spend,1,? 800.00,"given to miraj, for their usage, for proof, see instagram chat with miraj",1,home,? 500.00,"? 6,363.94","? 6,863.94"
            // 18-01-2025,Saturday,11:30 AM,anonymous,0,? 700.00,"taken my rupees that I have given to bhargav's friend, for proof, see whatsapp chat with bhargav",1,home,? 500.00,"? 7,063.94","? 7,563.94"
            // 19-01-2025,Sunday,3:50 PM,course,1,? 942.40,"taken python course with AI, from aifortechies startup, proof is in email account -9425",1,home,? 500.00,"? 6,121.54","? 6,621.54"
            // 20-01-2025,Monday,7:48 PM,yugansh,1,? 220.00,"yugansh profit from binance, actually my loss",1,home,? 500.00,"? 5,901.54","? 6,401.54"
            // 22-01-2025,Wednesday,8:45 AM,pulsur petrol,1,? 100.00,"pulsur petrol fill, because it is in reserve and I forgot to tell about petrol is over to father",0,madhapar chawk,? 400.00,"? 6,121.54","? 6,521.54"
            // take reference from convertCSVToJSON2 function
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            const result = lines.slice(1).map(line => {
                const values = line.split(',').map(value => value.trim().replace(/[,\?]/g, ''));
                const obj = headers.reduce((acc, header, index) => {
                    let value = values[index];
                    // Special cleaning for currency columns like 'Money', 'Remaining Money', 'Whole Total'
                    if (header.toLowerCase().includes('money') || header.toLowerCase().includes('total')) {
                        value = cleanMoney(value);
                    }
                    acc[header] = Number.isNaN(parseFloat(value)) ? 0 : parseFloat(value);
                    return acc;
                }, {});
                return obj;
            });
            console.log(result)
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
    // /******  ab70155d-f724-4d43-88df-f13b5837233c  *******/
}

// Clean up currency values and format properly
function cleanMoney(value) {
    return parseFloat(value.replace(/[^\d.-]/g, '').replace(',', '')) || 0;
};

// function convertCSVToJSON() {
//     const fileInput = document.getElementById('csvFile');
//     const file = fileInput.files[0];

//     if (!file) {
//         alert('Please upload a CSV file first.');
//         return;
//     }

//     const reader = new FileReader();
//     reader.onload = function (e) {
//         const csvData = e.target.result;
//         const lines = csvData.split('\n');
//         const headers = lines[0].split(',');

//         const result = lines.slice(1).map(line => {
//             const values = line.split(',');
//             const obj = headers.reduce((acc, header, index) => {
//                 acc[header.trim()] = values[index]?.trim() || '';
//                 return acc;
//             }, {});
//             return obj;
//         });

//         const jsonResult = JSON.stringify(result, null, 4);
//         displayJSON(jsonResult);
//     };

//     reader.readAsText(file);
// }

function populateFilters(data) {
    const keywordSet = new Set(data.map(item => item['Unique Keyword']));
    const keywordFilter = document.getElementById('keyword-filter');
    keywordFilter.innerHTML = '<option value="">All</option>';
    keywordSet.forEach(keyword => {
        keywordFilter.innerHTML += `<option value="${keyword}">${keyword}</option>`;
    });
}

// apply filters when "Apply Filters" button is clicked
document.getElementById('apply-filters').addEventListener('click', () => {
    const keywordFilter = document.getElementById('keyword-filter').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const minMoney = document.getElementById('min-money').value;
    const maxMoney = document.getElementById('max-money').value;
    const filteredData = filterData(keywordFilter, startDate, endDate, minMoney, maxMoney);
    generateDashboard(filteredData);
});

// filterData function
function filterData(keywordFilter, startDate, endDate, minMoney, maxMoney) {
    const filteredData = globalData.filter(item => {
        const date = new Date(item['Date']);
        return (
            (!keywordFilter || item['Unique Keyword'] === keywordFilter) &&
            (!startDate || date >= new Date(startDate)) &&
            (!endDate || date <= new Date(endDate)) &&
            (!minMoney || safeParseFloat(item['Money']) >= minMoney) &&
            (!maxMoney || safeParseFloat(item['Money']) <= maxMoney)
        );
    });
    return filteredData;
}

// clear-filter button
document.getElementById('clear-filters').addEventListener('click', () => {
    clearFilters();
});

// clear filters functon
function clearFilters() {
    document.getElementById('keyword-filter').value = '';
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('min-money').value = '';
    document.getElementById('max-money').value = '';
    generateDashboard(globalData);
}

function generateDashboard(data) {
    if (!data.length) {
        alert('No data available for the selected filters.');
        clearDashboard();
        return;
    }

    updateBalanceOverview(data);
    updateIncomeExpenseTrends(data);
    updateSpendingByCategory(data);
    updateCashFlow(data);
    updateTransactionByPlace(data);
    updateDescriptionSection(data);
}

function updateBalanceOverview(data) {
    const balanceCash = safeParseFloat(data[data.length - 1]?.['Remaining Money in Cash'] || 0);
    const balanceOnline = safeParseFloat(data[data.length - 1]?.['Remaining Money in Online'] || 0);

    Plotly.newPlot('balance-overview', [{
        type: 'pie',
        values: [balanceCash, balanceOnline],
        labels: ['Cash', 'Online'],
        textinfo: 'label+percent',
        hole: 0.4
    }], {
        title: 'Balance Overview'
    });
}

function updateIncomeExpenseTrends(data) {
    const incomeData = data.filter(item => item['Get/Spend Type'] === "0");
    const expenseData = data.filter(item => item['Get/Spend Type'] === "1");

    Plotly.newPlot('income-expense-trends', [
        {
            x: incomeData.map(item => item['Date']),
            y: incomeData.map(item => safeParseFloat(item['Money'])),
            type: 'bar',
            name: 'Income',
            hoverinfo: 'x+y+text',
            hovertext: incomeData.map(item => item['Description'])
        },
        {
            x: expenseData.map(item => item['Date']),
            y: expenseData.map(item => safeParseFloat(item['Money'])),
            type: 'bar',
            name: 'Expense',
            hoverinfo: 'x+y+text',
            hovertext: expenseData.map(item => item['Description'])
        }
    ], {
        title: 'Income vs Expense Trends',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Amount' },
        barmode: 'group'
    });
}

function updateSpendingByCategory(data) {
    const moneyValues = data.map(item => safeParseFloat(item['Money']));
    const uniqueKeywords = data.map(item => item['Unique Keyword']);

    Plotly.newPlot('spending-by-category', [{
        type: 'pie',
        values: moneyValues,
        labels: uniqueKeywords,
        textinfo: 'label+percent'
    }], {
        title: 'Spending by Unique Keyword'
    });
}

function updateCashFlow(data) {
    const dates = data.map(item => item['Date']);
    const totals = data.map(item => safeParseFloat(item['Whole Total']));

    Plotly.newPlot('cash-flow', [{
        x: dates,
        y: totals,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Total Balance'
    }], {
        title: 'Cash Flow Over Time',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Balance' }
    });
}

function updateTransactionByPlace(data) {
    const places = data.map(item => item['Place']);
    const placeCounts = {};
    places.forEach(place => {
        placeCounts[place] = (placeCounts[place] || 0) + 1;
    });

    Plotly.newPlot('transaction-by-place', [{
        x: Object.keys(placeCounts),
        y: Object.values(placeCounts),
        type: 'bar',
        name: 'Transaction Count'
    }], {
        title: 'Transaction Volume by Place',
        xaxis: { title: 'Place' },
        yaxis: { title: 'Count' }
    });
}

function updateDescriptionSection(data) {
    const descriptionSection = document.getElementById('description-section');
    const descriptions = data.reduce((acc, item) => {
        const key = item['Unique Keyword'];
        acc[key] = acc[key] || [];
        acc[key].push({
            date: item['Date'],
            money: safeParseFloat(item['Money']),
            description: item['Description'],
            getType: item['Get/Spend Type'],
            moneyType: item['Money Type']
        });
        return acc;
    }, {});

    let descriptionHTML = '<h3>Descriptions by Unique Keyword</h3>';
    for (const [keyword, items] of Object.entries(descriptions)) {
        descriptionHTML += `<h4>${keyword}</h4><ul>`;
        items.forEach(item => {
            const getTypeClass = item.getType === "0" ? 'income' : 'expense';
            const moneyTypeClass = item.moneyType === 0 ? 'cash' : 'online';
            descriptionHTML += `<li>
                <span class="badge ${getTypeClass}">${item.getType === "0" ? 'Income' : 'Expense'}</span>
                <span class="badge ${moneyTypeClass}">${item.moneyType === 0 ? 'Cash' : 'Online'}</span>
                <strong>Date:</strong> ${item.date}, <strong>Money:</strong> ${item.money}, <strong>Description:</strong> ${item.description}
            </li>`;
        });
        descriptionHTML += '</ul>';
    }

    descriptionSection.innerHTML = descriptionHTML;
}

function safeParseFloat(value) {
    if (typeof value === 'string') {
        return parseFloat(value.replace(/[?\s,]/g, '')) || 0;
    }
    return parseFloat(value) || 0;
}

function clearDashboard() {
    const chartIds = [
        'balance-overview',
        'income-expense-trends',
        'spending-by-category',
        'cash-flow',
        'transaction-by-place',
    ];
    chartIds.forEach(id => {
        Plotly.purge(id);
        document.getElementById(id).innerHTML = '<p class="placeholder">No data available.</p>';
    });
    document.getElementById('description-section').innerHTML = '<p class="placeholder">No descriptions available.</p>';
}
