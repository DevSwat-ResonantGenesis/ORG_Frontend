import React, { useState, useEffect, useRef, useCallback } from 'react';
import { listSkills, toggleSkill, type Skill } from '@/api/skills';
import styles from './SkillsToolbar.module.css';

const SKILL_ICONS: Record<string, React.ReactNode> = {
  code: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  brain: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
    </svg>
  ),
};

const SkillsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

interface SkillsToolbarProps {
  onSkillToggle?: (skillId: string, enabled: boolean) => void;
}

const SkillsToolbar: React.FC<SkillsToolbarProps> = ({ onSkillToggle }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    const data = await listSkills();
    setSkills(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async (skill: Skill) => {
    const newEnabled = !skill.enabled;
    const success = await toggleSkill(skill.id, newEnabled);
    if (success) {
      setSkills(prev =>
        prev.map(s => (s.id === skill.id ? { ...s, enabled: newEnabled } : s))
      );
      onSkillToggle?.(skill.id, newEnabled);
    }
  };

  const enabledCount = skills.filter(s => s.enabled).length;
  const enabledSkills = skills.filter(s => s.enabled);

  return (
    <div className={styles.container}>
      {/* Enabled skill mini-icons */}
      {enabledSkills.map(skill => (
        <div
          key={skill.id}
          className={styles.miniIcon}
          title={`${skill.name} (active)`}
        >
          {SKILL_ICONS[skill.icon] || <span className={styles.iconFallback}>{skill.icon[0]?.toUpperCase()}</span>}
        </div>
      ))}

      {/* Main skills button */}
      <button
        ref={buttonRef}
        className={`${styles.skillsButton} ${enabledCount > 0 ? styles.hasActive : ''}`}
        onClick={() => setShowPopup(!showPopup)}
        title="Skills"
        type="button"
      >
        <SkillsIcon />
        {enabledCount > 0 && (
          <span className={styles.badge}>{enabledCount}</span>
        )}
      </button>

      {/* Skills popup */}
      {showPopup && (
        <div ref={popupRef} className={styles.popup}>
          <div className={styles.popupHeader}>
            <h3 className={styles.popupTitle}>Skills</h3>
            <span className={styles.popupSubtitle}>
              Connect skills to enhance Resonant Chat
            </span>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading skills...</div>
          ) : (
            <div className={styles.skillsList}>
              {skills.map(skill => (
                <div
                  key={skill.id}
                  className={`${styles.skillCard} ${skill.enabled ? styles.enabled : ''}`}
                >
                  <div className={styles.skillIcon}>
                    {SKILL_ICONS[skill.icon] || <span>{skill.icon[0]?.toUpperCase()}</span>}
                  </div>
                  <div className={styles.skillInfo}>
                    <div className={styles.skillName}>{skill.name}</div>
                    <div className={styles.skillDesc}>{skill.description}</div>
                    <div className={styles.skillMeta}>
                      <span className={styles.skillCategory}>{skill.category}</span>
                      {skill.credit_cost > 0 && (
                        <span className={styles.skillCost}>{skill.credit_cost} credits</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={`${styles.toggleBtn} ${skill.enabled ? styles.toggleOn : ''}`}
                    onClick={() => handleToggle(skill)}
                    title={skill.enabled ? 'Disable' : 'Enable'}
                    type="button"
                  >
                    <div className={styles.toggleTrack}>
                      <div className={styles.toggleThumb} />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillsToolbar;
