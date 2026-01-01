import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Users, Globe, Zap, Heart, Target, Award,
  ArrowRight, Github, Twitter, Linkedin, Mail
} from 'lucide-react';

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #050508 0%, #0a0a12 50%, #12121a 100%)',
    color: '#fff',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 3rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
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
  navLinks: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: '#888',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  hero: {
    textAlign: 'center',
    padding: '6rem 2rem 4rem',
    maxWidth: '900px',
    margin: '0 auto',
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
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    lineHeight: 1.1,
    marginBottom: '1.25rem',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: '#888',
    lineHeight: 1.6,
    maxWidth: '700px',
    margin: '0 auto',
  },
  section: {
    padding: '5rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '0.75rem',
  },
  sectionSubtitle: {
    fontSize: '1rem',
    color: '#888',
    textAlign: 'center',
    marginBottom: '3rem',
  },
  missionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
  },
  missionCard: {
    padding: '2rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    textAlign: 'center',
  },
  missionIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem',
  },
  missionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  missionDesc: {
    fontSize: '0.9rem',
    color: '#888',
    lineHeight: 1.6,
  },
  storySection: {
    padding: '5rem 2rem',
    background: 'rgba(255,255,255,0.01)',
  },
  storyContent: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    alignItems: 'center',
  },
  storyText: {
    fontSize: '1rem',
    color: '#aaa',
    lineHeight: 1.8,
  },
  storyHighlight: {
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '20px',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#888',
    marginTop: '0.25rem',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  valueCard: {
    padding: '1.5rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
  },
  valueIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  valueTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  valueDesc: {
    fontSize: '0.8rem',
    color: '#888',
    lineHeight: 1.5,
  },
  teamSection: {
    padding: '5rem 2rem',
    background: 'rgba(255,255,255,0.01)',
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  teamCard: {
    padding: '1.5rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    textAlign: 'center',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  teamName: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  teamRole: {
    fontSize: '0.8rem',
    color: '#6366f1',
    marginBottom: '0.75rem',
  },
  socialLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  socialLink: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  ctaSection: {
    padding: '5rem 2rem',
    textAlign: 'center',
  },
  ctaBox: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '3rem',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '24px',
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  ctaText: {
    fontSize: '1.1rem',
    color: '#888',
    marginBottom: '2rem',
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  btn: {
    padding: '0.875rem 1.75rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
  },
  btnOutline: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
  },
};

const mission = [
  { icon: <Target size={28} />, color: '#6366f1', title: 'Our Mission', desc: 'Democratize AI agent development, making powerful autonomous systems accessible to every developer.' },
  { icon: <Globe size={28} />, color: '#10b981', title: 'Our Vision', desc: 'A world where AI agents handle routine tasks, freeing humans to focus on creativity and innovation.' },
  { icon: <Heart size={28} />, color: '#ec4899', title: 'Our Promise', desc: 'Build tools that are secure, transparent, and designed with humanity\'s best interests in mind.' },
];

const values = [
  { icon: <Zap size={20} />, color: '#f59e0b', title: 'Innovation', desc: 'Push boundaries and embrace new ideas' },
  { icon: <Users size={20} />, color: '#3b82f6', title: 'Community', desc: 'Build together, grow together' },
  { icon: <Award size={20} />, color: '#10b981', title: 'Excellence', desc: 'Never compromise on quality' },
  { icon: <Heart size={20} />, color: '#ec4899', title: 'Empathy', desc: 'Put users first in everything' },
];

const team = [
  { name: 'Alex Chen', role: 'CEO & Co-Founder', initials: 'AC' },
  { name: 'Sarah Kim', role: 'CTO & Co-Founder', initials: 'SK' },
  { name: 'Marcus Johnson', role: 'Head of AI', initials: 'MJ' },
  { name: 'Elena Rodriguez', role: 'Head of Product', initials: 'ER' },
];

export default function AboutPage() {
  const navigate = useNavigate();

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
        <div style={styles.navLinks}>
          <span style={styles.navLink} onClick={() => navigate('/')}>Home</span>
          <span style={styles.navLink} onClick={() => navigate('/pricing')}>Pricing</span>
          <span style={styles.navLink} onClick={() => navigate('/docs')}>Docs</span>
          <span style={styles.navLink} onClick={() => navigate('/contact')}>Contact</span>
        </div>
      </nav>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.badge}>
          <Sparkles size={14} /> Our Story
        </div>
        <h1 style={styles.heroTitle}>
          Building the future of{' '}
          <span style={styles.heroGradient}>AI agents</span>
        </h1>
        <p style={styles.heroSubtitle}>
          We're a team of AI researchers, engineers, and designers on a mission to make 
          autonomous AI accessible to everyone.
        </p>
      </div>

      {/* Mission */}
      <div style={styles.section}>
        <div style={styles.missionGrid}>
          {mission.map((item, i) => (
            <div key={i} style={styles.missionCard}>
              <div style={{ ...styles.missionIcon, background: `${item.color}15`, color: item.color }}>
                {item.icon}
              </div>
              <h3 style={styles.missionTitle}>{item.title}</h3>
              <p style={styles.missionDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div style={styles.storySection}>
        <div style={styles.storyContent}>
          <div>
            <h2 style={{ ...styles.sectionTitle, textAlign: 'left', marginBottom: '1.5rem' }}>
              Our Story
            </h2>
            <p style={styles.storyText}>
              ResonantGenesis was born from a simple observation: building AI agents shouldn't require 
              a PhD in machine learning or months of development time.
            </p>
            <p style={{ ...styles.storyText, marginTop: '1rem' }}>
              Founded in 2024, we set out to create a platform that puts the power of autonomous AI 
              in the hands of every developer. Today, thousands of builders use ResonantGenesis to 
              create agents that automate workflows, assist customers, and solve complex problems.
            </p>
          </div>
          <div style={styles.storyHighlight}>
            <div style={styles.statGrid}>
              <div style={styles.stat}>
                <div style={styles.statValue}>10K+</div>
                <div style={styles.statLabel}>Developers</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>50K+</div>
                <div style={styles.statLabel}>Agents Created</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>1M+</div>
                <div style={styles.statLabel}>Executions</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>99.9%</div>
                <div style={styles.statLabel}>Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Values</h2>
        <p style={styles.sectionSubtitle}>The principles that guide everything we do</p>
        <div style={styles.valuesGrid}>
          {values.map((value, i) => (
            <div key={i} style={styles.valueCard}>
              <div style={{ ...styles.valueIcon, background: `${value.color}15`, color: value.color }}>
                {value.icon}
              </div>
              <h4 style={styles.valueTitle}>{value.title}</h4>
              <p style={styles.valueDesc}>{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={styles.teamSection}>
        <h2 style={{ ...styles.sectionTitle, marginBottom: '3rem' }}>Meet the Team</h2>
        <div style={styles.teamGrid}>
          {team.map((member, i) => (
            <div key={i} style={styles.teamCard}>
              <div style={styles.avatar}>{member.initials}</div>
              <div style={styles.teamName}>{member.name}</div>
              <div style={styles.teamRole}>{member.role}</div>
              <div style={styles.socialLinks}>
                <div style={styles.socialLink}><Twitter size={14} color="#888" /></div>
                <div style={styles.socialLink}><Linkedin size={14} color="#888" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <h3 style={styles.ctaTitle}>Join us on our mission</h3>
          <p style={styles.ctaText}>
            Whether you're building your first agent or scaling to millions, we're here to help.
          </p>
          <div style={styles.ctaButtons}>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => navigate('/signup')}>
              Start Building <ArrowRight size={18} />
            </button>
            <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={() => navigate('/careers')}>
              View Careers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
