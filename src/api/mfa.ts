import fastapiClient from './fastapiClient';

export interface MFASetupResponse {
  secret: string;
  qr_code: string; // Base64 encoded QR code image
  backup_codes: string[];
}

export interface MFAStatus {
  mfa_enabled: boolean;
  mfa_setup: boolean;
}

export const setupMFA = async (): Promise<MFASetupResponse> => {
  const res = await fastapiClient.post('/auth/mfa/setup');
  return res.data;
};

export const verifyMFA = async (token: string): Promise<{ success: boolean; message: string }> => {
  const res = await fastapiClient.post('/auth/mfa/verify', { token });
  return res.data;
};

export const disableMFA = async (token: string): Promise<{ success: boolean; message: string }> => {
  const res = await fastapiClient.post('/auth/mfa/disable', { token });
  return res.data;
};

export const getMFAStatus = async (): Promise<MFAStatus> => {
  const res = await fastapiClient.get('/auth/mfa/status');
  return res.data;
};

