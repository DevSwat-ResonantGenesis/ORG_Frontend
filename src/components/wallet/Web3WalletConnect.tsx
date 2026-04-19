/**
 * Web3 Wallet Connection Component
 * Uses raw window.ethereum RPC — zero external dependencies.
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import fastapiClient from "../../api/fastapiClient";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

const CHAINS: Record<number, { name: string; symbol: string; explorer: string }> = {
  1:        { name: "Ethereum",  symbol: "ETH",        explorer: "https://etherscan.io" },
  137:      { name: "Polygon",   symbol: "MATIC",      explorer: "https://polygonscan.com" },
  8453:     { name: "Base",      symbol: "ETH",        explorer: "https://basescan.org" },
  42161:    { name: "Arbitrum",  symbol: "ETH",        explorer: "https://arbiscan.io" },
  10:       { name: "Optimism",  symbol: "ETH",        explorer: "https://optimistic.etherscan.io" },
  11155111: { name: "Sepolia",   symbol: "SepoliaETH", explorer: "https://sepolia.etherscan.io" },
};

function weiHexToEth(hex: string): string {
  try {
    const wei = BigInt(hex);
    const whole = wei / BigInt(1e18);
    const frac = wei % BigInt(1e18);
    const fracStr = frac.toString().padStart(18, "0").slice(0, 4);
    return whole + "." + fracStr;
  } catch { return "0.0000"; }
}

interface Props {
  onWalletLinked?: (address: string, chainId: number) => void;
  compact?: boolean;
}

const S: Record<string, React.CSSProperties> = {
  container: { background: "#111827", border: "1px solid #1f2937", borderRadius: 12, padding: 20, marginBottom: 16 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { color: "#e5e7eb", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 },
  connectBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  disconnectBtn: { padding: "6px 12px", background: "transparent", border: "1px solid #374151", borderRadius: 6, color: "#9ca3af", fontSize: 12, cursor: "pointer" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 },
  infoCard: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 16px" },
  label: { color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 4 },
  value: { color: "#e5e7eb", fontSize: 14, fontWeight: 500, fontFamily: "monospace", wordBreak: "break-all" as const },
  linkBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  networkSelect: { padding: "6px 10px", background: "#0f172a", border: "1px solid #374151", borderRadius: 6, color: "#e5e7eb", fontSize: 12, cursor: "pointer" },
  center: { textAlign: "center" as const, padding: "24px 16px" },
};

function badge(color: string): React.CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: color + "20", color, border: "1px solid " + color + "40" };
}

function alertStyle(type: "success" | "error" | "info"): React.CSSProperties {
  const bg = type === "success" ? "#052e16" : type === "error" ? "#450a0a" : "#0c1a3d";
  const fg = type === "success" ? "#86efac" : type === "error" ? "#fca5a5" : "#93c5fd";
  const bd = type === "success" ? "#16a34a40" : type === "error" ? "#dc262640" : "#3b82f640";
  return { padding: "10px 14px", borderRadius: 8, fontSize: 12, marginBottom: 12, background: bg, color: fg, border: "1px solid " + bd };
}

export default function Web3WalletConnect({ onWalletLinked, compact }: Props) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);

  // Check if this address is already linked as a funding source
  useEffect(() => {
    if (!address) return;
    const checkLinked = async () => {
      try {
        const res = await fastapiClient.get("/crypto/funding-sources");
        const sources = Array.isArray(res.data) ? res.data : [];
        const found = sources.some((s: any) =>
          s.crypto_address?.toLowerCase() === address.toLowerCase()
        );
        if (found) setLinked(true);
      } catch {}
    };
    checkLinked();
  }, [address]);
  const [msg, setMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [hasProvider, setHasProvider] = useState(false);
  const [busy, setBusy] = useState(false);
  const addrRef = useRef<string | null>(null);
  useEffect(() => { addrRef.current = address; }, [address]);

  const fetchBal = useCallback(async (a: string) => {
    if (!window.ethereum) return;
    try {
      const h = await window.ethereum.request({ method: "eth_getBalance", params: [a, "latest"] });
      setBalance(weiHexToEth(h));
    } catch (e) { console.warn("[Web3] balance err", e); }
  }, []);

  const fetchChain = useCallback(async () => {
    if (!window.ethereum) return null;
    try {
      const h = await window.ethereum.request({ method: "eth_chainId" });
      const id = parseInt(h, 16);
      setChainId(id);
      return id;
    } catch { return null; }
  }, []);

  const doConnect = useCallback(async (silent = false) => {
    console.log("[Web3] doConnect called, silent=", silent, "ethereum=", !!window.ethereum);
    if (!window.ethereum) {
      if (!silent) setMsg({ type: "error", text: "No wallet detected. Install MetaMask or Brave Wallet." });
      return;
    }
    if (!silent) setBusy(true);
    try {
      setMsg(null);
      const accts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log("[Web3] accounts=", accts);
      if (!accts || accts.length === 0) {
        if (!silent) setMsg({ type: "error", text: "No accounts returned. Unlock your wallet." });
        setBusy(false);
        return;
      }
      setAddress(accts[0]);
      setConnected(true);
      await fetchChain();
      await fetchBal(accts[0]);
      if (!silent) { setMsg({ type: "success", text: "Wallet connected!" }); setTimeout(() => setMsg(null), 3000); }
    } catch (err: any) {
      console.error("[Web3] connect error", err);
      if (!silent) {
        setMsg({ type: "error", text: err?.code === 4001 ? "Rejected by user" : (err?.message || "Connection failed") });
      }
    }
    setBusy(false);
  }, [fetchBal, fetchChain]);

  const doDisconnect = useCallback(() => {
    setAddress(null); setChainId(null); setBalance(null); setConnected(false); setLinked(false); setMsg(null);
  }, []);

  useEffect(() => {
    const eth = window.ethereum;
    console.log("[Web3] mount, ethereum=", !!eth);
    setHasProvider(!!eth);
    if (!eth) return;
    const onAccts = (a: string[]) => {
      if (!a || a.length === 0) { setAddress(null); setConnected(false); setLinked(false); }
      else { setAddress(a[0]); fetchBal(a[0]); }
    };
    const onChain = (h: string) => { setChainId(parseInt(h, 16)); if (addrRef.current) fetchBal(addrRef.current); };
    eth.on("accountsChanged", onAccts);
    eth.on("chainChanged", onChain);
    eth.request({ method: "eth_accounts" }).then((a: string[]) => { if (a && a.length > 0) doConnect(true); }).catch(() => {});
    return () => { eth.removeListener("accountsChanged", onAccts); eth.removeListener("chainChanged", onChain); };
  }, [doConnect, fetchBal]);

  const switchNet = useCallback(async (id: number) => {
    if (!window.ethereum) return;
    try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x" + id.toString(16) }] }); }
    catch (e: any) { setMsg({ type: "error", text: e?.code === 4902 ? "Add this network to your wallet first" : (e?.message || "Switch failed") }); }
  }, []);

  const doLink = useCallback(async () => {
    if (!address || !chainId || !window.ethereum) return;
    setLinking(true); setMsg(null);
    try {
      const ts = Date.now();
      const m = "Link wallet " + address + " to DevSwat. Timestamp: " + ts;
      const sig = await window.ethereum.request({ method: "personal_sign", params: [m, address] });
      await fastapiClient.post("/crypto/funding-sources", {
        source_type: "crypto_wallet", crypto_address: address,
        crypto_chain: CHAINS[chainId]?.name.toLowerCase() || "ethereum",
        nickname: (CHAINS[chainId]?.name || "Unknown") + " Wallet", signature: sig, message: m, timestamp: ts,
      });
      setLinked(true);
      setMsg({ type: "success", text: "Wallet linked to your account!" });
      onWalletLinked?.(address, chainId);
    } catch (e: any) { setMsg({ type: "error", text: e?.response?.data?.detail || e?.message || "Link failed" }); }
    finally { setLinking(false); }
  }, [address, chainId, onWalletLinked]);

  const chain = chainId ? CHAINS[chainId] : null;
  const short = address ? address.slice(0, 6) + "..." + address.slice(-4) : "";

  if (compact) {
    return (<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {connected ? (<><span style={badge("#22c55e")}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />{short}</span>
        {chain && <span style={{ color: "#6b7280", fontSize: 11 }}>{chain.name}</span>}</>
      ) : (<button type="button" onClick={() => doConnect()} style={{ ...S.connectBtn, padding: "6px 14px", fontSize: 12 }}>Connect Wallet</button>)}
    </div>);
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M22 10H2"/><circle cx="18" cy="16" r="2"/></svg>
          Web3 Wallet
          {connected && <span style={badge("#22c55e")}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />Connected</span>}
          {linked && <span style={badge("#6366f1")}>Linked</span>}
        </div>
        {connected && (<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select value={chainId || ""} onChange={e => switchNet(Number(e.target.value))} style={S.networkSelect}>
            {Object.entries(CHAINS).map(([id, c]) => <option key={id} value={id}>{c.name}</option>)}
          </select>
          <button type="button" onClick={doDisconnect} style={S.disconnectBtn}>Disconnect</button>
        </div>)}
      </div>
      {msg && <div style={alertStyle(msg.type)}>{msg.text}</div>}
      {!hasProvider && (<div style={S.center}>
        <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 12 }}>No Web3 wallet detected</p>
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" style={{ ...S.connectBtn, textDecoration: "none" }}>Install MetaMask</a>
        <p style={{ color: "#6b7280", fontSize: 11, marginTop: 8 }}>Or enable Brave Wallet in browser settings</p>
      </div>)}
      {hasProvider && !connected && (<div style={S.center}>
        <button type="button" onClick={() => doConnect()} disabled={busy} style={{ ...S.connectBtn, opacity: busy ? 0.6 : 1 }}>
          {busy ? "Connecting..." : "Connect Wallet"}
        </button>
        <p style={{ color: "#6b7280", fontSize: 11, marginTop: 8 }}>Connect MetaMask or Brave Wallet</p>
      </div>)}
      {connected && address && (<>
        <div style={S.infoGrid}>
          <div style={S.infoCard}><div style={S.label}>Address</div><div style={S.value}>{short}</div>
            {chain && <a href={chain.explorer + "/address/" + address} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", fontSize: 11, textDecoration: "none", marginTop: 4, display: "inline-block" }}>View on {chain.name} &#8599;</a>}
          </div>
          <div style={S.infoCard}><div style={S.label}>Balance</div><div style={S.value}>{balance !== null ? balance + " " + (chain?.symbol || "ETH") : "Loading..."}</div></div>
          <div style={S.infoCard}><div style={S.label}>Network</div><div style={{ ...S.value, fontFamily: "inherit" }}>{chain ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />{chain.name}</span> : <span style={{ color: "#f59e0b" }}>Unknown ({chainId})</span>}</div></div>
        </div>
        {!linked && <button type="button" onClick={doLink} disabled={linking} style={{ ...S.linkBtn, opacity: linking ? 0.6 : 1 }}>{linking ? "Signing & Linking..." : "Link Wallet to Account"}</button>}
        {linked && <div style={alertStyle("success")}><strong>Wallet linked!</strong> This address is now associated with your DevSwat account.</div>}
      </>)}
    </div>
  );
}
