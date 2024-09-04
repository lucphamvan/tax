export interface GetInvoicesParams {
  sort: string;
  size: number;
  search: string;
  state?: string;
}

export interface GetDetailParams {
  nbmst: string;
  khhdon: string;
  khmshdon: number;
  shdon: number;
}

export interface GetListInvoiceResponse {
  datas: InvoiceData[];
  state: string;
  time: number;
  total: number;
}

export interface InvoiceData {
  nbmst: string;
  khhdon: string;
  khmshdon: number;
  shdon: number;
}

export interface HdHhdv {
  stt: number;
  tchat: number;
  ten: string;
  dvtinh: string;
  sluong: number;
  dgia: number;
  stckhau: string;
  ltsuat: string;
  thtien: number;
}

export interface InvoiceDetail {
  nbmst: string;
  khmshdon: number;
  khhdon: string;
  shdon: number;
  ncma: string;
  ncnhat: string;
  nky: string;
  tgtthue: number;
  tgtcthue: number;
  tgtttbso: number;
  hdhhdvu: HdHhdv[];
}
