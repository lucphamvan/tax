import dayjs from 'dayjs'

const XLSX = require('xlsx')

// get date from DD-MM-YYYY
export const getStartDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-')
    return `${day}/${month}/${year}T00:00:00`
}

export const getEndDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-')
    return `${day}/${month}/${year}T23:59:59`
}

function convertDateString(dateString: string) {
    // Split the date and time components
    const [datePart, timePart] = dateString.split('T')

    // Reformat the date part from dd/MM/yyyy to yyyy-MM-dd
    const [day, month, year] = datePart.split('/')
    const reformattedDateString = `${year}-${month}-${day}T${timePart}`

    // Create and return a new Date object
    return new Date(reformattedDateString)
}

export const buildAndDownloadFile = (csv: string, startDate: string, endDate: string) => {
    const ws = XLSX.utils.aoa_to_sheet(csv.split('\n').map((row) => parseCSV(row)))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const start = dayjs(convertDateString(startDate)).format('DD_MM_YYYY')
    const end = dayjs(convertDateString(endDate)).format('DD_MM_YYYY')
    const filename = `dulieu_${start}__${end}.xlsx`
    XLSX.writeFile(wb, filename)
}

export function downloadTextFile(textContent: string, from: string, to: string) {
    // Create a blob with the file content
    const blob = new Blob([textContent], { type: 'text/plain' })

    // Create a link element
    const link = document.createElement('a')

    // Create a URL for the blob and set it as the href attribute
    link.href = URL.createObjectURL(blob)

    // Set the download attribute with the filename
    link.download = `dulieu_${from}_${to}.csv`

    // Append the link to the body (it won't be visible)
    document.body.appendChild(link)

    // Programmatically click the link to trigger the download
    link.click()

    // Remove the link from the document
    document.body.removeChild(link)
}

function parseCSV(csv: string) {
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
