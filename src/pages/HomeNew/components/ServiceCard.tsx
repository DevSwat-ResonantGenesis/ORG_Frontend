import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import {
    goToResonantChat,
    goToLLMScanner,
    goToDashboard,
    goToHashSphere
} from '@/utils/navigation';
import titleStyles from '@/components/ui/Title.module.css';
import {
    RiskManagementIcon,
    ChatIcon as ServiceChatIcon,
    MLOpsIcon,
    ComplianceIcon,
    AuditIcon as ServiceAuditIcon,
    HashSphereIcon,
    EnterpriseIcon,
    BillingIcon,
    IntegrationIcon,
    AnalyticsIcon,
    SecurityIcon,
    EvidenceGraphIcon
} from '@/components/Icons/ServiceIcons';
import styles from '../HomeNew.module.css';

// Service icons mapping
const serviceIconMap: Record<string, React.ReactNode> = {
    'ai-risk-management': <RiskManagementIcon />,
    'resonant-chat': <ServiceChatIcon />,
    'mlops': <MLOpsIcon />,
    'policy-compliance': <ComplianceIcon />,
    'audit-logging': <ServiceAuditIcon />,
    'hashsphere': <HashSphereIcon />,
    'enterprise-management': <EnterpriseIcon />,
    'billing': <BillingIcon />,
    'integrations': <IntegrationIcon />,
    'analytics': <AnalyticsIcon />,
    'authentication': <SecurityIcon />,
    'evidence-graph': <EvidenceGraphIcon />,
};

interface ServiceCardProps {
    service: {
        id: string;
        title: string;
        shortDescription: string;
        bestFor: string[];
        pricing: string;
        readiness?: string;
        status: string;
        badge?: string;
    };
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    const navigate = useNavigate();

    return (
        <div className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
                <div className={styles.serviceIcon}>
                    {serviceIconMap[service.id] || <RiskManagementIcon />}
                </div>
                <div className={styles.serviceBadges}>
                    {service.readiness && (
                        <span className={`${styles.readinessBadge} ${service.status === 'ready' ? styles.badgeReady : styles.badgeComingSoon}`}>
                            {service.status === 'ready' ? `${service.readiness} Ready` : 'Coming Soon'}
                        </span>
                    )}
                    {service.badge && (
                        <span className={styles.uniqueBadge}>
                            {service.badge}
                        </span>
                    )}
                </div>
            </div>
            <h3 className={titleStyles.serviceTitle}>{service.title}</h3>
            <p className={styles.serviceDescription}>{service.shortDescription}</p>
            <div className={styles.serviceBestFor}>
                <strong>Best for:</strong> {service.bestFor.join(', ')}
            </div>
            <div className={styles.servicePricing}>
                {service.pricing}
            </div>
            <Button
                variant="secondary"
                onClick={() => {
                    if (service.id === 'resonant-chat') {
                        goToResonantChat(navigate);
                    } else if (service.id === 'ai-risk-management') {
                        goToLLMScanner(navigate);
                    } else if (service.id === 'hashsphere') {
                        goToHashSphere(navigate);
                    } else if (service.id === 'multi-provider-router' || service.id === 'rag-api' || service.id === 'predictions-api') {
                        navigate('/api/docs');
                    } else {
                        goToDashboard(navigate);
                    }
                }}
                aria-label={`Learn more about ${service.title}`}
            >
                Learn More →
            </Button>
        </div>
    );
};
