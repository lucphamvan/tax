const XLSX = require('xlsx')

// get date from DD-MM-YYYY
export const getFromDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-')
    return `${day}/${month}/${year}T00:00:00`
}

export const getToDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-')
    return `${day}/${month}/${year}T23:59:59`
}

export function parseCSV(csv: string) {
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

export const buildAndDownloadFile = (csv: string, from: string, to: string) => {
    const ws = XLSX.utils.aoa_to_sheet(csv.split('\n').map((row) => parseCSV(row)))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const filename = `dulieu_${from}_${to}.xlsx`
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

export function formatDate(date?: Date) {
    if (!date) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth() returns month index starting from 0
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
}
