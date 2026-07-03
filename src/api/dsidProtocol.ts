/**
 * DSID-P Protocol API Client
 * Comprehensive API for Governance, Semantic, Trust, Compliance, Security, and Scaling
 * 
 * This client provides access to 450+ DSID-P protocol endpoints covering:
 * - Semantic Taxonomy (12 domains, 50+ clusters)
 * - Trust & Reputation (T0-T4 tiers)
 * - Agent Lifecycle (8 states)
 * - Governance & Ethics (7 principles)
 * - Compliance (GDPR, HIPAA, EU AI Act, ISO 42001)
 * - Security (7 layers, threat catalog)
 * - Scaling & Performance
 * - Federation & Interoperability
 * - Business Model & Partnerships
 * - Standards Positioning
 */

import client from './client';

// ============== TYPE DEFINITIONS ==============

// Semantic Types
export interface SemanticDomain {
  domain_id: string;
  name: string;
  description: string;
  cluster_count: number;
}

export interface SemanticCluster {
  cluster_id: string;
  domain: string;
  name: string;
  description: string;
  keywords: string[];
  drift_threshold: number;
}

export interface DriftThreshold {
  level: string;
  threshold: number;
  action: string;
}

export interface EmbeddingConfig {
  dimensions: number;
  model: string;
  normalization: string;
}

// Trust Types
export interface TrustTier {
  tier: string;
  name: string;
  description: string;
  min_score: number;
  max_score: number;
  capabilities: string[];
}

export interface TrustFactor {
  factor_id: string;
  name: string;
  weight: number;
  description: string;
}

export interface DecayConfig {
  base_rate: number;
  half_life_days: number;
  min_score: number;
}

export interface Penalty {
  penalty_id: string;
  name: string;
  severity: string;
  score_impact: number;
  duration_days: number;
}

// Lifecycle Types
export interface LifecycleState {
  state: string;
  name: string;
  description: string;
  allowed_transitions: string[];
}

export interface LifecycleTransition {
  from_state: string;
  to_state: string;
  trigger: string;
  conditions: string[];
}

export interface LifecycleEvent {
  event_type: string;
  description: string;
  logged: boolean;
}

// Governance Types
export interface EthicalPrinciple {
  principle_id: string;
  name: string;
  description: string;
  enforcement: string;
}

export interface OversightBody {
  body_id: string;
  name: string;
  role: string;
  authority: string[];
}

export interface GovernanceContract {
  contract_type: string;
  description: string;
  fields: string[];
}

// Compliance Types
export interface ComplianceFramework {
  framework_id: string;
  name: string;
  jurisdiction: string;
  requirements: string[];
  dsidp_alignment: string;
}

export interface SectorCompliance {
  sector: string;
  frameworks: string[];
  special_requirements: string[];
}

export interface LegalStructure {
  structure_id: string;
  name: string;
  description: string;
  binding_type: string;
}

export interface RiskControl {
  control_id: string;
  name: string;
  description: string;
  implementation: string;
}

// Security Types
export interface SecurityLayer {
  layer: string;
  name: string;
  responsibility: string;
  controls: string[];
}

export interface SecurityThreat {
  threat_id: string;
  name: string;
  category: string;
  severity: string;
  mitigations: string[];
}

export interface SecurityControl {
  control_id: string;
  name: string;
  type: string;
  implementation: string;
}

export interface IncidentResponse {
  step: number;
  name: string;
  actions: string[];
}

export interface HardeningDefault {
  setting: string;
  value: string;
  rationale: string;
}

// Scaling Types
export interface ScalingSurface {
  surface: string;
  name: string;
  requirements: string[];
  engineering_techniques: string[];
  throughput_targets: Record<string, string>;
  latency_targets: Record<string, string>;
}

export interface ThroughputTarget {
  scale: string;
  events_per_second: string;
  description: string;
}

export interface LatencyTarget {
  operation: string;
  target_ms: string;
  description: string;
}

export interface OptimizationStrategy {
  strategy: string;
  name: string;
  description: string;
  implementation: string;
}

export interface HADRConfig {
  high_availability: Record<string, string>;
  disaster_recovery: Record<string, string>;
  recovery_objectives: Record<string, string>;
}

export interface PerformanceBenchmark {
  component: string;
  target: string;
}

// Business Types
export interface RevenueStream {
  stream: string;
  name: string;
  description: string;
  pricing_model: string;
  typical_revenue: string;
}

export interface LicensingTier {
  tier: string;
  name: string;
  scale: string;
  price_range: string;
  includes: string[];
}

export interface UsagePrice {
  operation: string;
  price_per_unit: string;
  unit: string;
}

export interface MarketplaceRate {
  category: string;
  take_rate: string;
  description: string;
}

export interface RevenueProjection {
  period: string;
  revenue: string;
  drivers: string;
}

// Partnership Types
export interface PartnerCategory {
  category_id: string;
  name: string;
  description: string;
  examples: string[];
  value_proposition: string;
}

export interface PartnershipModel {
  model: string;
  name: string;
  description: string;
  example: string;
  revenue_model: string;
}

export interface GovernmentModel {
  model: string;
  name: string;
  description: string;
  stakeholders: string[];
  typical_value: string;
}

export interface TargetIndustry {
  industry_id: string;
  name: string;
  why_dsidp: string;
  key_requirements: string[];
}

// Standards Types
export interface StandardsBodyAlignment {
  body: string;
  name: string;
  relevant_standards: string[];
  dsidp_extensions: string[];
  engagement_strategy: string;
}

export interface StandardsGap {
  gap_id: string;
  name: string;
  description: string;
  existing_coverage: string;
  dsidp_solution: string[];
}

export interface StandardsDomain {
  domain: string;
  name: string;
  description: string;
  dsidp_contribution: string;
}

export interface StandardizationPhase {
  phase: string;
  phase_number: number;
  name: string;
  description: string;
  deliverables: string[];
  target_organizations: string[];
}

// Protocol Types
export interface ProtocolLayer {
  layer: string;
  name: string;
  description: string;
  components: string[];
}

export interface ProtocolSubsystem {
  subsystem: string;
  name: string;
  description: string;
  responsibilities: string[];
}

// Implementation Types
export interface ImplementationStep {
  step_number: number;
  name: string;
  description: string;
  modules: string[];
  duration: string;
}

export interface DeploymentModel {
  model: string;
  name: string;
  description: string;
  scale: string;
  requirements: string[];
}

export interface TechStack {
  category: string;
  technologies: string[];
}

// ============== SEMANTIC TAXONOMY APIs ==============

export const getSemanticDomains = async (): Promise<{ status: string; domains: SemanticDomain[] }> => {
  const res = await client.get('/blockchain/taxonomy/domains');
  return res.data;
};

export const getSemanticClusters = async (): Promise<{ status: string; clusters: SemanticCluster[] }> => {
  const res = await client.get('/blockchain/taxonomy/clusters');
  return res.data;
};

export const getClustersByDomain = async (domain: string): Promise<{ status: string; clusters: SemanticCluster[] }> => {
  const res = await client.get(`/blockchain/taxonomy/domains/${domain}/clusters`);
  return res.data;
};

export const getDriftThresholds = async (): Promise<{ status: string; thresholds: DriftThreshold[] }> => {
  const res = await client.get('/blockchain/taxonomy/drift-thresholds');
  return res.data;
};

export const getEmbeddingConfig = async (): Promise<{ status: string; config: EmbeddingConfig }> => {
  const res = await client.get('/blockchain/taxonomy/embedding-config');
  return res.data;
};

// ============== TRUST & REPUTATION APIs ==============

export const getTrustTiers = async (): Promise<{ status: string; tiers: TrustTier[] }> => {
  const res = await client.get('/blockchain/reputation/tiers');
  return res.data;
};

export const getTrustTier = async (tier: string): Promise<{ status: string; tier: TrustTier }> => {
  const res = await client.get(`/blockchain/reputation/tiers/${tier}`);
  return res.data;
};

export const getTrustFactors = async (): Promise<{ status: string; factors: TrustFactor[] }> => {
  const res = await client.get('/blockchain/reputation/factors');
  return res.data;
};

export const getReputationDecay = async (): Promise<{ status: string; decay: DecayConfig }> => {
  const res = await client.get('/blockchain/reputation/decay');
  return res.data;
};

export const getPenalties = async (): Promise<{ status: string; penalties: Penalty[] }> => {
  const res = await client.get('/blockchain/reputation/penalties');
  return res.data;
};

// ============== AGENT LIFECYCLE APIs ==============

export const getLifecycleStates = async (): Promise<{ status: string; states: LifecycleState[] }> => {
  const res = await client.get('/blockchain/lifecycle/states');
  return res.data;
};

export const getLifecycleState = async (state: string): Promise<{ status: string; state: LifecycleState }> => {
  const res = await client.get(`/blockchain/lifecycle/states/${state}`);
  return res.data;
};

export const getLifecycleTransitions = async (): Promise<{ status: string; transitions: LifecycleTransition[] }> => {
  const res = await client.get('/blockchain/lifecycle/transitions');
  return res.data;
};

export const getLifecycleEvents = async (): Promise<{ status: string; events: LifecycleEvent[] }> => {
  const res = await client.get('/blockchain/lifecycle/events');
  return res.data;
};

// ============== GOVERNANCE & ETHICS APIs ==============

export const getEthicalPrinciples = async (): Promise<{ status: string; principles: EthicalPrinciple[] }> => {
  const res = await client.get('/blockchain/ethics/principles');
  return res.data;
};

export const getOversightBodies = async (): Promise<{ status: string; bodies: OversightBody[] }> => {
  const res = await client.get('/blockchain/ethics/oversight-bodies');
  return res.data;
};

export const getGovernanceContracts = async (): Promise<{ status: string; contracts: GovernanceContract[] }> => {
  const res = await client.get('/blockchain/specification/governance-contracts');
  return res.data;
};

// ============== COMPLIANCE APIs ==============

export const getComplianceFrameworks = async (): Promise<{ status: string; frameworks: ComplianceFramework[] }> => {
  const res = await client.get('/blockchain/compliance/frameworks');
  return res.data;
};

export const getComplianceFramework = async (framework: string): Promise<{ status: string; framework: ComplianceFramework }> => {
  const res = await client.get(`/blockchain/compliance/frameworks/${framework}`);
  return res.data;
};

export const getComplianceSectors = async (): Promise<{ status: string; sectors: SectorCompliance[] }> => {
  const res = await client.get('/blockchain/compliance/sectors');
  return res.data;
};

export const getLegalStructures = async (): Promise<{ status: string; structures: LegalStructure[] }> => {
  const res = await client.get('/blockchain/compliance/legal-structures');
  return res.data;
};

export const getRiskControls = async (): Promise<{ status: string; controls: RiskControl[] }> => {
  const res = await client.get('/blockchain/compliance/risk-controls');
  return res.data;
};

export const getCompliancePrinciples = async (): Promise<{ status: string; principles: string[] }> => {
  const res = await client.get('/blockchain/compliance/principles');
  return res.data;
};

// ============== SECURITY APIs ==============

export const getSecurityLayers = async (): Promise<{ status: string; layers: SecurityLayer[] }> => {
  const res = await client.get('/blockchain/security/layers');
  return res.data;
};

export const getSecurityLayer = async (layer: string): Promise<{ status: string; layer: SecurityLayer }> => {
  const res = await client.get(`/blockchain/security/layers/${layer}`);
  return res.data;
};

export const getSecurityThreats = async (): Promise<{ status: string; threats: SecurityThreat[] }> => {
  const res = await client.get('/blockchain/security/threats');
  return res.data;
};

export const getSecurityControls = async (): Promise<{ status: string; controls: SecurityControl[] }> => {
  const res = await client.get('/blockchain/security/controls');
  return res.data;
};

export const getIncidentResponse = async (): Promise<{ status: string; procedure: IncidentResponse[] }> => {
  const res = await client.get('/blockchain/security/incident-response');
  return res.data;
};

export const getHardeningDefaults = async (): Promise<{ status: string; defaults: HardeningDefault[] }> => {
  const res = await client.get('/blockchain/security/hardening');
  return res.data;
};

export const getSupervisorCapabilities = async (): Promise<{ status: string; capabilities: string[] }> => {
  const res = await client.get('/blockchain/security/supervisor-capabilities');
  return res.data;
};

// ============== SCALING & PERFORMANCE APIs ==============

export const getScalingSurfaces = async (): Promise<{ status: string; surfaces: ScalingSurface[] }> => {
  const res = await client.get('/blockchain/scaling/surfaces');
  return res.data;
};

export const getScalingSurface = async (surface: string): Promise<{ status: string; surface: ScalingSurface }> => {
  const res = await client.get(`/blockchain/scaling/surfaces/${surface}`);
  return res.data;
};

export const getThroughputTargets = async (): Promise<{ status: string; targets: ThroughputTarget[] }> => {
  const res = await client.get('/blockchain/scaling/throughput-targets');
  return res.data;
};

export const getLatencyTargets = async (): Promise<{ status: string; targets: LatencyTarget[] }> => {
  const res = await client.get('/blockchain/scaling/latency-targets');
  return res.data;
};

export const getOptimizationStrategies = async (): Promise<{ status: string; strategies: OptimizationStrategy[] }> => {
  const res = await client.get('/blockchain/scaling/optimization-strategies');
  return res.data;
};

export const getHADRArchitecture = async (): Promise<{ status: string; architecture: HADRConfig }> => {
  const res = await client.get('/blockchain/scaling/ha-dr');
  return res.data;
};

export const getNationalBlueprint = async (): Promise<{ status: string; blueprint: Record<string, unknown> }> => {
  const res = await client.get('/blockchain/scaling/national-blueprint');
  return res.data;
};

export const getPerformanceBenchmarks = async (): Promise<{ status: string; benchmarks: PerformanceBenchmark[] }> => {
  const res = await client.get('/blockchain/scaling/benchmarks');
  return res.data;
};

export const getCapacityPlanning = async (): Promise<{ status: string; metrics: string[]; forecasts: string[] }> => {
  const res = await client.get('/blockchain/scaling/capacity-planning');
  return res.data;
};

// ============== COMMERCIALIZATION APIs ==============

export const getRevenueStreams = async (): Promise<{ status: string; streams: RevenueStream[] }> => {
  const res = await client.get('/blockchain/commercialization/revenue-streams');
  return res.data;
};

export const getLicensingTiers = async (): Promise<{ status: string; tiers: LicensingTier[] }> => {
  const res = await client.get('/blockchain/commercialization/licensing-tiers');
  return res.data;
};

export const getUsagePricing = async (): Promise<{ status: string; prices: UsagePrice[] }> => {
  const res = await client.get('/blockchain/commercialization/usage-pricing');
  return res.data;
};

export const getMarketplaceRates = async (): Promise<{ status: string; rates: MarketplaceRate[] }> => {
  const res = await client.get('/blockchain/commercialization/marketplace-rates');
  return res.data;
};

export const getEnterpriseSolutions = async (): Promise<{ status: string; solutions: Record<string, unknown>[] }> => {
  const res = await client.get('/blockchain/commercialization/enterprise-solutions');
  return res.data;
};

export const getGovernmentPricing = async (): Promise<{ status: string; pricing: Record<string, unknown>[] }> => {
  const res = await client.get('/blockchain/commercialization/government-pricing');
  return res.data;
};

export const getEconomicFlywheel = async (): Promise<{ status: string; flywheel: string[]; comparisons: string[] }> => {
  const res = await client.get('/blockchain/commercialization/flywheel');
  return res.data;
};

export const getMarketPositioning = async (): Promise<{ status: string; positioning: Record<string, unknown> }> => {
  const res = await client.get('/blockchain/commercialization/positioning');
  return res.data;
};

export const getPricingStrategy = async (): Promise<{ status: string; strategy: Record<string, unknown>[] }> => {
  const res = await client.get('/blockchain/commercialization/pricing-strategy');
  return res.data;
};

export const getCustomerAcquisition = async (): Promise<{ status: string; acquisition: Record<string, string[]> }> => {
  const res = await client.get('/blockchain/commercialization/customer-acquisition');
  return res.data;
};

export const getRevenueProjections = async (): Promise<{ status: string; projections: RevenueProjection[] }> => {
  const res = await client.get('/blockchain/commercialization/revenue-projections');
  return res.data;
};

// ============== PARTNERSHIPS APIs ==============

export const getPartnerCategories = async (): Promise<{ status: string; categories: PartnerCategory[] }> => {
  const res = await client.get('/blockchain/partnerships/categories');
  return res.data;
};

export const getPartnershipModels = async (): Promise<{ status: string; models: PartnershipModel[] }> => {
  const res = await client.get('/blockchain/partnerships/models');
  return res.data;
};

export const getGovernmentModels = async (): Promise<{ status: string; models: GovernmentModel[] }> => {
  const res = await client.get('/blockchain/partnerships/government-models');
  return res.data;
};

export const getTargetIndustries = async (): Promise<{ status: string; industries: TargetIndustry[] }> => {
  const res = await client.get('/blockchain/partnerships/target-industries');
  return res.data;
};

export const getEnterpriseFlywheel = async (): Promise<{ status: string; flywheel: string[] }> => {
  const res = await client.get('/blockchain/partnerships/flywheel');
  return res.data;
};

export const getDeveloperEcosystem = async (): Promise<{ status: string; requirements: string[]; community_initiatives: string[] }> => {
  const res = await client.get('/blockchain/partnerships/developer-ecosystem');
  return res.data;
};

export const getInternationalAlliances = async (): Promise<{ status: string; alliances: string[] }> => {
  const res = await client.get('/blockchain/partnerships/international-alliances');
  return res.data;
};

export const getQualificationCriteria = async (): Promise<{ status: string; criteria: string[] }> => {
  const res = await client.get('/blockchain/partnerships/qualification-criteria');
  return res.data;
};

export const getEcosystemRisks = async (): Promise<{ status: string; risks: Record<string, string>[] }> => {
  const res = await client.get('/blockchain/partnerships/risks');
  return res.data;
};

export const getExpansionTimeline = async (): Promise<{ status: string; timeline: Record<string, unknown> }> => {
  const res = await client.get('/blockchain/partnerships/expansion-timeline');
  return res.data;
};

// ============== STANDARDS POSITIONING APIs ==============

export const getStandardsBodyAlignments = async (): Promise<{ status: string; alignments: StandardsBodyAlignment[] }> => {
  const res = await client.get('/blockchain/standards/body-alignments');
  return res.data;
};

export const getStandardsGaps = async (): Promise<{ status: string; gaps: StandardsGap[] }> => {
  const res = await client.get('/blockchain/standards/gaps');
  return res.data;
};

export const getStandardsDomains = async (): Promise<{ status: string; domains: StandardsDomain[] }> => {
  const res = await client.get('/blockchain/standards/domains');
  return res.data;
};

export const getStandardizationPhases = async (): Promise<{ status: string; phases: StandardizationPhase[] }> => {
  const res = await client.get('/blockchain/standards/phases');
  return res.data;
};

export const getProtocolClass = async (): Promise<{ status: string; protocol_class: Record<string, unknown> }> => {
  const res = await client.get('/blockchain/standards/protocol-class');
  return res.data;
};

export const getGlobalAdoptionMap = async (): Promise<{ status: string; adoption_map: Record<string, string[]> }> => {
  const res = await client.get('/blockchain/standards/adoption-map');
  return res.data;
};

export const getStandardizationMessages = async (): Promise<{ status: string; messages: string[] }> => {
  const res = await client.get('/blockchain/standards/key-messages');
  return res.data;
};

// ============== PROTOCOL SPECIFICATION APIs ==============

export const getProtocolOverview = async (): Promise<{ status: string; overview: Record<string, unknown> }> => {
  const res = await client.get('/blockchain/specification/overview');
  return res.data;
};

export const getProtocolLayers = async (): Promise<{ status: string; layers: ProtocolLayer[] }> => {
  const res = await client.get('/blockchain/specification/layers');
  return res.data;
};

export const getProtocolLayer = async (layer: string): Promise<{ status: string; layer: ProtocolLayer }> => {
  const res = await client.get(`/blockchain/specification/layers/${layer}`);
  return res.data;
};

export const getProtocolSubsystems = async (): Promise<{ status: string; subsystems: ProtocolSubsystem[] }> => {
  const res = await client.get('/blockchain/specification/subsystems');
  return res.data;
};

export const getConformanceRequirements = async (): Promise<{ status: string; requirements: Record<string, unknown>[] }> => {
  const res = await client.get('/blockchain/specification/conformance');
  return res.data;
};

export const getProtocolGlossary = async (): Promise<{ status: string; glossary: Record<string, string> }> => {
  const res = await client.get('/blockchain/specification/glossary');
  return res.data;
};

// ============== IMPLEMENTATION GUIDE APIs ==============

export const getImplementationSteps = async (): Promise<{ status: string; steps: ImplementationStep[] }> => {
  const res = await client.get('/blockchain/implementation/steps');
  return res.data;
};

export const getImplementationStep = async (step: number): Promise<{ status: string; step: ImplementationStep }> => {
  const res = await client.get(`/blockchain/implementation/steps/${step}`);
  return res.data;
};

export const getDeploymentModels = async (): Promise<{ status: string; models: DeploymentModel[] }> => {
  const res = await client.get('/blockchain/implementation/deployment-models');
  return res.data;
};

export const getTechStack = async (): Promise<{ status: string; stack: TechStack[] }> => {
  const res = await client.get('/blockchain/implementation/tech-stack');
  return res.data;
};

export const getBestPractices = async (): Promise<{ status: string; practices: string[] }> => {
  const res = await client.get('/blockchain/implementation/best-practices');
  return res.data;
};

export const getMonitoringMetrics = async (): Promise<{ status: string; metrics: string[] }> => {
  const res = await client.get('/blockchain/implementation/metrics');
  return res.data;
};

export const getImplementationRisks = async (): Promise<{ status: string; risks: Record<string, string>[] }> => {
  const res = await client.get('/blockchain/implementation/risks');
  return res.data;
};

export const getDevelopmentTimeline = async (): Promise<{ status: string; timeline: Record<string, unknown> }> => {
  const res = await client.get('/blockchain/implementation/timeline');
  return res.data;
};

// ============== DEFAULT EXPORT ==============

export default {
  // Semantic
  getSemanticDomains,
  getSemanticClusters,
  getClustersByDomain,
  getDriftThresholds,
  getEmbeddingConfig,
  // Trust
  getTrustTiers,
  getTrustTier,
  getTrustFactors,
  getReputationDecay,
  getPenalties,
  // Lifecycle
  getLifecycleStates,
  getLifecycleState,
  getLifecycleTransitions,
  getLifecycleEvents,
  // Governance
  getEthicalPrinciples,
  getOversightBodies,
  getGovernanceContracts,
  // Compliance
  getComplianceFrameworks,
  getComplianceFramework,
  getComplianceSectors,
  getLegalStructures,
  getRiskControls,
  getCompliancePrinciples,
  // Security
  getSecurityLayers,
  getSecurityLayer,
  getSecurityThreats,
  getSecurityControls,
  getIncidentResponse,
  getHardeningDefaults,
  getSupervisorCapabilities,
  // Scaling
  getScalingSurfaces,
  getScalingSurface,
  getThroughputTargets,
  getLatencyTargets,
  getOptimizationStrategies,
  getHADRArchitecture,
  getNationalBlueprint,
  getPerformanceBenchmarks,
  getCapacityPlanning,
  // Commercialization
  getRevenueStreams,
  getLicensingTiers,
  getUsagePricing,
  getMarketplaceRates,
  getEnterpriseSolutions,
  getGovernmentPricing,
  getEconomicFlywheel,
  getMarketPositioning,
  getPricingStrategy,
  getCustomerAcquisition,
  getRevenueProjections,
  // Partnerships
  getPartnerCategories,
  getPartnershipModels,
  getGovernmentModels,
  getTargetIndustries,
  getEnterpriseFlywheel,
  getDeveloperEcosystem,
  getInternationalAlliances,
  getQualificationCriteria,
  getEcosystemRisks,
  getExpansionTimeline,
  // Standards
  getStandardsBodyAlignments,
  getStandardsGaps,
  getStandardsDomains,
  getStandardizationPhases,
  getProtocolClass,
  getGlobalAdoptionMap,
  getStandardizationMessages,
  // Protocol
  getProtocolOverview,
  getProtocolLayers,
  getProtocolLayer,
  getProtocolSubsystems,
  getConformanceRequirements,
  getProtocolGlossary,
  // Implementation
  getImplementationSteps,
  getImplementationStep,
  getDeploymentModels,
  getTechStack,
  getBestPractices,
  getMonitoringMetrics,
  getImplementationRisks,
  getDevelopmentTimeline,
};
