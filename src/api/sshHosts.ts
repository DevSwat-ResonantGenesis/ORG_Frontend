import fastapiClient from './fastapiClient';

export interface UserSshHostEntry {
  host: string;
  port: number;
  label?: string;
  publicKeyFingerprint: string | null;
  createdAt: string | null;
}

const mapHostEntry = (h: any): UserSshHostEntry => ({
  host: h.host,
  port: h.port,
  label: h.label,
  publicKeyFingerprint: h.public_key_fingerprint ?? null,
  createdAt: h.created_at ?? null,
});

export const fetchUserSshHost = async (): Promise<UserSshHostEntry | null> => {
  const { data } = await fastapiClient.get('/auth/user/ssh-hosts');
  return data.registered && data.host_entry ? mapHostEntry(data.host_entry) : null;
};

export const registerUserSshHost = async (
  host: string,
  port: number,
  label?: string
): Promise<UserSshHostEntry> => {
  const { data } = await fastapiClient.post('/auth/user/ssh-hosts', { host, port, label });
  return mapHostEntry(data);
};

export const deleteUserSshHost = async (): Promise<void> => {
  await fastapiClient.delete('/auth/user/ssh-hosts');
};

// Generates (or fetches, if already generated) the sandboxed terminal's
// SSH keypair for the current user and returns the public half only - the
// private key never leaves RG_Terminal_Sandbox's per-user identity volume.
export const fetchTerminalSshPublicKey = async (): Promise<string> => {
  const { data } = await fastapiClient.post('/api/v1/terminal/ssh-key');
  return data.public_key;
};
