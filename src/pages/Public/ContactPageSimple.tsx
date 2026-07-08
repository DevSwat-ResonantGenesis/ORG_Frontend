import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/contact'];
import {
  Mail, User, Building2, MessageSquare, Phone,
  Send, Check, ArrowRight
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 56px)',
    background: 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  container: {
    width: '100%',
    maxWidth: '500px',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '100px',
    fontSize: '0.8rem',
    color: '#a5b4fc',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
  },
  formCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '2rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '0.5rem',
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 2.75rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box' as const,
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.4)',
  },
  textarea: {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    minHeight: '120px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    marginTop: '0.5rem',
  },
  successState: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(16,185,129,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  successTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  successText: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '2rem',
  },
};

export default function ContactPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submitted_at: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Contact form error:', error);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/contact" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>
      {/* Main */}
      <div style={styles.main}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.badge}>
              <MessageSquare size={14} /> Contact Us
            </div>
            <h1 style={styles.title}>Get in Touch</h1>
            <p style={styles.subtitle}>
              Have questions? We'd love to hear from you.
            </p>
          </div>

          {/* Form Card */}
          <div style={styles.formCard}>
            {success ? (
              <div style={styles.successState}>
                <div style={styles.successIcon}>
                  <Check size={40} color="#10b981" />
                </div>
                <h3 style={styles.successTitle}>Message Sent!</h3>
                <p style={styles.successText}>
                  Thanks for reaching out! We'll get back to you within 24 hours.
                </p>
                <button
                  style={styles.submitBtn}
                  onClick={() => navigate('/')}
                >
                  Back to Home <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Name *</label>
                    <div style={styles.inputWrapper}>
                      <User size={16} style={styles.inputIcon} />
                      <input
                        style={styles.input}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email *</label>
                    <div style={styles.inputWrapper}>
                      <Mail size={16} style={styles.inputIcon} />
                      <input
                        style={styles.input}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Company</label>
                    <div style={styles.inputWrapper}>
                      <Building2 size={16} style={styles.inputIcon} />
                      <input
                        style={styles.input}
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Your company"
                      />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone</label>
                    <div style={styles.inputWrapper}>
                      <Phone size={16} style={styles.inputIcon} />
                      <input
                        style={styles.input}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message *</label>
                  <textarea
                    style={styles.textarea}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : <>Send Message <Send size={18} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
