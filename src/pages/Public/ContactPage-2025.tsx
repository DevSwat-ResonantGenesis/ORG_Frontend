import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { goToHelp } from '../../utils/navigation';
import logger from '../../utils/logger';
import styles from '../Help/HelpCenterPage.module.css';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Send email via mailto link with form data
      const mailtoLink = `mailto:info@dev-swat.com?subject=${encodeURIComponent(`[${formData.subject}] Contact from ${formData.name}`)}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company || 'N/A'}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`
      )}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      logger.info('Contact form submitted', { formData });
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    } catch (error) {
      logger.error('Failed to submit contact form', { error });
      alert('Failed to send message. Please try again or email us directly at info@dev-swat.com');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help from our support team via email. We typically respond within 24 hours.',
      tags: ['support', 'email']
    },
    {
      title: 'Sales Inquiries',
      description: 'Interested in enterprise plans or custom solutions? Our sales team is ready to help.',
      tags: ['sales', 'enterprise']
    },
    {
      title: 'Partnership',
      description: 'Looking to partner with ResonantGenesis? We\'d love to hear from you.',
      tags: ['partnership', 'business']
    }
  ];

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Contact Us</h1>
          <p className={styles.subtitle}>
            Have questions about ResonantGenesis? Want to learn more about our platform? 
            Get in touch with our team.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {submitted ? (
              <section className={styles.contentSection}>
                <h2>Message Sent!</h2>
                <div className={styles.articleGrid}>
                  <div className={styles.articleCard} style={{ cursor: 'default' }}>
                    <h3>Thank You</h3>
                    <p>
                      We've received your message and will get back to you within 24-48 hours. 
                      Check your email for a confirmation.
                    </p>
                    <div className={styles.articleTags}>
                      <span className={styles.articleTag}>confirmed</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <Button variant="secondary" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              </section>
            ) : (
              <>
                {/* Contact Methods */}
                <section className={styles.contentSection}>
                  <h2>How Can We Help?</h2>
                  <div className={styles.articleGrid}>
                    {contactMethods.map((method, idx) => (
                      <div key={idx} className={styles.articleCard} style={{ cursor: 'default' }}>
                        <h3>{method.title}</h3>
                        <p>{method.description}</p>
                        <div className={styles.articleTags}>
                          {method.tags.map(tag => (
                            <span key={tag} className={styles.articleTag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Contact Form */}
                <section className={styles.contentSection}>
                  <h2>Send Us a Message</h2>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Name *</label>
                        <input
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your name"
                          style={{
                            width: '100%',
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-base)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Email *</label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your.email@example.com"
                          style={{
                            width: '100%',
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-base)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Company</label>
                        <input
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Your company"
                          style={{
                            width: '100%',
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-base)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Subject *</label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          style={{
                            width: '100%',
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-base)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="">Select a subject</option>
                          <option value="sales">Sales Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="partnership">Partnership</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--font-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Your message..."
                        rows={6}
                        style={{
                          width: '100%',
                          padding: 'var(--space-3) var(--space-4)',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--font-base)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <Button type="submit" variant="primary" disabled={submitting}>
                        {submitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                </section>
              </>
            )}
          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/llm-scan">LLM Scanner</a></li>
                <li><a href="/about">About Us</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Need Immediate Help?</h3>
              <p>
                Check our Help Center for answers to common questions.
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={() => goToHelp(navigate)}>
                Visit Help Center
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

