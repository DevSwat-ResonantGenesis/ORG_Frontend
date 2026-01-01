import { listAgentTeams, type AgentTeam } from '@/api/agentTeams';
import { logger } from '@/utils/logger';
import React, { useEffect, useState } from 'react';
import styles from './TeamSelector.module.css';

interface TeamSelectorProps {
    selectedTeamId: string | null;
    onSelectTeam: (teamId: string | null) => void;
    agentMode: boolean;
    className?: string;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
    selectedTeamId,
    onSelectTeam,
    agentMode,
    className = ''
}) => {
    const [teams, setTeams] = useState<AgentTeam[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (agentMode) {
            loadTeams();
        }
    }, [agentMode]);

    const loadTeams = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await listAgentTeams();
            // Handle both array response and object with teams property
            const teamsData = Array.isArray(response) ? response : ((response as any).teams || []);
            setTeams(teamsData);
        } catch (err) {
            logger.error('Failed to load teams', err);
            setError('Failed to load teams');
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    if (!agentMode) {
        return null;
    }

    const currentTeam = teams.find(t => t.id === selectedTeamId);

    return (
        <div className={`${styles.teamSelector} ${className}`}>
            <label className={styles.label}>
                <span className={styles.labelText}>Team:</span>
                <select
                    className={styles.select}
                    value={selectedTeamId || ''}
                    onChange={(e) => onSelectTeam(e.target.value || null)}
                    disabled={loading}
                    title="Select a team for multi-agent collaboration"
                >
                    <option value="">No Team (Individual Agent)</option>
                    {loading && <option value="">Loading teams...</option>}
                    {error && <option value="">Error loading teams</option>}
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>
                            👥 {team.name} - {team.description || 'No description'}
                        </option>
                    ))}
                </select>
            </label>

            {/* Visual indicator of selected team */}
            {currentTeam && (
                <div className={styles.selectedIndicator}>
                    <span className={styles.teamIcon}>👥</span>
                    <div className={styles.teamInfo}>
                        <span className={styles.teamName}>{currentTeam.name}</span>
                        {currentTeam.description && (
                            <span className={styles.teamDescription}>{currentTeam.description}</span>
                        )}
                    </div>
                </div>
            )}

            {/* Refresh button */}
            <button
                className={styles.refreshButton}
                onClick={loadTeams}
                disabled={loading}
                title="Refresh teams"
            >
                {loading ? '⟳' : '↻'}
            </button>
        </div>
    );
};

export default TeamSelector;
