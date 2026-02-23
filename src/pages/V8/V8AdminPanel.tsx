/**
 * V8 Admin Panel - Platform Owner Only
 * Compact control panel for V8 API management
 */

import React, { useState, useEffect } from "react";
import { getSessionData } from "../../utils/auth-cookies";
import {
  Settings,
  RefreshCw,
  Plus,
  Ban,
  Anchor,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface V8Status {
  version: string;
  trained: boolean;
  vocab_size: number;
  anchors_count: number;
  forbidden_count: number;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const V8AdminPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<V8Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Form states
  const [newForbiddenWord, setNewForbiddenWord] = useState("");
  const [newAnchorWords, setNewAnchorWords] = useState("");
  const [newAnchorHash, setNewAnchorHash] = useState("");
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);

  // Check if user is platform owner
  const session = getSessionData();
  const isOwner = session?.role === "platform_owner" || session?.role === "owner" || session?.is_superuser === true;

  const apiCall = async (endpoint: string, method: string = "GET", body?: any): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/v1/v8/api/admin/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || data.detail || "Request failed" };
      }
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || "Network error" };
    }
  };

  const loadStatus = async () => {
    setLoading(true);
    const result = await apiCall("status");
    if (result.success) {
      setStatus(result.data);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to load status" });
    }
    setLoading(false);
  };

  const loadForbidden = async () => {
    const result = await apiCall("forbidden");
    if (result.success) {
      setForbiddenWords(result.data.words || result.data.forbidden || []);
    }
  };

  useEffect(() => {
    if (isExpanded && isOwner) {
      loadStatus();
      loadForbidden();
    }
  }, [isExpanded, isOwner]);

  const handleRetrain = async () => {
    setActionLoading("retrain");
    setMessage(null);
    const result = await apiCall("training/start", "POST");
    if (result.success) {
      setMessage({ type: "success", text: "Model retraining started successfully" });
      loadStatus();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to start retraining" });
    }
    setActionLoading(null);
  };

  const handleAddForbidden = async () => {
    if (!newForbiddenWord.trim()) return;
    setActionLoading("forbidden");
    const result = await apiCall("forbidden", "POST", { words: [newForbiddenWord.trim()] });
    if (result.success) {
      setMessage({ type: "success", text: `Added "${newForbiddenWord}" to forbidden words` });
      setNewForbiddenWord("");
      loadForbidden();
      loadStatus();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to add forbidden word" });
    }
    setActionLoading(null);
  };

  const handleAddAnchor = async () => {
    if (!newAnchorWords.trim() || !newAnchorHash.trim()) return;
    const words = newAnchorWords.split(/[\s,]+/).filter(w => w.trim());
    if (words.length !== 12) {
      setMessage({ type: "error", text: "Anchor must have exactly 12 words" });
      return;
    }
    setActionLoading("anchor");
    const result = await apiCall("anchors", "POST", { hash: newAnchorHash.trim(), words });
    if (result.success) {
      setMessage({ type: "success", text: "Anchor added successfully" });
      setNewAnchorWords("");
      setNewAnchorHash("");
      loadStatus();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to add anchor" });
    }
    setActionLoading(null);
  };

  if (!isOwner) {
    return null;
  }

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          border: "none", borderRadius: isExpanded ? "12px 12px 0 0" : "12px",
          color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 600,
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
          width: isExpanded ? "360px" : "auto", justifyContent: isExpanded ? "space-between" : "center",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings size={18} /> V8 Admin Panel
        </span>
        {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {isExpanded && (
        <div style={{
          width: "360px", background: "rgba(15, 15, 25, 0.95)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(99, 102, 241, 0.3)", borderTop: "none", borderRadius: "0 0 12px 12px",
          padding: "16px", maxHeight: "500px", overflowY: "auto",
        }}>
          {message && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", marginBottom: "12px",
              borderRadius: "8px",
              background: message.type === "success" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
              border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              color: message.type === "success" ? "#22c55e" : "#ef4444", fontSize: "13px",
            }}>
              {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#a1a1aa", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>System Status</span>
              <button onClick={loadStatus} disabled={loading} style={{ background: "transparent", border: "none", color: "#6366f1", cursor: "pointer", padding: "4px" }}>
                <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              </button>
            </div>
            {status ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div style={{ background: "rgba(99, 102, 241, 0.1)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ color: "#6366f1", fontSize: "18px", fontWeight: 600 }}>{status.vocab_size}</div>
                  <div style={{ color: "#71717a", fontSize: "11px" }}>Vocabulary</div>
                </div>
                <div style={{ background: "rgba(139, 92, 246, 0.1)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ color: "#8b5cf6", fontSize: "18px", fontWeight: 600 }}>{status.anchors_count}</div>
                  <div style={{ color: "#71717a", fontSize: "11px" }}>Anchors</div>
                </div>
                <div style={{ background: "rgba(236, 72, 153, 0.1)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ color: "#ec4899", fontSize: "18px", fontWeight: 600 }}>{status.forbidden_count}</div>
                  <div style={{ color: "#71717a", fontSize: "11px" }}>Forbidden</div>
                </div>
                <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "10px", borderRadius: "8px" }}>
                  <div style={{ color: "#22c55e", fontSize: "18px", fontWeight: 600 }}>v{status.version}</div>
                  <div style={{ color: "#71717a", fontSize: "11px" }}>{status.trained ? "Trained" : "Not Trained"}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: "#71717a", fontSize: "13px", textAlign: "center", padding: "20px" }}>
                {loading ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : "Click refresh to load status"}
              </div>
            )}
          </div>

          <button onClick={handleRetrain} disabled={actionLoading === "retrain"} style={{
            width: "100%", padding: "12px", marginBottom: "16px",
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            border: "none", borderRadius: "8px", color: "white", cursor: "pointer",
            fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: actionLoading === "retrain" ? 0.7 : 1,
          }}>
            {actionLoading === "retrain" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <RefreshCw size={16} />}
            Retrain Model
          </button>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#a1a1aa", fontSize: "12px", display: "block", marginBottom: "6px" }}>
              <Ban size={12} style={{ display: "inline", marginRight: "4px" }} /> Add Forbidden Word
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="text" value={newForbiddenWord} onChange={(e) => setNewForbiddenWord(e.target.value)} placeholder="Enter word..."
                style={{ flex: 1, padding: "10px 12px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "white", fontSize: "13px" }} />
              <button onClick={handleAddForbidden} disabled={actionLoading === "forbidden" || !newForbiddenWord.trim()}
                style={{ padding: "10px 14px", background: "#ec4899", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", opacity: actionLoading === "forbidden" || !newForbiddenWord.trim() ? 0.5 : 1 }}>
                {actionLoading === "forbidden" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={16} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#a1a1aa", fontSize: "12px", display: "block", marginBottom: "6px" }}>
              <Anchor size={12} style={{ display: "inline", marginRight: "4px" }} /> Add Anchor (12 words + hash)
            </label>
            <input type="text" value={newAnchorHash} onChange={(e) => setNewAnchorHash(e.target.value)} placeholder="0x... hash"
              style={{ width: "100%", padding: "10px 12px", marginBottom: "8px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "white", fontSize: "13px", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="text" value={newAnchorWords} onChange={(e) => setNewAnchorWords(e.target.value)} placeholder="12 words separated by spaces..."
                style={{ flex: 1, padding: "10px 12px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "white", fontSize: "13px" }} />
              <button onClick={handleAddAnchor} disabled={actionLoading === "anchor" || !newAnchorWords.trim() || !newAnchorHash.trim()}
                style={{ padding: "10px 14px", background: "#8b5cf6", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", opacity: actionLoading === "anchor" || !newAnchorWords.trim() || !newAnchorHash.trim() ? 0.5 : 1 }}>
                {actionLoading === "anchor" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={16} />}
              </button>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "12px" }}>
            <div style={{ color: "#71717a", fontSize: "11px", textAlign: "center" }}>
              Forbidden: {forbiddenWords.slice(0, 5).join(", ")}{forbiddenWords.length > 5 ? "..." : ""}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default V8AdminPanel;
