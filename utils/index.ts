import { InvoiceType } from '@/service/invoice'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

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

export const exportXLSXFile = (type: InvoiceType, data: any, startDate: string, endDate: string) => {
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const start = dayjs(convertDateString(startDate)).format('DD_MM_YYYY')
    const end = dayjs(convertDateString(endDate)).format('DD_MM_YYYY')
    const name = type === 'purchase' ? 'muavao' : 'banra'
    const filename = `${name}__${start}__${end}.xlsx`
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
