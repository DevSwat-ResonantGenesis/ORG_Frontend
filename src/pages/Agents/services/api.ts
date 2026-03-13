// ============== AGENTOS API SERVICE ==============
// Centralized API client for all AgentOS panels

import fastapiClient from '../../../api/fastapiClient';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

class AgentOSApi {
  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    
    try {
      const response = await fastapiClient.request<T>({
        url: endpoint,
        method: method as any,
        headers,
        data: body,
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ============== AGENTS ==============
  async getAgents() {
    return this.request('/api/v1/agents');
  }

  async getAgent(id: string) {
    return this.request(`/api/v1/agents/${id}`);
  }

  async createAgent(data: unknown) {
    return this.request('/api/v1/agents', { method: 'POST', body: data });
  }

  async updateAgent(id: string, data: unknown) {
    return this.request(`/api/v1/agents/${id}`, { method: 'PUT', body: data });
  }

  async deleteAgent(id: string) {
    return this.request(`/api/v1/agents/${id}`, { method: 'DELETE' });
  }

  async startAgent(id: string) {
    return this.request(`/api/v1/agents/${id}/start`, { method: 'POST' });
  }

  async stopAgent(id: string) {
    return this.request(`/api/v1/agents/${id}/stop`, { method: 'POST' });
  }

  async pauseAgent(id: string) {
    return this.request(`/api/v1/agents/${id}/pause`, { method: 'POST' });
  }

  async resumeAgent(id: string) {
    return this.request(`/api/v1/agents/${id}/resume`, { method: 'POST' });
  }

  // ============== WORKFLOWS ==============
  async getWorkflows() {
    return this.request('/api/v1/workflows');
  }

  async getWorkflow(id: string) {
    return this.request(`/api/v1/workflows/${id}`);
  }

  async createWorkflow(data: unknown) {
    return this.request('/api/v1/workflows', { method: 'POST', body: data });
  }

  async updateWorkflow(id: string, data: unknown) {
    return this.request(`/api/v1/workflows/${id}`, { method: 'PUT', body: data });
  }

  async deleteWorkflow(id: string) {
    return this.request(`/api/v1/workflows/${id}`, { method: 'DELETE' });
  }

  async publishWorkflow(id: string) {
    return this.request(`/api/v1/workflows/${id}/publish`, { method: 'POST' });
  }

  async executeWorkflow(id: string, input?: unknown) {
    return this.request(`/api/v1/workflows/${id}/execute`, { method: 'POST', body: input });
  }

  // ============== EXECUTIONS ==============
  async getExecutions(agentId?: string) {
    const query = agentId ? `?agentId=${agentId}` : '';
    return this.request(`/api/v1/executions${query}`);
  }

  async getExecution(id: string) {
    return this.request(`/api/v1/executions/${id}`);
  }

  async cancelExecution(id: string) {
    return this.request(`/api/v1/executions/${id}/cancel`, { method: 'POST' });
  }

  // ============== ECONOMY ==============
  async getWallet() {
    return this.request('/api/v1/economy/wallet');
  }

  async getTransactions(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/api/v1/economy/transactions${query}`);
  }

  async deposit(amount: number) {
    return this.request('/api/v1/economy/deposit', { method: 'POST', body: { amount } });
  }

  async withdraw(amount: number) {
    return this.request('/api/v1/economy/withdraw', { method: 'POST', body: { amount } });
  }

  async stake(agentId: string, amount: number) {
    return this.request('/api/v1/economy/stake', { method: 'POST', body: { agentId, amount } });
  }

  // ============== AUDIT ==============
  async getAuditEntries(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/api/v1/audit/entries${query}`);
  }

  async getAlerts() {
    return this.request('/api/v1/audit/alerts');
  }

  async acknowledgeAlert(id: string) {
    return this.request(`/api/v1/audit/alerts/${id}/acknowledge`, { method: 'POST' });
  }

  async getForensicCases() {
    return this.request('/api/v1/audit/cases');
  }

  async resolveCase(id: string) {
    return this.request(`/api/v1/audit/cases/${id}/resolve`, { method: 'POST' });
  }

  async getComplianceReports() {
    return this.request('/api/v1/audit/compliance');
  }

  // ============== GOVERNANCE ==============
  async getPolicies() {
    return this.request('/api/v1/governance/policies');
  }

  async createPolicy(data: unknown) {
    return this.request('/api/v1/governance/policies', { method: 'POST', body: data });
  }

  async updatePolicy(id: string, data: unknown) {
    return this.request(`/api/v1/governance/policies/${id}`, { method: 'PUT', body: data });
  }

  async getPendingApprovals() {
    return this.request('/api/v1/governance/approvals');
  }

  async approveRequest(id: string) {
    return this.request(`/api/v1/governance/approvals/${id}/approve`, { method: 'POST' });
  }

  async rejectRequest(id: string, reason?: string) {
    return this.request(`/api/v1/governance/approvals/${id}/reject`, { method: 'POST', body: { reason } });
  }

  // ============== MEMORY ==============
  async getMemories(agentId: string, type?: string) {
    const query = type ? `?type=${type}` : '';
    return this.request(`/api/v1/agents/${agentId}/memory${query}`);
  }

  async deleteMemory(agentId: string, memoryId: string) {
    return this.request(`/api/v1/agents/${agentId}/memory/${memoryId}`, { method: 'DELETE' });
  }

  async clearMemory(agentId: string, type?: string) {
    return this.request(`/api/v1/agents/${agentId}/memory/clear`, { method: 'POST', body: { type } });
  }

  // ============== CHAT ==============
  async sendMessage(agentId: string, message: string) {
    return this.request(`/api/v1/agents/${agentId}/chat`, { method: 'POST', body: { message } });
  }

  async getChatHistory(agentId: string, limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/api/v1/agents/${agentId}/chat/history${query}`);
  }

  // ============== DEVELOPER ==============
  async generateApiKey(name: string, scopes: string[]) {
    return this.request('/api/v1/developer/keys', { method: 'POST', body: { name, scopes } });
  }

  async getApiKeys() {
    return this.request('/api/v1/developer/keys');
  }

  async revokeApiKey(id: string) {
    return this.request(`/api/v1/developer/keys/${id}`, { method: 'DELETE' });
  }

  async setWebhook(url: string, events: string[]) {
    return this.request('/api/v1/developer/webhooks', { method: 'POST', body: { url, events } });
  }

  // ============== COMPLIANCE (P4.1) ==============
  async getComplianceScore() {
    return this.request('/api/v1/agents/compliance/score');
  }

  async getEvidenceChecklist() {
    return this.request('/api/v1/agents/compliance/evidence-checklist');
  }

  async getAuditExport(format: 'json' | 'csv' = 'json', startDate?: string, endDate?: string) {
    const params = new URLSearchParams({ format });
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    return this.request(`/api/v1/agents/compliance/audit-export?${params}`);
  }

  // ============== GOVERNANCE REPORTS ==============
  async getGovernanceAuditTrail(agentId?: string, limit: number = 100) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (agentId) params.set('agent_id', agentId);
    return this.request(`/api/v1/agents/governance/audit-trail?${params}`);
  }

  async getGovernanceComplianceReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    return this.request(`/api/v1/agents/governance/compliance-report${qs ? '?' + qs : ''}`);
  }

  // ============== LEARNING (P2.4) ==============
  async getLearningStats() {
    return this.request('/api/v1/agents/learning/stats');
  }

  async getLearningPatterns() {
    return this.request('/api/v1/agents/learning/patterns');
  }

  // ============== WATCHDOG (P3.4) ==============
  async getWatchdogStatus() {
    return this.request('/api/v1/agents/watchdog/status');
  }

  // ============== TRACE VIEWER (P4.5) ==============
  async getSessionTrace(sessionId: string) {
    return this.request(`/api/v1/agents/sessions/${sessionId}/trace`);
  }

  // ============== METRICS ==============
  async getMetrics() {
    return this.request('/api/v1/metrics');
  }

  async getAgentMetrics(agentId: string) {
    return this.request(`/api/v1/agents/${agentId}/metrics`);
  }

  // ============== HEALTH ==============
  async healthCheck() {
    return this.request('/api/v1/health');
  }
}

export const agentOSApi = new AgentOSApi();
export default agentOSApi;
