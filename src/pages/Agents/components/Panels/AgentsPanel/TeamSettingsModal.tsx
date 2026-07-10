import React from 'react';
import Modal from '../../../../../components/shared/Modal';
import { Icons } from '../../shared/Icons';
import type { Agent } from '../../../../../types';
import type { AgentTeam } from '../../../../../api/agentTeams';
import styles from './AgentsPanel.module.css';

// ============== TEAM SETTINGS MODAL ==============
// Team-level configuration — distinct from a per-agent settings panel:
// workflow type, the team prompt (instructions for how members should
// collaborate), and member management. Not agent model/tools/temperature.

interface TeamSettingsModalProps {
  team: AgentTeam | null;
  memberIds: string[];
  agents: Agent[];
  onClose: () => void;
  onSave: () => void;
  onRemoveMember: (agentId: string) => void;
  onDelete: () => void;
  formName: string; setFormName: (v: string) => void;
  formDescription: string; setFormDescription: (v: string) => void;
  formType: 'parallel' | 'sequential'; setFormType: (v: 'parallel' | 'sequential') => void;
  formPrompt: string; setFormPrompt: (v: string) => void;
  saving: boolean;
  runGoal: string; setRunGoal: (v: string) => void;
  onRun: () => void;
  running: boolean;
  runStatus: any;
}

export const TeamSettingsModal: React.FC<TeamSettingsModalProps> = ({
  team, memberIds, agents, onClose, onSave, onRemoveMember, onDelete,
  formName, setFormName, formDescription, setFormDescription,
  formType, setFormType, formPrompt, setFormPrompt, saving,
  runGoal, setRunGoal, onRun, running, runStatus,
}) => {
  if (!team) return null;

  const agentName = (agentId: string) => agents.find((a) => a.id === agentId)?.name || agentId.slice(0, 8);

  return (
    <Modal open={!!team} onClose={onClose} size="medium">
      <div className={styles.teamModalHeader}>
        <h3><Icons.Users /> Team Settings</h3>
        <button className={styles.modalCloseBtn} onClick={onClose} title="Close"><Icons.X /></button>
      </div>

      <div className={styles.teamModalBody}>
        <label className={styles.teamModalLabel}>Name</label>
        <input className={styles.teamModalInput} value={formName} onChange={(e) => setFormName(e.target.value)} />

        <label className={styles.teamModalLabel}>Description</label>
        <textarea className={styles.teamModalTextarea} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />

        <label className={styles.teamModalLabel}>Workflow type</label>
        <select className={styles.teamModalInput} value={formType} onChange={(e) => setFormType(e.target.value as 'parallel' | 'sequential')}>
          <option value="parallel">Parallel — every member runs concurrently on the same goal</option>
          <option value="sequential">Sequential — each member's output feeds the next</option>
        </select>

        <label className={styles.teamModalLabel}>Team prompt</label>
        <div className={styles.teamModalHint}>
          Instructions for how the agents inside this team should collaborate — tone, role split,
          constraints. Folded into every member's goal when the team runs.
        </div>
        <textarea
          className={styles.teamModalTextarea}
          style={{ minHeight: 90 }}
          placeholder="e.g. Member A writes a first draft, Member B critiques it for accuracy and tone..."
          value={formPrompt}
          onChange={(e) => setFormPrompt(e.target.value)}
        />

        <label className={styles.teamModalLabel}>Members ({memberIds.length})</label>
        <div className={styles.teamModalMembers}>
          {memberIds.map((agentId) => (
            <span key={agentId} className={styles.teamModalMemberChip}>
              {agentName(agentId)}
              <button type="button" onClick={() => onRemoveMember(agentId)} title="Remove from team">
                <Icons.X />
              </button>
            </span>
          ))}
          {memberIds.length === 0 && <span className={styles.teamModalHint}>No members — drag an agent card onto this team's card to add one.</span>}
        </div>

        <div className={styles.teamModalActions}>
          <button className={styles.teamModalSaveBtn} onClick={onSave} disabled={saving || !formName.trim()}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button className={styles.teamModalDeleteBtn} onClick={onDelete}>
            <Icons.Trash /> Delete Team
          </button>
        </div>

        <div className={styles.teamModalRunSection}>
          <label className={styles.teamModalLabel}>Run this team</label>
          <textarea
            className={styles.teamModalTextarea}
            placeholder="What should this team do?"
            value={runGoal}
            onChange={(e) => setRunGoal(e.target.value)}
          />
          <button className={styles.teamModalSaveBtn} onClick={onRun} disabled={running || !runGoal.trim()}>
            {running ? 'Running...' : <><Icons.Play /> Run</>}
          </button>

          {runStatus && (
            <div className={styles.teamModalRunResult}>
              <div className={styles.teamModalRunStatus}>{runStatus.status}</div>
              {runStatus.error && <div className={styles.teamModalRunError}>{runStatus.error}</div>}
              {runStatus.result && (
                <pre className={styles.teamModalRunOutput}>
                  {typeof runStatus.result === 'string'
                    ? runStatus.result
                    : (runStatus.result.combined_output || runStatus.result.final_output || JSON.stringify(runStatus.result, null, 2))}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TeamSettingsModal;
