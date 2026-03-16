import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import styles from './DownloadIDEPage.module.css';

const DownloadIDEPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  const features = [
    {
      icon: '🧠',
      title: 'Agentic AI Assistant',
      desc: 'Built-in Resonant AI that reads your project, executes tools, searches the web, and writes code — all locally.',
    },
    {
      icon: '🔍',
      title: 'Code Visualizer',
      desc: 'Deep codebase analysis with dependency graphs, function tracing, governance checks, and architecture insights.',
    },
    {
      icon: '💾',
      title: 'Hash Sphere Memory',
      desc: 'Persistent long-term memory that carries context across sessions. Your AI remembers your projects and preferences.',
    },
    {
      icon: '⚡',
      title: 'Local Tool Execution',
      desc: 'File read/write, grep search, terminal commands, and git operations — executed directly on your machine.',
    },
    {
      icon: '🔗',
      title: 'GitHub Integration',
      desc: 'Create repos, manage issues, pull requests, review code, and push changes — all from the chat panel.',
    },
    {
      icon: '🛡️',
      title: 'Privacy First',
      desc: 'Your code stays on your machine. Only the queries you send are processed by the AI. No telemetry, no tracking.',
    },
  ];

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <img
              src={theme === 'dark' ? '/logo white.png' : '/logo black.png'}
              alt="Resonant"
              className={styles.heroBadgeLogo}
            />
            Powered by Resonant AI
          </div>
          <h1 className={styles.heroTitle}>
            Resonant <span className={styles.heroAccent}>IDE</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The AI-native code editor with an agentic assistant that understands your entire codebase.
            Build faster with local tool execution, persistent memory, and deep code analysis.
          </p>
          <div className={styles.heroActions}>
            <a
              href="https://github.com/nicojo77/Resonant_App/releases"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download for Desktop
            </a>
            <button
              className={styles.secondaryButton}
              onClick={() => navigate('/resonant-chat')}
            >
              Try in Browser
            </button>
          </div>
          <div className={styles.heroPlatforms}>
            Available for macOS • Windows • Linux
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className={styles.screenshots}>
        <h2 className={styles.sectionTitle}>See It in Action</h2>
        <p className={styles.sectionDesc}>
          Resonant IDE combines a professional code editor with an AI assistant that can read, analyze, and modify your code.
        </p>
        <div className={styles.screenshotGrid}>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotImageWrap}>
              <img
                src="/images/showcase/Resonant AI IDEanswer.png"
                alt="Resonant AI IDE — Code Analysis"
                className={styles.screenshotImage}
              />
            </div>
            <div className={styles.screenshotCaption}>
              <h3>Deep Code Analysis</h3>
              <p>Ask the AI to analyze your project structure, trace execution flows, and generate dependency graphs.</p>
            </div>
          </div>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotImageWrap}>
              <img
                src="/images/showcase/Resonant AI IDEinquery sse .png"
                alt="Resonant AI IDE — Agentic Tool Execution"
                className={styles.screenshotImage}
              />
            </div>
            <div className={styles.screenshotCaption}>
              <h3>Agentic Tool Execution</h3>
              <p>Watch the AI read files, search code, and execute commands in real-time with full SSE streaming.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Built for Developers</h2>
        <p className={styles.sectionDesc}>
          Everything you need to build with AI, all in one place.
        </p>
        <div className={styles.featureGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <img
            src={theme === 'dark' ? '/logo white.png' : '/logo black.png'}
            alt=""
            className={styles.ctaLogo}
          />
          <h2 className={styles.ctaTitle}>Ready to build with Resonant AI?</h2>
          <p className={styles.ctaDesc}>
            Download the IDE or start coding directly in the browser.
          </p>
          <div className={styles.ctaActions}>
            <a
              href="https://github.com/nicojo77/Resonant_App/releases"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadButton}
            >
              Download Resonant IDE
            </a>
            <button
              className={styles.secondaryButton}
              onClick={() => navigate('/resonant-chat')}
            >
              Open in Browser
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DownloadIDEPage;
