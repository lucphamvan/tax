import { DateValue } from 'react-aria'

// get date from DD-MM-YYYY
export const getFromDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-')
    return `${day}/${month}/${year}T00:00:00`
}

export const getToDate = (dateString: string) => {
    const [day, month, year] = dateString.split('-')
    return `${day}/${month}/${year}T23:59:59`
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

export function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth() returns month index starting from 0
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
}

export function getDate(date?: DateValue) {
    if (!date) return undefined
    return new Date(date.year, date.month - 1, date.day)
}
