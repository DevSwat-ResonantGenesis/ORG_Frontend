import { Copy, Download, EyeOff, Hash, Key, QrCode, Shield } from 'lucide-react';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';

interface UserIdentity {
    crypto_hash: string;
    user_hash: string;
    universe_id: string;
    mnemonic_encrypted?: string;
}

export const IdentitySettings: React.FC = () => {
    const [identity, setIdentity] = useState<UserIdentity | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMnemonic, setShowMnemonic] = useState(false);
    const [password, setPassword] = useState('');
    const [mnemonic, setMnemonic] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        fetchIdentity();
    }, []);

    useEffect(() => {
        if (identity?.universe_id) {
            generateQRCode(identity.universe_id);
        }
    }, [identity]);

    const fetchIdentity = async () => {
        try {
            const response = await fetch('/api/auth/identity', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setIdentity(data);
        } catch (error) {
            console.error('Failed to fetch identity:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateQRCode = async (text: string) => {
        try {
            const url = await QRCode.toDataURL(text, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrCodeUrl(url);
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        }
    };

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            setTimeout(() => setCopied(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const downloadMnemonic = async () => {
        if (!password || !identity) return;

        try {
            const response = await fetch('/api/auth/mnemonic', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();
            if (data.mnemonic) {
                setMnemonic(data.mnemonic);
                setShowMnemonic(true);

                // Create downloadable file
                const blob = new Blob([data.mnemonic], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resonant-mnemonic-${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Failed to retrieve mnemonic:', error);
        }
    };

    const printMnemonic = () => {
        if (!mnemonic) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resonant Graph AI - Recovery Phrase</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 {
                text-align: center;
                color: #333;
              }
              .warning {
                background: #fff3cd;
                border: 2px solid #ffc107;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
              }
              .mnemonic {
                background: #f8f9fa;
                border: 2px solid #dee2e6;
                padding: 30px;
                margin: 20px 0;
                border-radius: 8px;
                font-size: 18px;
                line-height: 2;
                text-align: center;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <h1>🔐 Resonant Graph AI Recovery Phrase</h1>
            <div class="warning">
              <strong>⚠️ IMPORTANT:</strong> Store this recovery phrase in a secure location.
              Anyone with access to this phrase can access your account.
            </div>
            <div class="mnemonic">
              ${mnemonic}
            </div>
            <div class="footer">
              Generated: ${new Date().toLocaleString()}<br>
              Universe ID: ${identity?.universe_id || 'N/A'}
            </div>
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!identity) {
        return (
            <div className="text-center text-gray-500 py-8">
                Failed to load identity information
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold">User Identity</h2>
            </div>

            {/* Crypto Hash */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Hash className="w-5 h-5 text-purple-500" />
                        <h3 className="font-semibold">Cryptographic Hash</h3>
                    </div>
                    <button
                        onClick={() => copyToClipboard(identity.crypto_hash, 'crypto_hash')}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied === 'crypto_hash' ? (
                            <span className="text-green-500 text-sm">Copied!</span>
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </div>
                <code className="text-sm break-all bg-white dark:bg-gray-900 p-3 rounded block">
                    {identity.crypto_hash}
                </code>
                <p className="text-xs text-gray-500 mt-2">
                    Your unique cryptographic identifier for ownership verification
                </p>
            </div>

            {/* User Hash */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold">User Hash</h3>
                    </div>
                    <button
                        onClick={() => copyToClipboard(identity.user_hash, 'user_hash')}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied === 'user_hash' ? (
                            <span className="text-green-500 text-sm">Copied!</span>
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </div>
                <code className="text-sm break-all bg-white dark:bg-gray-900 p-3 rounded block">
                    {identity.user_hash}
                </code>
                <p className="text-xs text-gray-500 mt-2">
                    Your deterministic user identifier in the Hash Sphere
                </p>
            </div>

            {/* Universe ID with QR Code */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-blue-500" />
                        <h3 className="font-semibold">Universe ID</h3>
                    </div>
                    <button
                        onClick={() => copyToClipboard(identity.universe_id, 'universe_id')}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied === 'universe_id' ? (
                            <span className="text-green-500 text-sm">Copied!</span>
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <code className="text-sm break-all bg-white dark:bg-gray-900 p-3 rounded flex-1">
                        {identity.universe_id}
                    </code>
                    {qrCodeUrl && (
                        <div className="bg-white p-3 rounded">
                            <img src={qrCodeUrl} alt="Universe ID QR Code" className="w-32 h-32" />
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Your unique universe identifier - scan QR code for quick access
                </p>
            </div>

            {/* Mnemonic Backup */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border-2 border-yellow-300 dark:border-yellow-700">
                <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold">Recovery Phrase Backup</h3>
                </div>

                {!showMnemonic ? (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Back up your 12-word recovery phrase to restore access if needed.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button
                                onClick={downloadMnemonic}
                                disabled={!password}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-900 p-4 rounded border-2 border-yellow-400">
                            <div className="grid grid-cols-3 gap-2">
                                {mnemonic.split(' ').map((word, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{index + 1}.</span>
                                        <span className="font-mono">{word}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => copyToClipboard(mnemonic, 'mnemonic')}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                                {copied === 'mnemonic' ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={printMnemonic}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Print
                            </button>
                            <button
                                onClick={() => setShowMnemonic(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
                            >
                                <EyeOff className="w-4 h-4" />
                                Hide
                            </button>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            ⚠️ Store this phrase securely. Anyone with access can control your account.
                        </p>
                    </div>
                )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Best Practices
                </h4>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Never share your recovery phrase with anyone</li>
                    <li>• Store your backup in multiple secure locations</li>
                    <li>• Your crypto hash proves ownership of projects and agents</li>
                    <li>• Universe ID is used for deterministic Hash Sphere positioning</li>
                </ul>
            </div>
        </div>
    );
};
