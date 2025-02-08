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
        ['05-01-2025', 'Sunday', '11:00 PM', 'elluminati', '0', '5000.00', 'Elluminati stipend', '1', 'home', '400.00', '5900.38', '6300.38']
    ];
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    document.getElementById('download-sample').href = url;
});

/**
 * Processes a file containing CSV data and updates the dashboard with the data.
 * First, it reads the file using the FileReader API and converts the data to JSON.
 * Then, it checks if the data is in the correct format and if not, alerts the user.
 * If the data is valid, it updates the global data object and shows the dashboard.
 * Finally, it calls getTotalReport, populateFilters, and generateDashboard to update the charts.
 * @param {File} file - The file containing the CSV data to process.
 */
function processFile(file) {
    const reader = new FileReader();
    /**
     * Handles the onload event of the FileReader API to read the CSV data from the file.
     * Converts the CSV data to JSON using the convertCSVToJSON function and updates the
     * global data object with the JSON data. If the data is invalid, it alerts the user.
     * If the data is valid, it shows the dashboard and calls getTotalReport,
     * populateFilters, and generateDashboard to update the charts.
     * @param {Event} e - The event object containing the result of the file read.
     */
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
            document.getElementById('total-report').style.display = 'block';
            getTotalReport(jsonData);
            populateFilters(jsonData);
            generateDashboard(jsonData);
        } catch (error) {
            alert('Invalid CSV file. Please check the structure and try again.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

/**
 * Updates the total report section of the dashboard with the
 * remaining money in cash and online from the last transaction
 * in the given data.
 *
 * @param {Array<Object>} data - The array of transaction records
 * to get the last transaction from.
 */
function getTotalReport(data) {
    const lastTransaction = data[data.length - 1];
    document.getElementById('total-in-cash').textContent = `₹ ${lastTransaction['Remaining Money in Cash'].toFixed(2)}`;
    document.getElementById('total-in-online').textContent = `₹ ${lastTransaction['Remaining Money in Online'].toFixed(2)}`;
}

/**
 * Converts a CSV string into an array of objects, where each object's keys
 * are the headers from the CSV and the values are the corresponding values
 * from the CSV. It removes any empty lines and handles special cleaning
 * for currency columns by removing extraneous characters and parsing
 * them as floats. It also removes any columns with the header 'Tick mark'.
 *
 * @param {String} csv - The CSV string to convert.
 * @returns {Array<Object>} - An array of objects representing the CSV data.
 */

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

/**
 * This function takes a CSV string and returns a Promise that resolves to an
 * array of objects. Each object's keys are the headers from the CSV, and each
 * object's values are the corresponding values from the CSV, cleaned up (e.g.
 * currency values are converted to floats, and extraneous characters are removed).
 *
 * @param {String} csv - the CSV string to convert
 * @returns {Promise<Array<Object>>} - a Promise that resolves to an array of objects
 */
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

/**
 * This function takes a CSV string and returns a Promise that resolves to an
 * array of objects. Each object's keys are the headers from the CSV, and each
 * object's values are the corresponding values from the CSV, cleaned up (e.g.
 * currency values are converted to floats, and extraneous characters are removed).
 *
 * @param {String} csv - the CSV string to convert
 */
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

/**
 * This function takes a CSV string and returns a Promise that resolves to an
 * array of objects. Each object's keys are the headers from the CSV, and each
 * object's values are the corresponding values from the CSV, cleaned up (e.g.
 * currency values are converted to floats, and extraneous characters are removed).
 *
 * @param {String} csv - the CSV string to convert
 * @returns {Promise<Array<Object>>} - a Promise that resolves to an array of objects
 */
async function convertCSVToJSON5(csv) {
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
                    acc[header] = Number.isNaN(parseFloat(value)) ? 0 : parseFloat(value);
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

/**
 * Clean up a string containing a currency value by removing any non-numeric
 * characters and commas, and return the result as a float.
 * @param {string} value - The string to clean up.
 * @returns {number} The cleaned up value as a float, or 0 if the result is NaN.
 */
function cleanMoney(value) {
    return parseFloat(value.replace(/[^\d.-]/g, '').replace(',', '')) || 0;
};

// apply filters when "Apply Filters" button is clicked
document.getElementById('apply-filters').addEventListener('click', () => {
    const keywordFilter = document.getElementById('keyword-filter').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const minMoney = document.getElementById('min-money').value;
    const maxMoney = document.getElementById('max-money').value;
    const moneyTypeFilter = document.getElementById('money-type-filter').value;
    console.log(typeof moneyTypeFilter)
    console.log(moneyTypeFilter)
    const filteredData = filterData(keywordFilter, startDate, endDate, minMoney, maxMoney, moneyTypeFilter);
    generateDashboard(filteredData);
    document.getElementById('monthly-report').style.display = 'none';
});

// clear-filter button
document.getElementById('clear-filters').addEventListener('click', () => {
    clearFilters();
});

/**
 * Clears all the filters and resets the dashboard to its original state.
 * Used when clearing filters or loading a new CSV file.
 */
function clearFilters() {
    document.getElementById('keyword-filter').value = '';
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('min-money').value = '';
    document.getElementById('max-money').value = '';
    document.getElementById('money-type-filter').value = '';
    showDashboard();
    generateDashboard(globalData);
}

/**
 * Clears all charts and resets the dashboard to its original state.
 * Used when clearing filters or loading a new CSV file.
 */
function showDashboard() {
    const charts = document.querySelectorAll('.chart');
    charts.forEach(chart => chart.innerHTML = '');
    document.getElementById('description-section').innerHTML = '';
    document.getElementById('monthly-report').style.display = 'block';
}

/**
 * Updates the monthly report chart with the given transaction data.
 * Displays the 'monthly-report' div and uses Plotly to generate a grouped bar chart 
 * showing total income and total expense for each month.
 *
 * @param {Array} data - The array of transaction records used to calculate monthly totals.
 */

function updateMonthlyReport(data) {
    console.log(data)
    // Show the monthly report div
    document.getElementById('monthly-report').style.display = 'block';
    const monthlyReportChart = document.getElementById('monthly-report-chart');
    const monthlyReportData = getMonthlyReportData(data);
    console.log(monthlyReportData)
    const monthlyReportChartConfig = {
        data: [
            {
                x: monthlyReportData.map(item => item.month),
                y: monthlyReportData.map(item => item.totalIncome),
                type: 'bar',
                name: 'Total Income'
            },
            {
                x: monthlyReportData.map(item => item.month),
                y: monthlyReportData.map(item => item.totalExpense),
                type: 'bar',
                name: 'Total Expense'
            }
        ],
        layout: {
            title: 'Monthly Report',
            xaxis: { title: 'Month' },
            yaxis: { title: 'Amount' },
            barmode: 'group'
        }
    };
    Plotly.newPlot(monthlyReportChart, monthlyReportChartConfig);
}

/**
 * @function getMonthlyReportData
 * @description This function takes in a array of transactions and returns an array of objects,
 *              where each object contains the total income and total expense for each month.
 * @param {Array} data - The array of transactions.
 * @returns {Array} - An array of objects, where each object contains the total income and total expense for each month.
 */
function getMonthlyReportData(data) {
    const monthlyReportData = [];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    for (let i = 0; i < months.length; i++) {
        const monthData = data.filter(item => {
            const dateParts = item['Date'].split('-');
            const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            return date.getMonth() === i;
        });

        const totalIncome = monthData.reduce((acc, item) => {
            if (item['Get/Spend Type'] === "0") {
                return acc + safeParseFloat(item['Money']);
            } else {
                return acc;
            }
        }, 0);

        const totalExpense = monthData.reduce((acc, item) => {
            if (item['Get/Spend Type'] === "1") {
                return acc + safeParseFloat(item['Money']);
            } else {
                return acc;
            }
        }, 0);

        monthlyReportData.push({
            month: months[i],
            totalIncome: totalIncome,
            totalExpense: totalExpense
        });
    }
    return monthlyReportData;
}

/**
 * Updates the Balance Overview chart with the latest data.
 * The chart displays the distribution of remaining money in cash and online
 * as a pie chart. If the data is empty, the function returns immediately.
 *
 * @param {array} data - The data to update the chart with, which should include
 *     the latest 'Remaining Money in Cash' and 'Remaining Money in Online' values.
 */

function updateBalanceOverview(data) {
    if (data.length === 0) return;

    const balanceCash = safeParseFloat(data[data.length - 1]['Remaining Money in Cash']);
    const balanceOnline = safeParseFloat(data[data.length - 1]['Remaining Money in Online']);

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

/**
 * Updates the income vs expense trends bar chart with the given data.
 *
 * @param {array} data - The filtered data to generate the trends from.
 */
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
            hovertext: incomeData.map(item => `${item['Description']} (${item['Unique Keyword']})`)
        },
        {
            x: expenseData.map(item => item['Date']),
            y: expenseData.map(item => safeParseFloat(item['Money'])),
            type: 'bar',
            name: 'Expense',
            hoverinfo: 'x+y+text',
            hovertext: expenseData.map(item => `${item['Description']} (${item['Unique Keyword']})`)
        }
    ], {
        title: 'Income vs Expense Trends',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Amount' },
        barmode: 'group'
    });
}

/**
 * Updates the Spending by Category chart based on the given data.
 * If the 'others' filter is selected, it filters the original data for transactions < 500.
 * Otherwise, it processes the data as is.
 * It groups the data by Unique Keyword and calculates total money for each.
 * It then calculates total money for percentage calculation and processes categories
 * based on percentage threshold (grouping categories less than 5% into "others").
 * It sorts the categories by value in descending order and removes categories with zero value.
 * It then updates the chart with the processed data and percentages for hover text.
 * The chart title is determined based on the filter.
 * @param {array} data - The filtered data to generate the chart from.
 */
function updateSpendingByCategory(data) {
    const keywordFilter = document.getElementById('keyword-filter').value;

    // If others filter is selected, we need to process the original data
    let categoriesData;
    if (keywordFilter === 'others') {
        // Filter original data for transactions < 500
        categoriesData = globalData.filter(item => {
            const money = safeParseFloat(item['Money']);
            return money < 500;
        });
    } else {
        categoriesData = data;
    }

    // Group data by Unique Keyword and calculate total money for each
    const categoryTotals = categoriesData.reduce((acc, item) => {
        const keyword = item['Unique Keyword'];
        const money = safeParseFloat(item['Money']);
        acc[keyword] = (acc[keyword] || 0) + money;
        return acc;
    }, {});

    // Calculate total money for percentage calculation
    const totalMoney = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);

    // Process categories based on percentage threshold only if not in others filter
    let processedCategories;
    if (keywordFilter === 'others') {
        processedCategories = categoryTotals; // Use all categories as is for others filter
    } else {
        // Group categories less than 5% into "others"
        processedCategories = Object.entries(categoryTotals).reduce((acc, [keyword, money]) => {
            const percentage = (money / totalMoney) * 100;
            if (percentage < 5) {
                acc['others (< 5%)'] = (acc['others (< 5%)'] || 0) + money;
            } else {
                acc[keyword] = money;
            }
            return acc;
        }, {});
    }

    // Sort categories by value in descending order
    const sortedEntries = Object.entries(processedCategories)
        .sort(([, a], [, b]) => b - a)
        .filter(([, value]) => value > 0); // Remove categories with zero value

    // Separate labels and values
    const labels = sortedEntries.map(([keyword]) => keyword);
    const values = sortedEntries.map(([, value]) => value);

    // Calculate percentages for hover text
    const percentages = values.map(value => ((value / totalMoney) * 100).toFixed(1));
    const hovertext = labels.map((label, i) =>
        `${label}<br>₹${values[i].toFixed(2)}<br>${percentages[i]}%`
    );

    // Determine chart title based on filter
    const chartTitle = keywordFilter === 'others'
        ? 'Category Distribution for Transactions < ₹500'
        : 'Spending by Category (Categories < 5% grouped as Others)';

    Plotly.newPlot('spending-by-category', [{
        type: 'pie',
        values: values,
        labels: labels,
        textinfo: 'label+percent',
        hoverinfo: 'text',
        hovertext: hovertext,
        textposition: 'outside'
    }], {
        title: chartTitle,
        showlegend: true,
        legend: {
            orientation: 'h',
            y: -0.2
        }
    });
}

/**
 * Updates the Cash Flow Over Time chart with the provided data.
 * The chart displays the total balance over time.
 * @param {array} data - The data to update the chart with.
 */
function updateCashFlow(data) {
    if (data.length === 0) return;

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

/**
 * Updates the Transaction Volume by Place chart with the provided data.
 * The chart displays the count of transactions at each place.
 * @param {array} data - The data to update the chart with.
 */
function updateTransactionByPlace(data) {
    // Group transactions by place
    const placeCounts = data.reduce((acc, item) => {
        const place = item['Place'];
        acc[place] = (acc[place] || 0) + 1;
        return acc;
    }, {});

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

/**
 * Safely parses a value as a float, replacing any commas, whitespace, or question marks 
 * with nothing, and returning 0 if the result is NaN.
 * @param {string|number} value - The value to parse.
 * @returns {number} The parsed float value, or 0 if the result is NaN.
 */
function safeParseFloat(value) {
    if (typeof value === 'string') {
        return parseFloat(value.replace(/[?\s,]/g, '')) || 0;
    }
    return parseFloat(value) || 0;
}

/**
 * Clears all the charts in the dashboard and replaces them with a placeholder.
 * This function is used to clear the dashboard when the filters are cleared.
 */
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
    document.getElementById('monthly-report').style.display = 'none';
}

/**
 * Populate the filters in the dashboard with the available options based on the data provided.
 * This includes populating the Unique Keyword filter with all the unique keywords in the data,
 * and populating the Money Type filter with the available money types (0 for Cash, 1 for Online).
 * @param {array} data - The array of transaction data to populate the filters from.
 */
function populateFilters(data) {
    const processedData = processOthersCategory(data);
    const keywordSet = new Set(processedData.map(item => item['Unique Keyword']));
    const keywordFilter = document.getElementById('keyword-filter');
    keywordFilter.innerHTML = '<option value="">All</option>';
    keywordSet.forEach(keyword => {
        keywordFilter.innerHTML += `<option value="${keyword}">${keyword}</option>`;
    });

    const moneyTypeSet = new Set(processedData.map(item => item['Money Type']));
    const moneyTypeFilter = document.getElementById('money-type-filter');
    moneyTypeFilter.innerHTML = '<option value="">All</option>';
    moneyTypeSet.forEach(moneyType => {
        const optionValue = moneyType === 0 ? 'Cash' : 'Online';
        moneyTypeFilter.innerHTML += `<option value="${moneyType}">${optionValue}</option>`;
    });
}

/**
 * Processes the data to group all transactions with money < 500 into
 * the "others" category.
 *
 * @param {array} data - The filtered data to process.
 * @returns {array} A new array with the processed data.
 */
function processOthersCategory(data) {
    // Create a deep copy of the data to avoid modifying the original
    return data.map(item => {
        const money = parseFloat(item['Money'].toString().replace(/[^\d.-]/g, '')) || 0;
        if (money < 500) {
            return {
                ...item,
                'Unique Keyword': 'others'
            };
        }
        return { ...item };  // Return a copy of the item
    });
}

/**
 * Filters the provided data based on the specified filters.
 * If the keyword filter is set to 'others', it will be processed differently.
 * @param {string} keywordFilter - The keyword to filter by, or 'others' to filter by transactions < 500.
 * @param {string} startDate - The start date to filter by in the format 'dd-mm-yyyy'.
 * @param {string} endDate - The end date to filter by in the format 'dd-mm-yyyy'.
 * @param {number} minMoney - The minimum money to filter by.
 * @param {number} maxMoney - The maximum money to filter by.
 * @param {number} moneyTypeFilter - The money type to filter by (0 for Cash, 1 for Online).
 * @returns {array} The filtered data.
 */
function filterData(keywordFilter, startDate, endDate, minMoney, maxMoney, moneyTypeFilter) {
    let dataToFilter = [...globalData];  // Create a copy of global data

    // Only process for others category if that filter is selected
    if (keywordFilter === 'others') {
        dataToFilter = processOthersCategory(dataToFilter);
    }

    const filteredData = dataToFilter.filter(item => {
        const date = new Date(item['Date']);
        const money = safeParseFloat(item['Money']);

        // Special handling for 'others' category
        const matchesKeyword = !keywordFilter ? true :
            keywordFilter === 'others' ?
                (money < 500) :
                (item['Unique Keyword'] === keywordFilter);

        return (
            matchesKeyword &&
            (!startDate || date >= new Date(startDate)) &&
            (!endDate || date <= new Date(endDate)) &&
            (!minMoney || money >= minMoney) &&
            (!maxMoney || money <= maxMoney) &&
            (!moneyTypeFilter || parseInt(item['Money Type'], 10) === parseInt(moneyTypeFilter, 10))
        );
    });

    return filteredData;
}

/**
 * Generates the dashboard based on the provided data.
 * If no data is available for the selected filters, alerts the user and clears the dashboard.
 * Processes the data for the "others" category if that filter is selected.
 * Updates all charts except monthly report with the processed data.
 * Always uses the original data for the monthly report.
 * @param {array} data - The filtered data to generate the dashboard from.
 */
function generateDashboard(data) {
    if (!data.length) {
        alert('No data available for the selected filters.');
        clearDashboard();
        return;
    }

    const keywordFilter = document.getElementById('keyword-filter').value;
    let displayData = [...data];  // Create a copy of the filtered data

    // Process for others category if that filter is selected
    if (keywordFilter === 'others') {
        displayData = processOthersCategory(displayData);
    }

    // Update all charts except monthly report with the processed data
    updateBalanceOverview(displayData);
    updateIncomeExpenseTrends(displayData);
    updateSpendingByCategory(displayData);
    updateCashFlow(displayData);
    updateTransactionByPlace(displayData);
    updateDescriptionSection(displayData);

    // Always use original data for monthly report
    updateMonthlyReport(globalData);
}

/**
 * Updates the description section of the dashboard with all the
 * descriptions by category, with totals for each category.
 *
 * @param {array} data - The filtered data to generate the descriptions
 *     from.
 */
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

    let descriptionHTML = '<h3>Descriptions by Category</h3>';
    for (const [keyword, items] of Object.entries(descriptions)) {
        const total = items.reduce((sum, item) => sum + item.money, 0);
        descriptionHTML += `
            <h4>${keyword} ${keyword === 'others' ? '(Transactions < ₹500)' : ''} 
            - Total: ₹${total.toFixed(2)}</h4>
            <ul>`;
        items.forEach(item => {
            const getTypeClass = item.getType === "0" ? 'income' : 'expense';
            const moneyTypeClass = item.moneyType === 0 ? 'cash' : 'online';
            descriptionHTML += `<li>
                <span class="badge ${getTypeClass}">${item.getType === "0" ? 'Income' : 'Expense'}</span>
                <span class="badge ${moneyTypeClass}">${item.moneyType === 0 ? 'Cash' : 'Online'}</span>
                <strong>Date:</strong> ${item.date}, 
                <strong>Money:</strong> ₹${item.money.toFixed(2)}, 
                <strong>Description:</strong> ${item.description}
            </li>`;
        });
        descriptionHTML += '</ul>';
    }

    descriptionSection.innerHTML = descriptionHTML;
}