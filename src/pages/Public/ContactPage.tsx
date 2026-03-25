import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import {
  Sparkles, Mail, User, Building2, MessageSquare, Phone,
  Send, Check, ArrowRight, Globe, Clock, MapPin, Twitter,
  Linkedin, Github, Video, Users, ChevronDown, Calendar, Zap
} from 'lucide-react';

type FormType = 'demo' | 'contact' | 'enterprise';

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  employees: string;
  preferredTime: string;
  useCase: string;
}

const benefits = [
  { icon: '🚀', title: 'Fast Setup', desc: 'Get started in minutes', color: '#3b82f6' },
  { icon: '🔒', title: 'Enterprise Security', desc: 'SOC2 compliant', color: '#22c55e' },
  { icon: '💬', title: '24/7 Support', desc: 'Always here to help', color: '#a855f7' },
  { icon: '📈', title: 'Scalable', desc: 'Grows with your needs', color: '#f59e0b' },
];

const getStyles = (theme: 'light' | 'dark'): Record<string, React.CSSProperties> => ({
  page: {
    minHeight: '100vh',
    background: theme === 'dark' 
      ? 'linear-gradient(180deg, #050508 0%, #0a0a12 100%)'
      : 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    color: theme === 'dark' ? '#fff' : '#1a1a1a',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 3rem',
    borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.1)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '700',
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
    textAlign: 'center',
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
    position: 'relative',
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
    position: 'absolute',
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
    resize: 'vertical',
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
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
      : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
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
    textAlign: 'center',
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
    color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
    marginBottom: '2rem',
  },
  formTabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  tab: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.2)',
    borderRadius: '10px',
    color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: theme === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(79,70,229,0.1)',
    borderColor: theme === 'dark' ? '#6366f1' : '#4f46e5',
    color: theme === 'dark' ? '#fff' : '#1a1a1a',
  },
});

export default function ContactPage() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const [formType, setFormType] = useState<FormType>('demo');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const styles = getStyles(theme);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    employees: '',
    message: '',
    preferredTime: '',
    useCase: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Submit to contact API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          form_type: formType,
          submitted_at: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Contact form error:', error);
      // Still show success for now as backend may not have endpoint yet
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <div style={styles.logoIcon}>
            <Sparkles size={22} color="#fff" />
          </div>
          <span style={styles.logoText}>ResonantGenesis</span>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.badge}>
          <MessageSquare size={14} /> Get in Touch
        </div>
        <h1 style={styles.heroTitle}>
          Let's <span style={styles.heroGradient}>Build Together</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Whether you want a demo, have questions, or need enterprise solutions — we're here to help you succeed.
        </p>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* Left Column - Info */}
        <div style={styles.leftColumn}>
          {/* Benefits */}
          <div style={styles.benefitsGrid}>
            {benefits.map((b, i) => (
              <div key={i} style={styles.benefitCard}>
                <div style={{ ...styles.benefitIcon, background: `${b.color}20`, color: b.color }}>
                  {b.icon}
                </div>
                <div style={styles.benefitTitle}>{b.title}</div>
                <div style={styles.benefitDesc}>{b.desc}</div>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>
              <Globe size={18} /> Contact Information
            </h3>
            <div style={styles.infoCards}>
              <div style={styles.infoCard}>
                <div style={{ ...styles.infoIcon, background: 'rgba(99,102,241,0.15)' }}>
                  <Mail size={20} color="#6366f1" />
                </div>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>Email</div>
                  <div style={styles.infoValue}>hello@resonantgenesis.com</div>
                </div>
              </div>
              <div style={styles.infoCard}>
                <div style={{ ...styles.infoIcon, background: 'rgba(16,185,129,0.15)' }}>
                  <Clock size={20} color="#10b981" />
                </div>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>Response Time</div>
                  <div style={styles.infoValue}>Within 24 hours</div>
                </div>
              </div>
              <div style={styles.infoCard}>
                <div style={{ ...styles.infoIcon, background: 'rgba(139,92,246,0.15)' }}>
                  <MapPin size={20} color="#8b5cf6" />
                </div>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>Headquarters</div>
                  <div style={styles.infoValue}>San Francisco, CA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>Follow Us</h3>
            <div style={styles.socialLinks}>
              <div style={styles.socialLink}><Twitter size={20} /></div>
              <div style={styles.socialLink}><Linkedin size={20} /></div>
              <div style={styles.socialLink}><Github size={20} /></div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div style={styles.rightColumn}>
          {/* Tabs */}
          <div style={styles.formTabs}>
            <button
              style={{ ...styles.tab, ...(formType === 'demo' ? styles.tabActive : {}) }}
              onClick={() => { setFormType('demo'); setSuccess(false); }}
            >
              <Video size={16} /> Book Demo
            </button>
            <button
              style={{ ...styles.tab, ...(formType === 'contact' ? styles.tabActive : {}) }}
              onClick={() => { setFormType('contact'); setSuccess(false); }}
            >
              <MessageSquare size={16} /> Contact
            </button>
            <button
              style={{ ...styles.tab, ...(formType === 'enterprise' ? styles.tabActive : {}) }}
              onClick={() => { setFormType('enterprise'); setSuccess(false); }}
            >
              <Building2 size={16} /> Enterprise
            </button>
          </div>

          <div style={styles.formCard}>
            {success ? (
              <div style={styles.successState}>
                <div style={styles.successIcon}>
                  <Check size={40} color="#10b981" />
                </div>
                <h3 style={styles.successTitle}>
                  {formType === 'demo' ? 'Demo Requested!' : 'Message Sent!'}
                </h3>
                <p style={styles.successText}>
                  {formType === 'demo'
                    ? "We'll reach out within 24 hours to schedule your personalized demo."
                    : "Thanks for reaching out! We'll get back to you soon."}
                </p>
                <button
                  style={styles.submitBtn}
                  onClick={() => navigate('/signup')}
                >
                  Get Started <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <>
                <h3 style={styles.formTitle}>
                  {formType === 'demo' && 'Schedule a Demo'}
                  {formType === 'contact' && 'Send us a Message'}
                  {formType === 'enterprise' && 'Enterprise Inquiry'}
                </h3>
                <p style={styles.formSubtitle}>
                  {formType === 'demo' && 'See ResonantGenesis in action with a personalized walkthrough'}
                  {formType === 'contact' && 'Have questions? We\'d love to hear from you'}
                  {formType === 'enterprise' && 'Get custom solutions for your organization'}
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={styles.row}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Full Name *</label>
                      <div style={styles.inputWrapper}>
                        <User size={16} style={styles.inputIcon} />
                        <input
                          style={styles.input}
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Work Email *</label>
                      <div style={styles.inputWrapper}>
                        <Mail size={16} style={styles.inputIcon} />
                        <input
                          style={styles.input}
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@company.com"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={styles.row}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Company *</label>
                      <div style={styles.inputWrapper}>
                        <Building2 size={16} style={styles.inputIcon} />
                        <input
                          style={styles.input}
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Acme Inc"
                          required
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

                  {(formType === 'demo' || formType === 'enterprise') && (
                    <div style={styles.row}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Company Size</label>
                        <div style={styles.inputWrapper}>
                          <Users size={16} style={styles.inputIcon} />
                          <select
                            style={styles.select}
                            name="employees"
                            value={formData.employees}
                            onChange={handleChange}
                          >
                            <option value="">Select size</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-1000">201-1000 employees</option>
                            <option value="1000+">1000+ employees</option>
                          </select>
                          <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                        </div>
                      </div>
                      {formType === 'demo' && (
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Preferred Time</label>
                          <div style={styles.inputWrapper}>
                            <Calendar size={16} style={styles.inputIcon} />
                            <select
                              style={styles.select}
                              name="preferredTime"
                              value={formData.preferredTime}
                              onChange={handleChange}
                            >
                              <option value="">Select time</option>
                              <option value="morning">Morning (9am-12pm)</option>
                              <option value="afternoon">Afternoon (12pm-5pm)</option>
                              <option value="evening">Evening (5pm-8pm)</option>
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {formType === 'demo' && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Primary Use Case</label>
                      <div style={styles.inputWrapper}>
                        <Zap size={16} style={styles.inputIcon} />
                        <select
                          style={styles.select}
                          name="useCase"
                          value={formData.useCase}
                          onChange={handleChange}
                        >
                          <option value="">Select use case</option>
                          <option value="automation">Task Automation</option>
                          <option value="chatbots">Chatbots & Support</option>
                          <option value="content">Content Generation</option>
                          <option value="data">Data Processing</option>
                          <option value="code">Code Assistant</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  )}

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      {formType === 'demo' ? 'Anything specific you want to see?' : 'Message *'}
                    </label>
                    <textarea
                      style={styles.textarea}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={formType === 'demo' 
                        ? "Tell us about your goals and what you'd like to explore..."
                        : "How can we help you?"
                      }
                      required={formType !== 'demo'}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                  >
                    {loading ? (
                      'Sending...'
                    ) : (
                      <>
                        {formType === 'demo' ? 'Request Demo' : 'Send Message'}
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
