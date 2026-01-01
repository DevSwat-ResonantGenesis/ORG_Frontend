import fastapiClient from './fastapiClient';

export interface MRRData {
  mrr: number; // in cents
  arr: number; // in cents
}

export interface UsageData {
  total_predictions: number;
  api_calls_this_month: number;
  storage_gb?: number;
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  period_start: string;
  period_end: string;
  invoice_number?: string;
  pdf_url?: string;
}

export const fetchMRR = async (): Promise<MRRData> => {
  const res = await fastapiClient.get('/finance/reports/mrr');
  return res.data;
};

export const fetchUsage = async (): Promise<UsageData> => {
  const res = await fastapiClient.get('/finance/reports/usage');
  return res.data;
};

export const fetchInvoices = async (): Promise<Invoice[]> => {
  const res = await fastapiClient.get('/finance/invoices');
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const downloadInvoice = async (invoiceId: string): Promise<Blob> => {
  const res = await fastapiClient.get(`/finance/invoices/${invoiceId}/download`, {
    responseType: 'blob'
  });
  return res.data;
};

export interface Credit {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
  applied_to_invoice?: string;
}

export interface Refund {
  id: string;
  amount: number;
  invoice_id: string;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  created_at: string;
}

export const fetchCredits = async (): Promise<Credit[]> => {
  const res = await fastapiClient.get('/finance/credits');
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const fetchRefunds = async (): Promise<Refund[]> => {
  const res = await fastapiClient.get('/finance/refunds');
  return Array.isArray(res.data) ? res.data : (res.data?.items || []);
};

export const createCredit = async (amount: number, reason: string): Promise<Credit> => {
  const res = await fastapiClient.post('/finance/credits', { amount, reason });
  return res.data;
};

export const createRefund = async (invoiceId: string, amount: number, reason: string): Promise<Refund> => {
  const res = await fastapiClient.post('/finance/refunds', { invoice_id: invoiceId, amount, reason });
  return res.data;
};

