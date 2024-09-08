const XLSX = require('xlsx')

function parseCSV(csv) {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i]

        if (char === '"') {
            // Toggle the inQuotes flag
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            // Push the current value to result and reset it
            result.push(current.trim())
            current = ''
        } else {
            // Append the current character to the current value
            current += char
        }
    }

    // Add the last value
    if (current.length > 0) {
        result.push(current.trim())
    }

    return result
}

const data = [
    {
        name: null,
        age: null,
        city: undefined,
        what: 'Ten hang hoa, dich vu',
        class: 'cls',
    },
    {
        name: 'John',
        age: 25,
        city: 'New York',
    },
    {},
    {},
    {
        name: 'Jane',
        age: 24,
        city: 'San Francisco',
    },
]
const buildAndDownloadFile = (csv) => {
    // const ws = XLSX.utils.aoa_to_sheet(csv.split('\n').map((row) => parseCSV(row)))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const filename = 'output1.xlsx'
    XLSX.writeFile(wb, filename)
}

// const a = ['hello', '1', 'word'].join(',')
buildAndDownloadFile()
