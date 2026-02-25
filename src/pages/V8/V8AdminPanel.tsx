/**
 * V8 Admin Panel - Platform Owner Only
 * Compact control panel for V8 API management
 * NO localStorage - all data fetched live from backend
 */

import React, { useState, useEffect, useCallback } from "react";
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
  List,
} from "lucide-react";

interface V8Status {
  version: string;
  trained: boolean;
  vocab_size: number;
  anchors_count: number;
  forbidden_count: number;
}

interface AnchorData {
  hash: string;
  words: string[];
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const V8AdminPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForbiddenList, setShowForbiddenList] = useState(false);
  const [showAnchorsList, setShowAnchorsList] = useState(false);
  const [status, setStatus] = useState<V8Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Form states - NO localStorage, just React state
  const [newForbiddenWord, setNewForbiddenWord] = useState("");
  const [newAnchorWords, setNewAnchorWords] = useState("");
  const [newAnchorHash, setNewAnchorHash] = useState("");
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [anchors, setAnchors] = useState<AnchorData[]>([]);
  const [forbiddenLoading, setForbiddenLoading] = useState(false);
  const [anchorsLoading, setAnchorsLoading] = useState(false);

  // Check if user is platform owner - check multiple conditions
  const session = getSessionData();
  const isOwner = 
    session?.role === "platform_owner" || 
    session?.role === "owner" || 
    session?.role === "admin" ||
    session?.is_superuser === true;

  // Debug: Log session data to help trace login issues
  useEffect(() => {
    if (isExpanded) {
      console.log("[V8AdminPanel] Session data:", session);
      console.log("[V8AdminPanel] isOwner:", isOwner);
    }
  }, [isExpanded, session, isOwner]);

  const apiCall = useCallback(async (endpoint: string, method: string = "GET", body?: any): Promise<ApiResponse> => {
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
  }, []);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const result = await apiCall("status");
    if (result.success) {
      setStatus(result.data);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to load status" });
    }
    setLoading(false);
  }, [apiCall]);

  const loadForbiddenWords = useCallback(async () => {
    setForbiddenLoading(true);
    const result = await apiCall("forbidden");
    if (result.success) {
      const words = result.data.words || result.data.forbidden || result.data || [];
      setForbiddenWords(Array.isArray(words) ? words : []);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to load forbidden words" });
    }
    setForbiddenLoading(false);
  }, [apiCall]);

  const loadAnchors = useCallback(async () => {
    setAnchorsLoading(true);
    const result = await apiCall("anchors");
    if (result.success) {
      const anchorsList = result.data.anchors || result.data || [];
      setAnchors(Array.isArray(anchorsList) ? anchorsList : []);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to load anchors" });
    }
    setAnchorsLoading(false);
  }, [apiCall]);

  useEffect(() => {
    if (isExpanded && isOwner) {
      loadStatus();
      loadForbiddenWords();
      loadAnchors();
    }
  }, [isExpanded, isOwner, loadStatus, loadForbiddenWords, loadAnchors]);

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
      loadForbiddenWords();
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
      loadAnchors();
      loadStatus();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to add anchor" });
    }
    setActionLoading(null);
  };

  if (!isOwner) {
    return (
      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
            background: "rgba(100, 100, 100, 0.8)",
            border: "none", borderRadius: "8px",
            color: "white", cursor: "pointer", fontSize: "12px",
          }}
        >
          <Settings size={14} /> V8 Debug
        </button>
        {isExpanded && (
          <div style={{
            position: "absolute", bottom: "40px", right: "0", width: "300px",
            background: "rgba(30, 30, 40, 0.95)", padding: "12px", borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", color: "#aaa"
          }}>
            <div><strong>Session Debug:</strong></div>
            <div>Role: {session?.role || "none"}</div>
            <div>Email: {session?.email || "none"}</div>
            <div>is_superuser: {String(session?.is_superuser)}</div>
            <div>isOwner check: {String(isOwner)}</div>
            <div style={{marginTop: "8px", color: "#f87171"}}>
              Not recognized as owner. Please re-login.
            </div>
          </div>
        )}
      </div>
    );
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
          width: isExpanded ? "420px" : "auto", justifyContent: isExpanded ? "space-between" : "center",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings size={18} /> V8 Admin Panel
        </span>
        {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {isExpanded && (
        <div style={{
          width: "420px", background: "rgba(15, 15, 25, 0.95)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(99, 102, 241, 0.3)", borderTop: "none", borderRadius: "0 0 12px 12px",
          padding: "16px", maxHeight: "600px", overflowY: "auto",
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

          {/* Status Section */}
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

          {/* Retrain Button */}
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

          {/* Forbidden Words Section */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ color: "#a1a1aa", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Ban size={12} /> Forbidden Words
              </label>
              <button 
                onClick={() => { setShowForbiddenList(!showForbiddenList); if (!showForbiddenList) loadForbiddenWords(); }}
                style={{ background: "transparent", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <List size={12} /> {showForbiddenList ? "Hide" : "Show"} List
              </button>
            </div>
            
            {showForbiddenList && (
              <div style={{
                background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "10px", marginBottom: "10px",
                maxHeight: "150px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)"
              }}>
                {forbiddenLoading ? (
                  <div style={{ textAlign: "center", color: "#71717a" }}><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /></div>
                ) : forbiddenWords.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {forbiddenWords.map((word, idx) => (
                      <span key={idx} style={{
                        background: "rgba(236, 72, 153, 0.2)", color: "#ec4899", padding: "4px 8px",
                        borderRadius: "4px", fontSize: "11px", border: "1px solid rgba(236, 72, 153, 0.3)"
                      }}>{word}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#71717a", fontSize: "12px", textAlign: "center" }}>No forbidden words</div>
                )}
                <button onClick={loadForbiddenWords} style={{
                  marginTop: "8px", width: "100%", padding: "6px", background: "rgba(99, 102, 241, 0.2)",
                  border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "4px", color: "#6366f1",
                  cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                }}>
                  <RefreshCw size={12} /> Refresh from Backend
                </button>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <input type="text" value={newForbiddenWord} onChange={(e) => setNewForbiddenWord(e.target.value)} placeholder="Enter word..."
                style={{ flex: 1, padding: "10px 12px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", color: "white", fontSize: "13px" }} />
              <button onClick={handleAddForbidden} disabled={actionLoading === "forbidden" || !newForbiddenWord.trim()}
                style={{ padding: "10px 14px", background: "#ec4899", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", opacity: actionLoading === "forbidden" || !newForbiddenWord.trim() ? 0.5 : 1 }}>
                {actionLoading === "forbidden" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={16} />}
              </button>
            </div>
          </div>

          {/* Anchors List Section */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ color: "#a1a1aa", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Anchor size={12} /> Anchors
              </label>
              <button 
                onClick={() => { setShowAnchorsList(!showAnchorsList); if (!showAnchorsList) loadAnchors(); }}
                style={{ background: "transparent", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <List size={12} /> {showAnchorsList ? "Hide" : "Show"} List
              </button>
            </div>
            
            {showAnchorsList && (
              <div style={{
                background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "10px", marginBottom: "10px",
                maxHeight: "200px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)"
              }}>
                {anchorsLoading ? (
                  <div style={{ textAlign: "center", color: "#71717a" }}><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /></div>
                ) : anchors.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {anchors.map((anchor, idx) => (
                      <div key={idx} style={{
                        background: "rgba(139, 92, 246, 0.15)", border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "6px", padding: "8px", fontSize: "11px"
                      }}>
                        <div style={{ color: "#8b5cf6", fontWeight: 600, marginBottom: "4px", wordBreak: "break-all" }}>
                          {anchor.hash}
                        </div>
                        <div style={{ color: "#a1a1aa", fontSize: "10px" }}>
                          {anchor.words.join(" ")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#71717a", fontSize: "12px", textAlign: "center" }}>No anchors yet</div>
                )}
                <button onClick={loadAnchors} style={{
                  marginTop: "8px", width: "100%", padding: "6px", background: "rgba(99, 102, 241, 0.2)",
                  border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "4px", color: "#6366f1",
                  cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                }}>
                  <RefreshCw size={12} /> Refresh from Backend
                </button>
              </div>
            )}
          </div>

          {/* Add Anchor Section */}
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

          {/* Session Debug Info */}
          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "12px", marginTop: "8px" }}>
            <div style={{ color: "#52525b", fontSize: "10px", textAlign: "center" }}>
              Logged in as: {session?.email} | Role: {session?.role}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default V8AdminPanel;
