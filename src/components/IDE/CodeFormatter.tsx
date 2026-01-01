// ============== CODE FORMATTER ==============
// Automated code formatting with multiple formatter support

import React, { memo, useState, useCallback } from 'react';
import styles from './CodeFormatter.module.css';

interface FormatRule {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'select' | 'number' | 'toggle';
  options?: { value: string; label: string }[];
  description?: string;
}

interface FormatterConfig {
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  trailingComma: 'none' | 'es5' | 'all';
  bracketSpacing: boolean;
  arrowParens: 'avoid' | 'always';
  printWidth: number;
  endOfLine: 'lf' | 'crlf' | 'auto';
  jsxSingleQuote: boolean;
}

interface CodeFormatterProps {
  code: string;
  language: string;
  onFormat?: (formattedCode: string) => void;
  onConfigChange?: (config: FormatterConfig) => void;
  className?: string;
}

const defaultConfig: FormatterConfig = {
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  printWidth: 80,
  endOfLine: 'lf',
  jsxSingleQuote: false,
};

const CodeFormatterComponent: React.FC<CodeFormatterProps> = ({
  code,
  language,
  onFormat,
  onConfigChange,
  className,
}) => {
  const [config, setConfig] = useState<FormatterConfig>(defaultConfig);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formattedCode, setFormattedCode] = useState<string>('');
  const [showDiff, setShowDiff] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('prettier');
  const [showConfig, setShowConfig] = useState(true);

  const presets = [
    { id: 'prettier', name: 'Prettier', icon: '💅' },
    { id: 'standard', name: 'Standard', icon: '📏' },
    { id: 'airbnb', name: 'Airbnb', icon: '🏨' },
    { id: 'google', name: 'Google', icon: '🔍' },
    { id: 'custom', name: 'Custom', icon: '⚙️' },
  ];

  const updateConfig = <K extends keyof FormatterConfig>(key: K, value: FormatterConfig[K]) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    setActivePreset('custom');
    onConfigChange?.(newConfig);
  };

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    let newConfig: FormatterConfig;

    switch (presetId) {
      case 'prettier':
        newConfig = { ...defaultConfig };
        break;
      case 'standard':
        newConfig = { ...defaultConfig, semi: false, singleQuote: true };
        break;
      case 'airbnb':
        newConfig = { ...defaultConfig, trailingComma: 'all', arrowParens: 'always' };
        break;
      case 'google':
        newConfig = { ...defaultConfig, singleQuote: true, trailingComma: 'es5' };
        break;
      default:
        return;
    }

    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const formatCode = useCallback(async () => {
    setIsFormatting(true);

    // Simulate formatting
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    let formatted = code;

    // Apply basic formatting rules
    const lines = code.split('\n');
    const formattedLines = lines.map(line => {
      let result = line;

      // Trim trailing whitespace
      result = result.trimEnd();

      // Apply tab/space conversion
      if (config.useTabs) {
        result = result.replace(/^( {2})+/g, match => '\t'.repeat(match.length / 2));
      } else {
        result = result.replace(/^\t+/g, match => ' '.repeat(match.length * config.tabWidth));
      }

      // Quotes
      if (config.singleQuote) {
        result = result.replace(/"([^"\\]*)"/g, "'$1'");
      } else {
        result = result.replace(/'([^'\\]*)'/g, '"$1"');
      }

      // Semicolons
      if (!config.semi && result.endsWith(';')) {
        result = result.slice(0, -1);
      }

      // Bracket spacing
      if (config.bracketSpacing) {
        result = result.replace(/\{(\S)/g, '{ $1').replace(/(\S)\}/g, '$1 }');
      }

      return result;
    });

    formatted = formattedLines.join('\n');

    // Trailing comma handling would go here in a real implementation

    setFormattedCode(formatted);
    setIsFormatting(false);
    onFormat?.(formatted);
  }, [code, config, onFormat]);

  const applyFormat = () => {
    onFormat?.(formattedCode);
  };

  const getDiffLines = () => {
    const original = code.split('\n');
    const formatted = formattedCode.split('\n');
    const diff: { type: 'same' | 'removed' | 'added'; content: string }[] = [];

    const maxLen = Math.max(original.length, formatted.length);
    for (let i = 0; i < maxLen; i++) {
      if (original[i] === formatted[i]) {
        diff.push({ type: 'same', content: original[i] || '' });
      } else {
        if (original[i]) {
          diff.push({ type: 'removed', content: original[i] });
        }
        if (formatted[i]) {
          diff.push({ type: 'added', content: formatted[i] });
        }
      }
    }

    return diff;
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>✨</span>
          <span>Code Formatter</span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.formatBtn}
            onClick={formatCode}
            disabled={isFormatting}
          >
            {isFormatting ? (
              <>
                <span className={styles.spinner} />
                Formatting...
              </>
            ) : (
              <>Format Code</>
            )}
          </button>
        </div>
      </div>

      <div className={styles.presets}>
        {presets.map(preset => (
          <button
            key={preset.id}
            className={`${styles.presetBtn} ${activePreset === preset.id ? styles.active : ''}`}
            onClick={() => applyPreset(preset.id)}
          >
            <span>{preset.icon}</span>
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      <button className={styles.configToggle} onClick={() => setShowConfig(!showConfig)}>
        {showConfig ? '▼' : '▶'} Configuration
      </button>

      {showConfig && (
        <div className={styles.configPanel}>
          <div className={styles.configGrid}>
            <div className={styles.configItem}>
              <label>Tab Width</label>
              <select
                value={config.tabWidth}
                onChange={e => updateConfig('tabWidth', parseInt(e.target.value))}
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>

            <div className={styles.configItem}>
              <label>Print Width</label>
              <input
                type="number"
                value={config.printWidth}
                onChange={e => updateConfig('printWidth', parseInt(e.target.value))}
                min={40}
                max={200}
              />
            </div>

            <div className={styles.configItem}>
              <label>Trailing Comma</label>
              <select
                value={config.trailingComma}
                onChange={e => updateConfig('trailingComma', e.target.value as FormatterConfig['trailingComma'])}
              >
                <option value="none">None</option>
                <option value="es5">ES5</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className={styles.configItem}>
              <label>Arrow Parens</label>
              <select
                value={config.arrowParens}
                onChange={e => updateConfig('arrowParens', e.target.value as FormatterConfig['arrowParens'])}
              >
                <option value="avoid">Avoid</option>
                <option value="always">Always</option>
              </select>
            </div>

            <div className={styles.configItem}>
              <label>End of Line</label>
              <select
                value={config.endOfLine}
                onChange={e => updateConfig('endOfLine', e.target.value as FormatterConfig['endOfLine'])}
              >
                <option value="lf">LF</option>
                <option value="crlf">CRLF</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          <div className={styles.toggles}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.useTabs}
                onChange={e => updateConfig('useTabs', e.target.checked)}
              />
              <span>Use Tabs</span>
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.semi}
                onChange={e => updateConfig('semi', e.target.checked)}
              />
              <span>Semicolons</span>
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.singleQuote}
                onChange={e => updateConfig('singleQuote', e.target.checked)}
              />
              <span>Single Quotes</span>
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.bracketSpacing}
                onChange={e => updateConfig('bracketSpacing', e.target.checked)}
              />
              <span>Bracket Spacing</span>
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.jsxSingleQuote}
                onChange={e => updateConfig('jsxSingleQuote', e.target.checked)}
              />
              <span>JSX Single Quotes</span>
            </label>
          </div>
        </div>
      )}

      {formattedCode && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTabs}>
              <button
                className={`${styles.resultTab} ${!showDiff ? styles.active : ''}`}
                onClick={() => setShowDiff(false)}
              >
                Formatted
              </button>
              <button
                className={`${styles.resultTab} ${showDiff ? styles.active : ''}`}
                onClick={() => setShowDiff(true)}
              >
                Diff
              </button>
            </div>
            <button className={styles.applyBtn} onClick={applyFormat}>
              ✓ Apply Changes
            </button>
          </div>

          <div className={styles.resultContent}>
            {showDiff ? (
              <div className={styles.diffView}>
                {getDiffLines().map((line, i) => (
                  <div key={i} className={`${styles.diffLine} ${styles[line.type]}`}>
                    <span className={styles.diffPrefix}>
                      {line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' '}
                    </span>
                    <span className={styles.diffContent}>{line.content}</span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className={styles.formattedCode}>{formattedCode}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const CodeFormatter = memo(CodeFormatterComponent);
export default CodeFormatter;
