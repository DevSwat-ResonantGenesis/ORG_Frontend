import React from 'react';
import { useThemeStore } from '@/store/themeStore';
import styles from './DownloadIDEPage.module.css';

const FeatureIconBrain = () => (
  <svg className="featureParallaxIcon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="16" cy="16" r="12" />
    <path d="M12 10C12 10 14 8 16 8C18 8 20 10 20 12C20 14 18 14 18 16C18 18 16 18 16 20" strokeLinecap="round" />
    <circle cx="16" cy="24" r="1" fill="currentColor" stroke="none" />
    <path d="M10 14H8M22 14H24M11 20L9 22M21 20L23 22" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const FeatureIconSearch = () => (
  <svg className="featureParallaxIcon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="14" cy="14" r="8" />
    <path d="M20 20L27 27" strokeLinecap="round" />
    <path d="M11 11L17 17M11 14H17" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const FeatureIconMemory = () => (
  <svg className="featureParallaxIcon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="16" cy="16" r="10" strokeDasharray="3 3" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="20" cy="12" r="2" />
    <circle cx="12" cy="20" r="2" />
    <circle cx="20" cy="20" r="2" />
    <path d="M14 12H18M12 14V18M20 14V18M14 20H18" opacity="0.4" />
  </svg>
);

const FeatureIconBolt = () => (
  <svg className="featureParallaxIcon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 4L8 18H16L14 28L24 14H16L18 4Z" strokeLinejoin="round" />
  </svg>
);

const FeatureIconGit = () => (
  <svg className="featureParallaxIcon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="16" cy="8" r="3" />
    <circle cx="10" cy="24" r="3" />
    <circle cx="22" cy="24" r="3" />
    <path d="M16 11V18L10 21M16 18L22 21" strokeLinecap="round" />
  </svg>
);

const FeatureIconShield = () => (
  <svg className="featureParallaxIcon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 4L6 10V18C6 24 16 28 16 28C16 28 26 24 26 18V10L16 4Z" strokeLinejoin="round" />
    <path d="M12 16L15 19L20 13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DownloadIDEPage: React.FC = () => {
  const { theme } = useThemeStore();

  const features = [
    {
      icon: <FeatureIconBrain />,
      title: 'Agentic AI Assistant',
      desc: 'Built-in Resonant AI that reads your project, executes tools, searches the web, and writes code — all locally.',
    },
    {
      icon: <FeatureIconSearch />,
      title: 'Code Visualizer',
      desc: 'Deep codebase analysis with dependency graphs, function tracing, governance checks, and architecture insights.',
    },
    {
      icon: <FeatureIconMemory />,
      title: 'Hash Sphere Memory',
      desc: 'Persistent long-term memory that carries context across sessions. Your AI remembers your projects and preferences.',
    },
    {
      icon: <FeatureIconBolt />,
      title: 'Local Tool Execution',
      desc: 'File read/write, grep search, terminal commands, and git operations — executed directly on your machine.',
    },
    {
      icon: <FeatureIconGit />,
      title: 'GitHub Integration',
      desc: 'Create repos, manage issues, pull requests, review code, and push changes — all from the chat panel.',
    },
    {
      icon: <FeatureIconShield />,
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
              href="https://dev-swat.com/downloads/resonant-ide/Resonant-IDE-1.0.0-arm64-mac.zip"
              className={styles.downloadButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download for macOS (209 MB)
            </a>
          </div>
          <div className={styles.heroPlatforms}>
            Currently available for macOS (Apple Silicon). Windows &amp; Linux coming soon.
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
                src="/images/showcase/resonant-ide-answer.png"
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
                src="/images/showcase/resonant-ide-inquiry.png"
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
            Download the IDE and start building with AI on your machine.
          </p>
          <div className={styles.ctaActions}>
            <a
              href="https://dev-swat.com/downloads/resonant-ide/Resonant-IDE-1.0.0-arm64-mac.zip"
              className={styles.downloadButton}
            >
              Download for macOS (209 MB)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DownloadIDEPage;
