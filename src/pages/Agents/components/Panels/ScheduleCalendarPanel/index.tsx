import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { useAgentStore, selectAgents } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import { listSchedules, createSchedule, deleteSchedule } from '../../../../../api/agents';
import type { ScheduleResponse, ScheduleCreateRequest } from '../../../../../api/agents';
import type { Agent } from '../../../../../types';
import { useToastContext } from '../../../../../context/ToastContext';
import styles from './ScheduleCalendarPanel.module.css';

// ============== SCHEDULE CALENDAR PANEL ==============

interface AgentScheduleEntry {
  schedule: ScheduleResponse;
  agent: Agent;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const QUICK_PRESETS = [
  { id: 'every_5m', label: 'Every 5 min', cron: '', interval: 300 },
  { id: 'every_30m', label: 'Every 30 min', cron: '', interval: 1800 },
  { id: 'hourly', label: 'Hourly', cron: '0 * * * *', interval: 0 },
  { id: 'daily', label: 'Daily midnight', cron: '0 0 * * *', interval: 0 },
  { id: 'daily_9am', label: 'Daily 9 AM', cron: '0 9 * * *', interval: 0 },
  { id: 'weekly_mon', label: 'Weekly Mon', cron: '0 9 * * 1', interval: 0 },
  { id: 'weekly_fri', label: 'Weekly Fri', cron: '0 9 * * 5', interval: 0 },
  { id: 'monthly', label: 'Monthly 1st', cron: '0 0 1 * *', interval: 0 },
];

const ScheduleCalendarPanelComponent: React.FC = () => {
  const agents = useAgentStore(selectAgents);
  const toast = useToastContext();

  const [allSchedules, setAllSchedules] = useState<AgentScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');

  // Schedule creation form
  const [showForm, setShowForm] = useState(false);
  const [formAgentId, setFormAgentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formGoal, setFormGoal] = useState('');
  const [formPreset, setFormPreset] = useState('daily');
  const [formCustomCron, setFormCustomCron] = useState('');
  const [creating, setCreating] = useState(false);

  // Load all schedules from all agents
  const loadAllSchedules = useCallback(async () => {
    setLoading(true);
    const entries: AgentScheduleEntry[] = [];
    const results = await Promise.allSettled(
      agents.filter((a: Agent) => a.persisted).map(async (agent: Agent) => {
        const schedules = await listSchedules(agent.id);
        return { agent, schedules };
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled') {
        for (const s of r.value.schedules) {
          entries.push({ schedule: s, agent: r.value.agent });
        }
      }
    }
    setAllSchedules(entries);
    setLoading(false);
  }, [agents]);

  useEffect(() => { loadAllSchedules(); }, [loadAllSchedules]);

  // Calendar generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [year, month]);

  const today = new Date();
  const isToday = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  const isSameDay = (a: Date, b: Date) => a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  // Map schedules to dates based on next_run_at and cron pattern
  const schedulesForDate = useCallback((date: Date): AgentScheduleEntry[] => {
    return allSchedules.filter(entry => {
      const s = entry.schedule;
      if (!s.enabled) return false;

      // If next_run_at matches this date
      if (s.next_run_at) {
        const nextRun = new Date(s.next_run_at);
        if (isSameDay(nextRun, date)) return true;
      }

      // If last_run_at matches this date
      if (s.last_run_at) {
        const lastRun = new Date(s.last_run_at);
        if (isSameDay(lastRun, date)) return true;
      }

      // Cron-based: show on matching days
      if (s.cron_expression) {
        const parts = s.cron_expression.split(' ');
        if (parts.length >= 5) {
          const [, , dayOfMonth, cronMonth, dayOfWeek] = parts;
          const d = date.getDay();
          const dm = date.getDate();
          const m = date.getMonth() + 1;

          // Daily (0 * * * * or 0 0 * * *)
          if (dayOfMonth === '*' && cronMonth === '*' && dayOfWeek === '*') return true;

          // Weekly — specific day of week
          if (dayOfMonth === '*' && cronMonth === '*' && dayOfWeek !== '*') {
            return d === parseInt(dayOfWeek);
          }

          // Monthly — specific day of month
          if (dayOfMonth !== '*' && cronMonth === '*') {
            return dm === parseInt(dayOfMonth);
          }
        }
      }

      // Interval-based: show every day if interval <= 1 day
      if (s.interval_seconds && s.interval_seconds <= 86400) return true;

      return false;
    });
  }, [allSchedules]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Create schedule
  const handleCreate = useCallback(async () => {
    if (!formAgentId || !formGoal.trim()) {
      toast.error('Select an agent and provide a goal');
      return;
    }
    setCreating(true);
    try {
      const preset = QUICK_PRESETS.find(p => p.id === formPreset);
      const data: ScheduleCreateRequest = {
        name: formName.trim() || `${formGoal.trim().slice(0, 30)} schedule`,
        goal: formGoal.trim(),
        cron_expression: formPreset === 'custom' ? formCustomCron : (preset?.cron || undefined),
        interval_seconds: preset?.interval || undefined,
      };
      await createSchedule(formAgentId, data);
      toast.success('Schedule created');
      setShowForm(false);
      setFormAgentId('');
      setFormName('');
      setFormGoal('');
      setFormPreset('daily');
      setFormCustomCron('');
      loadAllSchedules();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create schedule');
    } finally {
      setCreating(false);
    }
  }, [formAgentId, formName, formGoal, formPreset, formCustomCron, toast, loadAllSchedules]);

  // Delete schedule
  const handleDelete = useCallback(async (scheduleId: string) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await deleteSchedule(scheduleId);
      toast.success('Schedule deleted');
      loadAllSchedules();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete');
    }
  }, [toast, loadAllSchedules]);

  // Color assignment per agent (cycle through brand colors)
  const AGENT_COLORS = ['#FA547C', '#01A6BC', '#71C23E', '#FAA525', '#FFD800'];
  const agentColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const uniqueAgents = [...new Set(allSchedules.map(e => e.agent.id))];
    uniqueAgents.forEach((id, i) => { map[id] = AGENT_COLORS[i % AGENT_COLORS.length]; });
    return map;
  }, [allSchedules]);

  // Selected date schedules
  const selectedSchedules = selectedDate ? schedulesForDate(selectedDate) : [];

  // Week view: 7 days from start of current week
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Icons.Calendar />
          <h3>Agent Schedules</h3>
          <span className={styles.badge}>{allSchedules.length}</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.viewToggle}>
            {(['month', 'week', 'list'] as const).map(v => (
              <button key={v} className={`${styles.viewBtn} ${view === v ? styles.viewBtnActive : ''}`} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <Icons.Plus /> Schedule
          </button>
        </div>
      </div>

      {/* Month nav */}
      {view !== 'list' && (
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={prevMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className={styles.todayBtn} onClick={goToday}>Today</button>
          <span className={styles.monthLabel}>{MONTHS[month]} {year}</span>
          <button className={styles.navBtn} onClick={nextMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          <Icons.Refresh />
          <span>Loading schedules...</span>
        </div>
      ) : (
        <>
          {/* MONTH VIEW */}
          {view === 'month' && (
            <div className={styles.calendarGrid}>
              {DAYS.map(d => <div key={d} className={styles.dayHeader}>{d}</div>)}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`${styles.dayCell} ${day ? '' : styles.empty} ${day && isToday(day) ? styles.today : ''} ${day && selectedDate && isSameDay(day, selectedDate) ? styles.selected : ''}`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <span className={styles.dayNumber}>{day.getDate()}</span>
                      <div className={styles.dayDots}>
                        {schedulesForDate(day).slice(0, 4).map((entry, j) => (
                          <span
                            key={j}
                            className={styles.dot}
                            style={{ background: agentColorMap[entry.agent.id] || '#FA547C' }}
                            title={`${entry.agent.name}: ${entry.schedule.name}`}
                          />
                        ))}
                        {schedulesForDate(day).length > 4 && (
                          <span className={styles.dotMore}>+{schedulesForDate(day).length - 4}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* WEEK VIEW */}
          {view === 'week' && (
            <div className={styles.weekGrid}>
              {weekDays.map((day, i) => {
                const daySchedules = schedulesForDate(day);
                return (
                  <div key={i} className={`${styles.weekDay} ${isToday(day) ? styles.weekToday : ''}`}>
                    <div className={styles.weekDayHeader}>
                      <span className={styles.weekDayName}>{DAYS[day.getDay()]}</span>
                      <span className={styles.weekDayNum}>{day.getDate()}</span>
                    </div>
                    <div className={styles.weekDayContent}>
                      {daySchedules.map((entry, j) => (
                        <div
                          key={j}
                          className={styles.weekEvent}
                          style={{ borderLeftColor: agentColorMap[entry.agent.id] || '#FA547C' }}
                          onClick={() => setSelectedDate(day)}
                        >
                          <span className={styles.weekEventAgent}>{entry.agent.name}</span>
                          <span className={styles.weekEventName}>{entry.schedule.name}</span>
                        </div>
                      ))}
                      {daySchedules.length === 0 && <div className={styles.weekEmpty}>No runs</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {view === 'list' && (
            <div className={styles.listView}>
              {allSchedules.length === 0 ? (
                <div className={styles.emptyState}>
                  <Icons.Calendar />
                  <p>No scheduled agents</p>
                  <p className={styles.emptyHint}>Create a schedule to automate agent execution</p>
                </div>
              ) : (
                allSchedules.map((entry, i) => (
                  <div key={i} className={styles.listCard}>
                    <div className={styles.listCardColor} style={{ background: agentColorMap[entry.agent.id] || '#FA547C' }} />
                    <div className={styles.listCardBody}>
                      <div className={styles.listCardTop}>
                        <span className={styles.listCardAgent}>{entry.agent.name}</span>
                        <span className={`${styles.listCardStatus} ${entry.schedule.enabled ? styles.enabled : styles.disabled}`}>
                          {entry.schedule.enabled ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className={styles.listCardName}>{entry.schedule.name}</div>
                      <div className={styles.listCardGoal}>{entry.schedule.goal}</div>
                      <div className={styles.listCardMeta}>
                        {entry.schedule.cron_expression && (
                          <span className={styles.metaChip}>
                            <Icons.Clock /> {entry.schedule.cron_expression}
                          </span>
                        )}
                        {entry.schedule.interval_seconds && (
                          <span className={styles.metaChip}>
                            <Icons.Clock /> Every {entry.schedule.interval_seconds < 3600 ? `${Math.round(entry.schedule.interval_seconds / 60)}m` : `${Math.round(entry.schedule.interval_seconds / 3600)}h`}
                          </span>
                        )}
                        <span className={styles.metaChip}>Runs: {entry.schedule.run_count}</span>
                        <span className={styles.metaChip} style={{ color: '#71C23E' }}>{entry.schedule.success_count} ok</span>
                        {entry.schedule.failure_count > 0 && (
                          <span className={styles.metaChip} style={{ color: '#FA547C' }}>{entry.schedule.failure_count} fail</span>
                        )}
                        {entry.schedule.next_run_at && (
                          <span className={styles.metaChip}>Next: {new Date(entry.schedule.next_run_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <button className={styles.listCardDelete} onClick={() => handleDelete(entry.schedule.id)} title="Delete schedule">
                      <Icons.Trash />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Selected date detail */}
          {selectedDate && view !== 'list' && (
            <div className={styles.dateDetail}>
              <div className={styles.dateDetailHeader}>
                <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                <button className={styles.closeBtn} onClick={() => setSelectedDate(null)}>
                  <Icons.X />
                </button>
              </div>
              {selectedSchedules.length === 0 ? (
                <div className={styles.dateEmpty}>
                  <p>No scheduled runs on this day</p>
                  <button className={styles.addBtn} onClick={() => setShowForm(true)}>
                    <Icons.Plus /> Add Schedule
                  </button>
                </div>
              ) : (
                <div className={styles.dateList}>
                  {selectedSchedules.map((entry, i) => (
                    <div key={i} className={styles.dateCard}>
                      <div className={styles.dateCardDot} style={{ background: agentColorMap[entry.agent.id] || '#FA547C' }} />
                      <div className={styles.dateCardBody}>
                        <span className={styles.dateCardAgent}>{entry.agent.name}</span>
                        <span className={styles.dateCardName}>{entry.schedule.name}</span>
                        <span className={styles.dateCardGoal}>{entry.schedule.goal}</span>
                      </div>
                      <button className={styles.dateCardDelete} onClick={() => handleDelete(entry.schedule.id)} title="Delete">
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Schedule Form Overlay */}
      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <Icons.Plus />
              <span>Schedule Agent</span>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <Icons.X />
              </button>
            </div>

            <div className={styles.formBody}>
              <div className={styles.formGroup}>
                <label>Agent</label>
                <select value={formAgentId} onChange={e => setFormAgentId(e.target.value)} className={styles.formSelect}>
                  <option value="">Select agent...</option>
                  {agents.filter((a: Agent) => a.persisted).map((a: Agent) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Schedule Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Daily report check"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Goal / Task</label>
                <textarea
                  value={formGoal}
                  onChange={e => setFormGoal(e.target.value)}
                  placeholder="What should the agent do each time it runs?"
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Frequency</label>
                <div className={styles.presetGrid}>
                  {QUICK_PRESETS.map(p => (
                    <button
                      key={p.id}
                      className={`${styles.presetBtn} ${formPreset === p.id ? styles.presetActive : ''}`}
                      onClick={() => setFormPreset(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    className={`${styles.presetBtn} ${formPreset === 'custom' ? styles.presetActive : ''}`}
                    onClick={() => setFormPreset('custom')}
                  >
                    Custom
                  </button>
                </div>
                {formPreset === 'custom' && (
                  <input
                    type="text"
                    value={formCustomCron}
                    onChange={e => setFormCustomCron(e.target.value)}
                    placeholder="Cron: * * * * * (min hour day month weekday)"
                    className={styles.formInput}
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            </div>

            <div className={styles.formFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button className={styles.createBtn} onClick={handleCreate} disabled={creating || !formAgentId || !formGoal.trim()}>
                {creating ? 'Creating...' : 'Create Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ScheduleCalendarPanel = memo(ScheduleCalendarPanelComponent);
export default ScheduleCalendarPanel;
