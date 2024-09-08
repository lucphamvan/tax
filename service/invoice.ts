import axios from 'axios'
import Cookies from 'js-cookie'
import { GetInvoicesParams, GetListInvoiceResponse, InvoiceDetail, InvoiceData, GetDetailParams, HdHhdv } from '@/types/invoice'

const GET_LIST_INVOICE_URL = 'https://hoadondientu.gdt.gov.vn:30000/query/invoices/sold'
const GET_DETAIL_INVOICE_URL = 'https://hoadondientu.gdt.gov.vn:30000/query/invoices/detail'
const ROW_PER_PAGE = 50

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

const getTchat = (tchat: number) => {
    switch (tchat) {
        case 1:
            return `Hàng hóa, dịch vụ`
        case 3:
            return `Chiết khấu thương mại`
        default:
            return tchat.toString()
    }
}

const fetchInvoices = async (startDate: string, endDate: string, state?: string) => {
    const token = Cookies.get('token') || ''
    const params = await getInvoicesParams(startDate, endDate, state)
    const { data } = await axios.get<GetListInvoiceResponse>(GET_LIST_INVOICE_URL, {
        params,
        headers: {
            Authorization: 'Bearer ' + token,
        },
    })
    return data
}

const retrieveAllInvoices = async (invoices: InvoiceData[], startDate: string, endDate: string, total: number, state?: string): Promise<InvoiceData[]> => {
    if (invoices.length === 0 || invoices.length >= total) {
        return invoices
    }

    const { datas, state: newState } = await fetchInvoices(startDate, endDate, state)
    invoices.push(...datas)

    await delay(1000) // delay 1s to avoid request limit

    return retrieveAllInvoices(invoices, startDate, endDate, total, newState)
}

const getAllInvoices = async (startDate: string, endDate: string): Promise<InvoiceData[]> => {
    const invoices: InvoiceData[] = []
    const { datas, total, state } = await fetchInvoices(startDate, endDate)
    invoices.push(...datas)
    return retrieveAllInvoices(invoices, startDate, endDate, total, state)
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
    }
    return detailData
}

const generateXLSX1Invoice = (data: Partial<InvoiceDetail>) => {
    const rows = [
        [, , , , , , , , , 'Mã số thuế', 'Số hóa đơn', 'Ngày cấp', 'Tổng tiền thuế'],
        [, , , , , , , , , data.nbmst, data.shdon, data.ncma, data.tgtthue],
        ['STT', 'Tính chất', 'Tên hàng hóa, dịch vụ', 'Đơn vị tính', 'Số lượng', 'Đơn giá', 'Chiết khấu', 'Thuế suất', 'Thành tiền chưa có thuế GTGT'],
    ]
    data.hdhhdvu?.forEach((item) => {
        const row = [item.stt, getTchat(item.tchat), item.ten, item.dvtinh, item.sluong, item.dgia, item.stckhau, item.ltsuat, item.thtien]
        rows.push(row)
    })
    rows.push([])
    rows.push([])
    rows.push([])

    return rows
}

export const generateXLSXData = async (startDate: string, endDate: string, fn: (p: string) => void) => {
    const invoices = await getAllInvoices(startDate, endDate)
    const total = invoices.length
    let processItem = 0
    try {
        let xlsxData = []
        for (const invoice of invoices) {
            const data = await getDetailInvoice(invoice)
            const rows = generateXLSX1Invoice(data)
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
