import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Youtube, Mail } from 'lucide-react';

// Custom Reddit icon since lucide-react doesn't have one
const RedditIcon = ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
);

export const FooterSection = () => {
    return (
        <footer style={{
            background: 'linear-gradient(180deg, #0a0f1a 0%, #0f172a 100%)',
            borderTop: '1px solid rgba(59, 130, 246, 0.1)',
            padding: '64px 32px 32px',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {/* Main Footer Content */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '48px',
                    marginBottom: '48px',
                }}>
                    {/* Brand Column */}
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                        }}>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: '#f1f5f9',
                            }}>
                                ResonantGenesis
                            </span>
                        </div>
                        <p style={{
                            color: '#64748b',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            maxWidth: '280px',
                        }}>
                            AI governance platform that harmonizes meaning across multiple AI models.
                        </p>
                        {/* Social Links */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '24px',
                        }}>
                            {[
                                { icon: Linkedin, href: 'https://www.linkedin.com/company/110915264' },
                                { icon: Youtube, href: 'https://youtube.com/@resonantgenesis' },
                                { icon: Twitter, href: 'https://x.com/resonantgenesis' },
                                { icon: RedditIcon, href: 'https://www.reddit.com/r/resonantgenesis/' },
                                { icon: Mail, href: 'mailto:info@dev-swat.com' },
                            ].map(({ icon: Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#94a3b8',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                                        e.currentTarget.style.color = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.color = '#94a3b8';
                                    }}
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 style={{
                            color: '#f1f5f9',
                            fontSize: '14px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '20px',
                        }}>
                            Company
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {[
                                { label: 'Contact', to: '/contact' },
                                { label: 'Pricing', to: '/pricing' },
                                { label: 'Privacy Policy', to: '/privacy-policy' },
                                { label: 'Terms of Service', to: '/terms-of-service' },
                            ].map(({ label, to }) => (
                                <li key={label} style={{ marginBottom: '12px' }}>
                                    <Link
                                        to={to}
                                        style={{
                                            color: '#94a3b8',
                                            fontSize: '14px',
                                            textDecoration: 'none',
                                            transition: 'color 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <p style={{
                        color: '#64748b',
                        fontSize: '13px',
                        margin: 0,
                    }}>
                        © 2025 ResonantGenesis. All rights reserved.
                    </p>
                    <p style={{
                        color: '#475569',
                        fontSize: '13px',
                        margin: 0,
                    }}>
                        DevSwat Inc. San Francisco, California, USA · info@dev-swat.com
                    </p>
                </div>
            </div>
        </footer>
    );
};
