import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Home, ArrowLeft, Search, Bot, MessageSquare,
  BookOpen, HelpCircle, RefreshCw
} from 'lucide-react';

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #050508 0%, #0a0a12 50%, #12121f 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  orbs: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  orb1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
    filter: 'blur(60px)',
  },
  orb2: {
    position: 'absolute',
    bottom: '20%',
    right: '10%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
    filter: 'blur(60px)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    maxWidth: '600px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '3rem',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  errorCode: {
    fontSize: '8rem',
    fontWeight: '800',
    lineHeight: 1,
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 80px rgba(99,102,241,0.3)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.75rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '2.5rem',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '3rem',
  },
  btn: {
    padding: '0.875rem 1.75rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    border: 'none',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
  },
  suggestions: {
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '2rem',
  },
  suggestionsTitle: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  suggestionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  suggestionCard: {
    padding: '1.25rem 1rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
  },
  suggestionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.75rem',
  },
  suggestionLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  searchBox: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    maxWidth: '400px',
    margin: '0 auto 2rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  searchBtn: {
    padding: '0.875rem 1.25rem',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '10px',
    color: '#6366f1',
    cursor: 'pointer',
  },
};

const suggestions = [
  { icon: <Home size={20} />, label: 'Home', path: '/', color: '#6366f1' },
  { icon: <Bot size={20} />, label: 'Agents', path: '/agents', color: '#10b981' },
  { icon: <BookOpen size={20} />, label: 'Docs', path: '/docs', color: '#f59e0b' },
  { icon: <HelpCircle size={20} />, label: 'Support', path: '/contact', color: '#8b5cf6' },
];

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orbs}>
        <div style={styles.orb1} />
        <div style={styles.orb2} />
      </div>

      <div style={styles.content}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <div style={styles.logoIcon}>
            <Sparkles size={24} color="#fff" />
          </div>
          <span style={styles.logoText}>ResonantGenesis</span>
        </div>

        <div style={styles.errorCode}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.subtitle}>
          Oops! The page you're looking for seems to have wandered off into the void. 
          Let's get you back on track.
        </p>

        <div style={styles.searchBox}>
          <input
            style={styles.searchInput}
            placeholder="Search for something..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button style={styles.searchBtn} onClick={handleSearch}>
            <Search size={18} />
          </button>
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onClick={() => navigate('/')}
          >
            <Home size={18} /> Go Home
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>

        <div style={styles.suggestions}>
          <div style={styles.suggestionsTitle}>Quick Links</div>
          <div style={styles.suggestionsGrid}>
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={styles.suggestionCard}
                onClick={() => navigate(s.path)}
              >
                <div style={{ ...styles.suggestionIcon, background: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
                <div style={styles.suggestionLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
