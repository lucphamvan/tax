import axios from 'axios'
import Cookies from 'js-cookie'
import { GetInvoicesParams, GetListInvoiceResponse, InvoiceDetail, InvoiceData, GetDetailParams, HdHhdv, InvoiceType, GetInvoicesInput, InvoiceKind } from '@/types/invoice'

const BASE_URL = 'https://hoadondientu.gdt.gov.vn:30000'
const ROW_PER_PAGE = 50

const getURL = (type: InvoiceType, kind: InvoiceKind) => {
    let url = BASE_URL
    if (kind === InvoiceKind.sco) {
        url += '/sco-query/invoices'
    } else {
        url += '/query/invoices'
    }
    url += `/${type}`
    return url
}

const getDetailURL = (kind: InvoiceKind) => {
    let url = BASE_URL
    if (kind === InvoiceKind.sco) {
        url += '/sco-query/invoices/detail'
    } else {
        url += '/query/invoices/detail'
    }
    return url
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getInvoicesParams = async (input: GetInvoicesInput) => {
    const { startDate, endDate, type, state, ttxly } = input

    let search = `tdlap=ge=${startDate};tdlap=le=${endDate}`
    if (type === 'purchase') {
        search += `;ttxly==${ttxly}`
    }

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
        case 2:
            return `Khuyến mãi`
        case 3:
            return `Chiết khấu thương mại`
        case 4:
            return `Ghi chú, diễn giải`
        default:
            return typeCode?.toString()
    }
}

const fetchInvoices = async (input: GetInvoicesInput) => {
    const url = getURL(input.type, input.kind)
    const token = Cookies.get('token') || ''
    const params = await getInvoicesParams(input)
    const { data } = await axios.get<GetListInvoiceResponse>(url, {
        params,
        headers: {
            Authorization: 'Bearer ' + token,
        },
    })
    return data
}

const retrieveAllInvoices = async (invoices: InvoiceData[], total: number, input: GetInvoicesInput): Promise<InvoiceData[]> => {
    if (invoices.length === 0 || invoices.length >= total) {
        return invoices
    }
    const { datas, state } = await fetchInvoices(input)
    invoices.push(...datas)
    input.state = state

    // prevent request limit
    await delay(1000)

    return retrieveAllInvoices(invoices, total, input)
}

const getAllInvoices = async (input: GetInvoicesInput): Promise<InvoiceData[]> => {
    const invoices: InvoiceData[] = []
    const { datas, total, state } = await fetchInvoices(input)
    invoices.push(...datas)
    input.state = state
    input.updateTotalInvoice?.(total)
    return retrieveAllInvoices(invoices, total, input)
}

const getDetailInvoice = async (invoiceData: InvoiceData, invoiceKind: InvoiceKind) => {
    const token = Cookies.get('token') || ''
    const params: GetDetailParams = {
        nbmst: invoiceData.nbmst,
        khhdon: invoiceData.khhdon,
        khmshdon: invoiceData.khmshdon,
        shdon: invoiceData.shdon,
    }
    const url = getDetailURL(invoiceKind)
    const response = await axios.get(url, {
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
    const ncma = new Date(data.ncnhat).toLocaleDateString('en-GB')
    const detailData: Partial<InvoiceDetail> = {
        shdon: data.shdon,
        ncma: ncma,
        tgtthue: data.tgtthue,
        hdhhdvu: hdhhdvu,
        nbmst: data.nbmst,
        nmmst: data.nmmst,
        ncnhat: data.ncnhat,
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

export const generateXLSXData = async (input: GetInvoicesInput) => {
    const { type, updatePercent } = input
    const invoices = await getAllInvoices(input)
    const total = invoices.length
    let processItem = 0
    try {
        let xlsxData = []
        for (const invoice of invoices) {
            const data = await getDetailInvoice(invoice, input.kind)
            const rows = generateXLSX1Invoice(type, data)
            xlsxData.push(...rows)
            processItem++
            const percent = (processItem / total) * 100
            updatePercent?.(percent.toFixed(2))
            await delay(500)
        }
        return xlsxData
    } catch (error: any) {
        console.log(error.message)
    }
}
