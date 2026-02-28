import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  agents: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  state_physics: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4v2" />
      <path d="M20 12h-2" />
      <path d="M12 20v-2" />
      <path d="M4 12h2" />
    </svg>
  ),
  ide: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 18v3" />
      <polyline points="9 10 7 12 9 14" />
      <polyline points="15 10 17 12 15 14" />
    </svg>
  ),
};

const SkillsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 21 12 12 21 3 12 12 3Z" />
    <path d="M12 8 16 12 12 16 8 12 12 8Z" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export interface SkillsToolbarProps {
  onSkillToggle?: (skillId: string, enabled: boolean) => void;
  onEnabledSkillsChange?: (enabledSkillIds: string[]) => void;
}

const SkillsToolbar: React.FC<SkillsToolbarProps> = ({ onSkillToggle, onEnabledSkillsChange }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    const data = await listSkills();
    const safeData = Array.isArray(data) ? data : [];
    setSkills(safeData);
    // Notify parent of initially enabled skills
    const enabledIds = safeData.filter(s => s.enabled).map(s => s.id);
    onEnabledSkillsChange?.(enabledIds);
    setLoading(false);
  }, [onEnabledSkillsChange]);

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

  const updatePopupPosition = useCallback(() => {
    if (!showPopup || !buttonRef.current || typeof window === 'undefined') return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popupWidth = 300;
    const popupHeight = 360;
    const spacing = 10;
    const left = Math.min(
      Math.max(spacing, rect.right - popupWidth),
      Math.max(spacing, window.innerWidth - popupWidth - spacing)
    );

    const canPlaceAbove = rect.top - popupHeight - spacing >= spacing;
    const top = canPlaceAbove
      ? Math.max(spacing, rect.top - 12)
      : Math.min(window.innerHeight - spacing, rect.bottom + 12);

    setPopupStyle({
      position: 'fixed',
      left,
      top,
      right: 'auto',
      bottom: 'auto',
      transform: canPlaceAbove ? 'translateY(-100%)' : 'none',
      width: `${popupWidth}px`,
      maxWidth: `min(${popupWidth}px, calc(100vw - ${spacing * 2}px))`,
      zIndex: 120000,
    });
  }, [showPopup]);

  useEffect(() => {
    if (!showPopup) return;
    updatePopupPosition();
    window.addEventListener('resize', updatePopupPosition);
    window.addEventListener('scroll', updatePopupPosition, true);
    return () => {
      window.removeEventListener('resize', updatePopupPosition);
      window.removeEventListener('scroll', updatePopupPosition, true);
    };
  }, [showPopup, updatePopupPosition]);

  const handleToggle = async (skill: Skill) => {
    const newEnabled = !skill.enabled;
    // Update local state immediately (don't wait for backend)
    const updated = skills.map(s => (s.id === skill.id ? { ...s, enabled: newEnabled } : s));
    setSkills(updated);
    onSkillToggle?.(skill.id, newEnabled);
    const enabledIds = updated.filter(s => s.enabled).map(s => s.id);
    onEnabledSkillsChange?.(enabledIds);
    // Try to persist to backend (non-blocking, ok if it fails)
    toggleSkill(skill.id, newEnabled);
  };

  const enabledCount = (skills || []).filter(s => s.enabled).length;

  return (
    <div className={styles.container}>
      {/* Main skills button - matches providerButton style */}
      <button
        ref={buttonRef}
        className={`${styles.skillsButton} ${enabledCount > 0 ? styles.hasActive : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPopup((prev) => !prev);
        }}
        title="Skills"
        type="button"
      >
        <SkillsIcon />
      </button>

      {/* Skills popup - matches providerDropdown/stickerPanel */}
      {showPopup && typeof document !== 'undefined' && createPortal(
        <div
          ref={popupRef}
          className={styles.popup}
          style={popupStyle || undefined}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.popupHeader}>
            <h3 className={styles.popupTitle}>Skills</h3>
            <span className={styles.popupSubtitle}>
              {enabledCount > 0 ? `${enabledCount} active` : 'Toggle skills for this chat'}
            </span>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading skills...</div>
          ) : (
            <div className={styles.skillsList}>
              {(skills || []).map(skill => (
                <div
                  key={skill.id}
                  className={`${styles.skillCard} ${skill.enabled ? styles.enabled : ''}`}
                >
                  <div className={styles.skillIcon}>
                    {SKILL_ICONS[skill.icon] || <span className={styles.iconFallback}>{skill.icon?.[0]?.toUpperCase()}</span>}
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
              {skills.length === 0 && !loading && (
                <div className={styles.loading}>No skills available</div>
              )}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default SkillsToolbar;
