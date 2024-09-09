import axios from 'axios'
import Cookies from 'js-cookie'
import { GetInvoicesParams, GetListInvoiceResponse, InvoiceDetail, InvoiceData, GetDetailParams, HdHhdv } from '@/types/invoice'

const GET_SOLD_INVOICES_URL = 'https://hoadondientu.gdt.gov.vn:30000/query/invoices/sold'
const GET_PURCHASE_INVOICES_URL = 'https://hoadondientu.gdt.gov.vn:30000/query/invoices/purchase'
const GET_DETAIL_INVOICE_URL = 'https://hoadondientu.gdt.gov.vn:30000/query/invoices/detail'
const ROW_PER_PAGE = 50

export type InvoiceType = 'purchase' | 'sold'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getInvoicesParams = async (startDate: string, endDate: string, state?: string) => {
    const search = `tdlap=ge=${startDate};tdlap=le=${endDate}`
    const params: GetInvoicesParams = {
        sort: 'tdlap:desc,khmshdon:asc,shdon:desc',
        size: ROW_PER_PAGE,
        search,
    }
    if (state) {
        params.state = state
    }
    return params
}

const getType = (typeCode: number) => {
    switch (typeCode) {
        case 1:
            return `Hàng hóa, dịch vụ`
        case 3:
            return `Chiết khấu thương mại`
        default:
            return typeCode.toString()
    }
}

const fetchInvoices = async (type: InvoiceType, startDate: string, endDate: string, state?: string) => {
    const url = type === 'purchase' ? GET_PURCHASE_INVOICES_URL : GET_SOLD_INVOICES_URL
    const token = Cookies.get('token') || ''
    const params = await getInvoicesParams(startDate, endDate, state)
    const { data } = await axios.get<GetListInvoiceResponse>(url, {
        params,
        headers: {
            Authorization: 'Bearer ' + token,
        },
    })
    return data
}

const retrieveAllInvoices = async (type: InvoiceType, invoices: InvoiceData[], startDate: string, endDate: string, total: number, state?: string): Promise<InvoiceData[]> => {
    if (invoices.length === 0 || invoices.length >= total) {
        return invoices
    }

    const { datas, state: newState } = await fetchInvoices(type, startDate, endDate, state)
    invoices.push(...datas)

    await delay(1000) // delay 1s to avoid request limit

    return retrieveAllInvoices(type, invoices, startDate, endDate, total, newState)
}

const getAllInvoices = async (type: InvoiceType, startDate: string, endDate: string): Promise<InvoiceData[]> => {
    const invoices: InvoiceData[] = []
    const { datas, total, state } = await fetchInvoices(type, startDate, endDate)
    invoices.push(...datas)
    return retrieveAllInvoices(type, invoices, startDate, endDate, total, state)
}

const getDetailInvoice = async (invoiceData: InvoiceData) => {
    const token = Cookies.get('token') || ''
    const params: GetDetailParams = {
        nbmst: invoiceData.nbmst,
        khhdon: invoiceData.khhdon,
        khmshdon: invoiceData.khmshdon,
        shdon: invoiceData.shdon,
    }
    const response = await axios.get(GET_DETAIL_INVOICE_URL, {
        params,
        headers: {
            Authorization: 'Bearer ' + token,
        },
    })
    const data = response.data as InvoiceDetail
    const hdhhdvu = data?.hdhhdvu.map((item) => {
        const hhdv: HdHhdv = {
            stt: item.stt,
            tchat: item.tchat,
            ten: item.ten,
            dvtinh: item.dvtinh,
            sluong: item.sluong,
            dgia: item.dgia,
            stckhau: item.stckhau,
            ltsuat: item.ltsuat,
            thtien: item.thtien,
        }
        return hhdv
    })
    const ncma = new Date(data.ncma).toLocaleDateString('en-GB')
    const detailData: Partial<InvoiceDetail> = {
        shdon: data.shdon,
        ncma: ncma,
        tgtthue: data.tgtthue,
        hdhhdvu: hdhhdvu,
        nbmst: data.nbmst,
        nmmst: data.nmmst,
    }
    return detailData
}

const generateXLSX1Invoice = (type: InvoiceType, data: Partial<InvoiceDetail>) => {
    const mst = type === 'purchase' ? data.nbmst : data.nmmst
    const mstHeader = type === 'purchase' ? 'Mã số thuế người bán' : 'Mã số thuế người mua'
    const rows = [
        [, , , , , , , , , mstHeader, 'Số hóa đơn', 'Ngày cấp', 'Tổng tiền thuế'],
        [, , , , , , , , , mst, data.shdon, data.ncma, data.tgtthue],
        ['STT', 'Tính chất', 'Tên hàng hóa, dịch vụ', 'Đơn vị tính', 'Số lượng', 'Đơn giá', 'Chiết khấu', 'Thuế suất', 'Thành tiền chưa có thuế GTGT'],
    ]
    data.hdhhdvu?.forEach((item) => {
        const row = [item.stt, getType(item.tchat), item.ten, item.dvtinh, item.sluong, item.dgia, item.stckhau, item.ltsuat, item.thtien]
        rows.push(row)
    })
    rows.push([])
    rows.push([])
    rows.push([])

    return rows
}

export const generateXLSXData = async (type: InvoiceType, startDate: string, endDate: string, fn: (p: string) => void) => {
    console.log('Generating XLSX data...', type)
    const invoices = await getAllInvoices(type, startDate, endDate)
    const total = invoices.length
    let processItem = 0
    try {
        let xlsxData = []
        for (const invoice of invoices) {
            const data = await getDetailInvoice(invoice)
            const rows = generateXLSX1Invoice(type, data)
            xlsxData.push(...rows)
            processItem++
            const percent = (processItem / total) * 100
            fn(percent.toFixed(2))
            await delay(500)
        }
        return xlsxData
    } catch (error: any) {
        console.log(error.message)
    }
}
