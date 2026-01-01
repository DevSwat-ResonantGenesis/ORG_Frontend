import { ReactNode, useState } from 'react';
import { palette } from '../../theme/colors';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface Props {
  tabs: Tab[];
}

export const Tabs = ({ tabs }: Props) => {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((tab) => tab.id === active);
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              border: 'none',
              background: active === tab.id ? palette.accent : 'transparent',
              color: active === tab.id ? '#05070d' : palette.text,
              padding: '0.35rem 0.75rem',
              borderRadius: 8,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>{current?.content}</div>
    </div>
  );
};
