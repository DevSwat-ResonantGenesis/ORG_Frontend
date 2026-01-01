import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';import { goToValidationTool } from '@/utils/navigation';

import './EvidenceGraphParallax.css';

const EvidenceGraphParallax = () => {
  const navigate = useNavigate();
  const [typingText, setTypingText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [processingState, setProcessingState] = useState<'idle' | 'analyzing' | 'validating' | 'complete'>('analyzing');
  const [reportText, setReportText] = useState('');
  const [isDeletingReport, setIsDeletingReport] = useState(false);
  const [reportIndex, setReportIndex] = useState(0);

  // Random code snippets pool
  const codeSnippets = [
    'def process_input(text):\n    result = analyze(text)\n    return validate(result)',
    'evidence = build_graph(data)\ncompliance = check(evidence)\nreturn compliance',
    'graph = create_evidence()\nscore = calculate(graph)\nreturn score',
    'def compute_evidence(data):\n    nodes = extract_nodes(data)\n    edges = build_edges(nodes)\n    return graph',
    'compliance = verify(input)\nif compliance > threshold:\n    return approve()',
    'def analyze_causality(graph):\n    paths = find_paths(graph)\n    score = compute_score(paths)\n    return score',
    'evidence = collect_data()\nvalidated = validate(evidence)\nreturn validated',
    'graph = construct_dag(input)\nscore = evaluate(graph)\nreturn score',
  ];

  // Report snippets for ResonantGenesis Output
  const reportSnippets = [
    'The Evidence Graph: Auditing LLM Decisions',
    'The Controlled Brain for AI. Enforce Policy, Eliminate Hallucination.',
    '100% Policy Adherence for Regulated AI.',
  ];

  useEffect(() => {
    const currentText = codeSnippets[currentIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      // Typing
      if (typingText.length < currentText.length) {
        timeout = setTimeout(() => {
          setTypingText(currentText.slice(0, typingText.length + 1));
        }, 50 + Math.random() * 50);
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      // Deleting
      if (typingText.length > 0) {
        timeout = setTimeout(() => {
          setTypingText(typingText.slice(0, -1));
        }, 30);
      } else {
        // Finished deleting, move to next snippet
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % codeSnippets.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, currentIndex]);

  // Processing state rotation
  useEffect(() => {
    const states: Array<'idle' | 'analyzing' | 'validating' | 'complete'> = ['analyzing', 'validating', 'complete', 'idle'];
    let stateIndex = 0;
    const stateInterval = setInterval(() => {
      stateIndex = (stateIndex + 1) % states.length;
      setProcessingState(states[stateIndex]);
    }, 4000);

    return () => clearInterval(stateInterval);
  }, []);

  // Auto-activate nodes in sequence
  useEffect(() => {
    const nodeSequence = [1, 2, 3, 4, 5, 6];
    let nodeIndex = 0;
    const nodeInterval = setInterval(() => {
      setActiveNode(nodeSequence[nodeIndex]);
      nodeIndex = (nodeIndex + 1) % nodeSequence.length;
    }, 1500);

    return () => clearInterval(nodeInterval);
  }, []);

  // Report typing animation (only when complete)
  useEffect(() => {
    if (processingState !== 'complete') {
      setReportText('');
      setIsDeletingReport(false);
      setReportIndex(0);
      return;
    }

    const currentReport = reportSnippets[reportIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeletingReport) {
      // Typing
      if (reportText.length < currentReport.length) {
        timeout = setTimeout(() => {
          setReportText(currentReport.slice(0, reportText.length + 1));
        }, 30 + Math.random() * 30);
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsDeletingReport(true);
        }, 3000);
      }
    } else {
      // Deleting
      if (reportText.length > 0) {
        timeout = setTimeout(() => {
          setReportText(reportText.slice(0, -1));
        }, 20);
      } else {
        // Finished deleting, move to next snippet
        setIsDeletingReport(false);
        setReportIndex((prev) => (prev + 1) % reportSnippets.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [reportText, isDeletingReport, reportIndex, processingState]);

  // Format text with syntax highlighting
  const formatCode = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      if (line.trim() === '') return <div key={lineIdx} className="code-line"></div>;
      
      // Match patterns for syntax highlighting
      const parts: JSX.Element[] = [];
      let lastIndex = 0;
      
      // Keywords
      const keywordRegex = /\b(def|return|if|else|for|while|import|from|class|try|except)\b/g;
      // Functions
      const functionRegex = /\b([a-z_][a-z0-9_]*)\s*\(/g;
      // Comments
      const commentRegex = /#.*$/g;
      // Strings
      const stringRegex = /(['"])(?:(?=(\\?))\2.)*?\1/g;
      
      const matches: Array<{start: number, end: number, type: string, text: string}> = [];
      
      let match;
      while ((match = keywordRegex.exec(line)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, type: 'keyword', text: match[0] });
      }
      while ((match = functionRegex.exec(line)) !== null) {
        matches.push({ start: match.index, end: match.index + match[1].length, type: 'function', text: match[1] });
      }
      while ((match = commentRegex.exec(line)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, type: 'comment', text: match[0] });
      }
      while ((match = stringRegex.exec(line)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, type: 'string', text: match[0] });
      }
      
      matches.sort((a, b) => a.start - b.start);
      
      matches.forEach((m) => {
        if (m.start > lastIndex) {
          parts.push(<span key={`text-${lastIndex}`}>{line.substring(lastIndex, m.start)}</span>);
        }
        const className = m.type === 'keyword' ? 'keyword' : m.type === 'function' ? 'function' : m.type === 'comment' ? 'comment' : 'string';
        parts.push(<span key={`${m.type}-${m.start}`} className={className}>{m.text}</span>);
        lastIndex = m.end;
      });
      
      if (lastIndex < line.length) {
        parts.push(<span key={`text-${lastIndex}`}>{line.substring(lastIndex)}</span>);
      }
      
      return <div key={lineIdx} className="code-line">{parts}</div>;
    });
  };
  
  return (
    <div className="evidence-graph-parallax-container">
      <div className="evidence-graph-animation">
        {/* LLM Output Panel - Left Side */}
        <div className="llm-output-panel">
          <div className="panel-header">LLM OUTPUT</div>
          <div className="processing-status">LLM OUTPUT PROCESSING...</div>
          <div className="code-content">
            {formatCode(typingText)}
            <span className="typing-cursor">|</span>
          </div>
        </div>

        {/* Network Graph - Right Side */}
        <div className="network-graph-container">
          <div className="graph-visualization">
            {/* Graph Nodes */}
            <div 
              className={`graph-node-wrapper node-1 ${activeNode === 1 ? 'active' : ''}`}
              onMouseEnter={() => setActiveNode(1)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className="graph-node">
                <div className="node-glow"></div>
                <div className="node-ripple"></div>
              </div>
              <div className="node-label-box">Input</div>
            </div>
            
            <div 
              className={`graph-node-wrapper node-2 ${activeNode === 2 ? 'active' : ''}`}
              onMouseEnter={() => setActiveNode(2)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className="graph-node">
                <div className="node-glow"></div>
                <div className="node-ripple"></div>
              </div>
              <div className="node-label-box">Process</div>
            </div>
            
            <div 
              className={`graph-node-wrapper node-3 ${activeNode === 3 ? 'active' : ''}`}
              onMouseEnter={() => setActiveNode(3)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className="graph-node">
                <div className="node-glow"></div>
                <div className="node-ripple"></div>
              </div>
              <div className="node-label-box">Analyze</div>
            </div>
            
            <div 
              className={`graph-node-wrapper node-4 ${activeNode === 4 ? 'active' : ''}`}
              onMouseEnter={() => setActiveNode(4)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className="graph-node">
                <div className="node-glow"></div>
                <div className="node-ripple"></div>
              </div>
              <div className="node-label-box">Validate</div>
            </div>
            
            <div 
              className={`graph-node-wrapper node-5 ${activeNode === 5 ? 'active' : ''}`}
              onMouseEnter={() => setActiveNode(5)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className="graph-node">
                <div className="node-glow"></div>
                <div className="node-ripple"></div>
              </div>
              <div className="node-label-box">Output</div>
            </div>
            
            <div 
              className={`graph-node-wrapper node-6 ${activeNode === 6 ? 'active' : ''}`}
              onMouseEnter={() => setActiveNode(6)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className="graph-node">
                <div className="node-glow"></div>
                <div className="node-ripple"></div>
              </div>
              <div className="node-label-box">Evidence</div>
            </div>
            
            {/* Enhanced Connection Lines with Data Flow */}
            <div className="connection-line line-1">
              <div className="data-particle"></div>
            </div>
            <div className="connection-line line-2">
              <div className="data-particle"></div>
            </div>
            <div className="connection-line line-3">
              <div className="data-particle"></div>
            </div>
            <div className="connection-line line-4">
              <div className="data-particle"></div>
            </div>
            <div className="connection-line line-5">
              <div className="data-particle"></div>
            </div>
            <div className="connection-line line-6">
              <div className="data-particle"></div>
            </div>
            <div className="connection-line line-7">
              <div className="data-particle"></div>
            </div>
          </div>
        </div>

        {/* Processing Indicator - Bottom */}
        <div className="processing-indicator">
          {/* Compliance Section - Left Side */}
          <div className="compliance-section">
            <h3 className="compliance-title">COMPLIANCE</h3>
            <h4 className="compliance-subtitle">Enterprise-Grade Security & Privacy Standards</h4>
            
            <div className="compliance-item">
              <h5 className="compliance-item-title">GDPR & CCPA</h5>
              <p className="compliance-item-text">
                Assemble will never sell your personal information and processes any EEA-based personal data in accordance with our Data Processing Addendum and the standard contractual clauses (SCCs). See our Privacy Policy for more information.
              </p>
            </div>
            
            <div className="compliance-item">
              <h5 className="compliance-item-title">SOC 2 Type 2</h5>
              <p className="compliance-item-text">
                We work with an independent auditor to maintain SOC 2 Type II compliance. We are happy to provide our most recent SOC 2 Type II report to our customers upon request.
              </p>
            </div>
          </div>

          {/* Processing Section - Right Side */}
          <div className="processing-section">
          <div className="processing-arc-wrapper">
              <div className={`processing-arc ${processingState}`}></div>
            </div>
            <div className={`processing-text ${processingState}`}>
              {processingState === 'analyzing' && 'Analyzing...'}
              {processingState === 'validating' && 'Validating...'}
              {processingState === 'complete' && 'Complete'}
              {processingState === 'idle' && 'Processing...'}
            </div>
            
            {/* Compliance Badges */}
            <div className="compliance-badges">
              <div className="compliance-badge">
                <span className="badge-label">SOC 2</span>
              </div>
              <div className="compliance-badge">
                <span className="badge-label">GDPR</span>
              </div>
              <div className="compliance-badge">
                <span className="badge-label">CCPA</span>
              </div>
              <div className="compliance-badge">
                <span className="badge-label">AICPA</span>
              </div>
            </div>

            {/* ResonantGenesis Output - Shows when complete */}
            {processingState === 'complete' && (
              <div className="resonantgenesis-output-panel">
                <div className="panel-header">RESONANTGENESIS</div>
                <div className="code-content">
                  {formatCode(reportText)}
                  <span className="typing-cursor">|</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Score Output - Overlay */}
        <div className="compliance-score-overlay">
          <div className="score-label">Compliance Score</div>
          <div className="score-value">99.8%</div>
          <div className="score-status valid">Valid</div>
        </div>
      </div>

      {/* CTA Button - Hidden for hero section */}
        {/* <button 
          className="launch-demo-button"
          onClick={() => goToValidationTool(navigate)}
        >
          Launch Live Evidence Demo
        </button> */}
    </div>
  );
};

export default EvidenceGraphParallax;
