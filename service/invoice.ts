import axios from 'axios'
import { getFromDate, getToDate } from '@/utils'

import { GetInvoicesParams, GetListInvoiceResponse, InvoiceDetail, InvoiceData, GetDetailParams, HdHhdv } from '@/types/invoice'

const GET_LIST_INVOICE_URL = 'https://hoadondientu.gdt.gov.vn:30000/query/invoices/sold'
const GET_DETAIL_INVOICE_URL = 'https://hoadondientu.gdt.gov.vn:30000/query/invoices/detail'
const ROW_PER_PAGE = 50

const getInvoicesParams = async (from: string, to: string, state?: string) => {
    const fromDate = getFromDate(from)
    const toDate = getToDate(to)
    const search = `tdlap=ge=${fromDate};tdlap=le=${toDate}`
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
            return `"Hàng hóa, dịch vụ"`
        case 3:
            return `"Chiết khấu thương mại"`
        default:
            return tchat.toString()
    }
}

const buildCSVContent = (data: Partial<InvoiceDetail>) => {
    const rows = [
        `Số hóa đơn:,${data.shdon?.toString() || ''},,,,,,\n`,
        `Ngày cấp:,${data.ncma || ''},,,,,,\n`,
        `Tổng tiền thuế:,${data.tgtthue?.toString() || ''},,,,,,\n`,
        `"STT","Tính chất","Tên hàng hóa, dịch vụ","Đơn vị tính","Số lượng","Đơn giá","Chiết khấu","Thuế suất","Thành tiền chưa có thuế GTGT"\n`,
    ]

    const detailRows = data.hdhhdvu
        ?.map((item) =>
            [item.stt.toString(), getTchat(item.tchat), `"${item.ten}"`, item.dvtinh || '', item.sluong?.toString() || '', item.dgia?.toString() || '', item.stckhau || '', item.ltsuat || '', item.thtien?.toString() || ''].join(',')
        )
        .join('\n')

    return rows.join('') + (detailRows || '') + '\n\n\n\n'
}

const buildDetailInvoiceData = async (invoiceData: InvoiceData, token: string) => {
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
    }
    const content = buildCSVContent(detailData)
    return content
}

const fetchInvoices = async (token: string, from: string, to: string, state?: string) => {
    const params = await getInvoicesParams(from, to, state)
    const { data } = await axios.get<GetListInvoiceResponse>(GET_LIST_INVOICE_URL, {
        params,
        headers: {
            Authorization: 'Bearer ' + token,
        },
    })
    return data
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const retrieveAllInvoices = async (invoices: InvoiceData[], token: string, from: string, to: string, total: number, state?: string): Promise<InvoiceData[]> => {
    if (invoices.length === 0 || invoices.length >= total) {
        return invoices
    }

    const { datas, state: newState } = await fetchInvoices(token, from, to, state)
    invoices.push(...datas)

    await delay(1000)
    return retrieveAllInvoices(invoices, token, from, to, total, newState)
}

const getAllInvoices = async (from: string, to: string, token: string): Promise<InvoiceData[]> => {
    const invoices: InvoiceData[] = []
    const { datas, total, state } = await fetchInvoices(token, from, to)
    invoices.push(...datas)
    return retrieveAllInvoices(invoices, token, from, to, total, state)
}

export const getInvoiceData = async (token: string, from: string, to: string, fn: (p: string) => void) => {
    const invoices = await getAllInvoices(from, to, token)
    const total = invoices.length
    let processItem = 0
    try {
        let content = ''
        for (const invoice of invoices) {
            content += await buildDetailInvoiceData(invoice, token)
            processItem++
            const percent = (processItem / total) * 100
            fn(percent.toFixed(2))
            await delay(500)
        }
        return content
    } catch (error: any) {
        console.log(error.message)
    }
}
