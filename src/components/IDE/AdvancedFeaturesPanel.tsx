import React, { useState } from 'react';
import styles from './AdvancedFeaturesPanel.module.css';

type FeatureTab =
    | 'collaboration'
    | 'debugger'
    | 'workspace'
    | 'plugins'
    | 'ai-agent'
    | 'code-graph'
    | 'test-gen'
    | 'api-inspector'
    | 'deploy'
    | 'ast-refactor'
    | 'split-editor';

interface AdvancedFeaturesPanelProps {
    initialTab?: FeatureTab;
    projectId?: string;
    onClose: () => void;
}

export const AdvancedFeaturesPanel: React.FC<AdvancedFeaturesPanelProps> = ({
    initialTab = 'collaboration',
    projectId,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<FeatureTab>(initialTab);

    const tabs: { id: FeatureTab; label: string; icon: string }[] = [
        { id: 'collaboration', label: 'Collaboration', icon: '🤝' },
        { id: 'debugger', label: 'Debugger', icon: '🐛' },
        { id: 'workspace', label: 'Workspace', icon: '📦' },
        { id: 'plugins', label: 'Plugins', icon: '🔌' },
        { id: 'ai-agent', label: 'AI Agent', icon: '🤖' },
        { id: 'code-graph', label: 'Code Graph', icon: '📊' },
        { id: 'test-gen', label: 'Test Generator', icon: '🧪' },
        { id: 'api-inspector', label: 'API Inspector', icon: '🔍' },
        { id: 'deploy', label: 'Deploy', icon: '🚀' },
        { id: 'ast-refactor', label: 'AST Refactor', icon: '🔧' },
        { id: 'split-editor', label: 'Split Editor', icon: '↔️' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'collaboration':
                return <CollaborationContent projectId={projectId} />;
            case 'debugger':
                return <DebuggerContent />;
            case 'workspace':
                return <WorkspaceContent />;
            case 'plugins':
                return <PluginsContent />;
            case 'ai-agent':
                return <AIAgentContent />;
            case 'code-graph':
                return <CodeGraphContent />;
            case 'test-gen':
                return <TestGeneratorContent />;
            case 'api-inspector':
                return <APIInspectorContent />;
            case 'deploy':
                return <DeployContent projectId={projectId} />;
            case 'ast-refactor':
                return <ASTRefactorContent />;
            case 'split-editor':
                return <SplitEditorContent />;
            default:
                return <div>Select a feature</div>;
        }
    };

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <h3>Advanced Features</h3>
                <button onClick={onClose} className={styles.closeButton}>×</button>
            </div>

            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className={styles.tabIcon}>{tab.icon}</span>
                        <span className={styles.tabLabel}>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {renderContent()}
            </div>
        </div>
    );
};

// Collaboration Content
const CollaborationContent: React.FC<{ projectId?: string }> = ({ projectId }) => (
    <div className={styles.featureContent}>
        <h4>🤝 Real-Time Collaboration</h4>
        <div className={styles.feature}>
            <p>Collaborate with your team in real-time:</p>
            <ul>
                <li>✓ See who's online</li>
                <li>✓ Live cursor tracking</li>
                <li>✓ Shared editing</li>
                <li>✓ Chat integration</li>
            </ul>
            <button className={styles.actionButton}>Invite Collaborators</button>
            <button className={styles.actionButton}>Generate Share Link</button>
        </div>
    </div>
);

// Debugger Content
const DebuggerContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>🐛 Advanced Debugger</h4>
        <div className={styles.feature}>
            <p>Debug your code with powerful tools:</p>
            <ul>
                <li>✓ Breakpoint management</li>
                <li>✓ Variable inspection</li>
                <li>✓ Call stack viewer</li>
                <li>✓ Step through code</li>
                <li>✓ Watch expressions</li>
            </ul>
            <button className={styles.actionButton}>Start Debugging</button>
            <button className={styles.actionButton}>Set Breakpoint</button>
        </div>
    </div>
);

// Workspace Content
const WorkspaceContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>📦 Workspace Manager</h4>
        <div className={styles.feature}>
            <p>Manage multiple projects efficiently:</p>
            <ul>
                <li>✓ Multi-project support</li>
                <li>✓ Quick project switching</li>
                <li>✓ Project templates</li>
                <li>✓ Workspace settings</li>
            </ul>
            <button className={styles.actionButton}>Create Workspace</button>
            <button className={styles.actionButton}>Switch Project</button>
        </div>
    </div>
);

// Plugins Content
const PluginsContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>🔌 Plugin Marketplace</h4>
        <div className={styles.feature}>
            <p>Extend your IDE with plugins:</p>
            <ul>
                <li>✓ Browse marketplace</li>
                <li>✓ Install/uninstall plugins</li>
                <li>✓ Configure settings</li>
                <li>✓ Create custom plugins</li>
            </ul>
            <button className={styles.actionButton}>Browse Plugins</button>
            <button className={styles.actionButton}>My Plugins</button>
        </div>
    </div>
);

// AI Agent Content
const AIAgentContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>🤖 AI Development Agent</h4>
        <div className={styles.feature}>
            <p>AI-powered coding assistance:</p>
            <ul>
                <li>✓ Code generation</li>
                <li>✓ Bug detection & fixing</li>
                <li>✓ Code review</li>
                <li>✓ Refactoring suggestions</li>
                <li>✓ Documentation generation</li>
            </ul>
            <button className={styles.actionButton}>Generate Code</button>
            <button className={styles.actionButton}>Review Code</button>
        </div>
    </div>
);

// Code Graph Content
const CodeGraphContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>📊 Code Dependency Graph</h4>
        <div className={styles.feature}>
            <p>Visualize your codebase structure:</p>
            <ul>
                <li>✓ Dependency visualization</li>
                <li>✓ Function call graph</li>
                <li>✓ Import/export map</li>
                <li>✓ Interactive navigation</li>
            </ul>
            <button className={styles.actionButton}>Generate Graph</button>
            <button className={styles.actionButton}>Analyze Dependencies</button>
        </div>
    </div>
);

// Test Generator Content
const TestGeneratorContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>🧪 Automated Test Generator</h4>
        <div className={styles.feature}>
            <p>Generate tests automatically:</p>
            <ul>
                <li>✓ Unit test generation</li>
                <li>✓ Coverage analysis</li>
                <li>✓ Mock generation</li>
                <li>✓ Test runner integration</li>
            </ul>
            <button className={styles.actionButton}>Generate Tests</button>
            <button className={styles.actionButton}>Run Tests</button>
        </div>
    </div>
);

// API Inspector Content
const APIInspectorContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>🔍 API Inspector</h4>
        <div className={styles.feature}>
            <p>Inspect and test APIs:</p>
            <ul>
                <li>✓ Endpoint discovery</li>
                <li>✓ Request/response viewer</li>
                <li>✓ API documentation</li>
                <li>✓ Testing interface</li>
            </ul>
            <button className={styles.actionButton}>Discover APIs</button>
            <button className={styles.actionButton}>Test Endpoint</button>
        </div>
    </div>
);

// Deploy Content
const DeployContent: React.FC<{ projectId?: string }> = ({ projectId }) => (
    <div className={styles.featureContent}>
        <h4>🚀 Cloud Deployment</h4>
        <div className={styles.feature}>
            <p>Deploy your project to the cloud:</p>
            <ul>
                <li>✓ One-click deployment</li>
                <li>✓ Environment configuration</li>
                <li>✓ Deployment history</li>
                <li>✓ Rollback support</li>
            </ul>
            <button className={styles.actionButton}>Deploy Now</button>
            <button className={styles.actionButton}>Configure</button>
        </div>
    </div>
);

// AST Refactor Content
const ASTRefactorContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>🔧 AST-Based Refactoring</h4>
        <div className={styles.feature}>
            <p>Advanced code transformations:</p>
            <ul>
                <li>✓ Rename symbols</li>
                <li>✓ Extract method/variable</li>
                <li>✓ Move code</li>
                <li>✓ Inline refactoring</li>
            </ul>
            <button className={styles.actionButton}>Rename</button>
            <button className={styles.actionButton}>Extract Method</button>
        </div>
    </div>
);

// Split Editor Content
const SplitEditorContent: React.FC = () => (
    <div className={styles.featureContent}>
        <h4>↔️ Split Editor View</h4>
        <div className={styles.feature}>
            <p>View multiple files simultaneously:</p>
            <ul>
                <li>✓ Horizontal/vertical split</li>
                <li>✓ Multiple panes</li>
                <li>✓ Synchronized scrolling</li>
                <li>✓ Independent editing</li>
            </ul>
            <button className={styles.actionButton}>Split Horizontal</button>
            <button className={styles.actionButton}>Split Vertical</button>
        </div>
    </div>
);
