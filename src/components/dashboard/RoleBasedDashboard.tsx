import React from 'react';
import { getSession } from '../../utils/auth';
import { normalizeRole, type Role } from '../../utils/permissions';
import { ComplianceDashboard } from './ComplianceDashboard';
import { MLDashboard } from './MLDashboard';
import { FinanceDashboard } from './FinanceDashboard';
import { AdminDashboard } from './AdminDashboard';
import { ViewerDashboard } from './ViewerDashboard';

interface RoleBasedDashboardProps {
  children?: React.ReactNode;
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ children }) => {
  const session = getSession();
  const userRole = normalizeRole((session.role || 'user') as Role) || 'user';

  // Render role-specific dashboard
  switch (userRole) {
    case 'compliance':
      return <ComplianceDashboard />;
    case 'ml_engineer':
      return <MLDashboard />;
    case 'finance':
      return <FinanceDashboard />;
    case 'platform_dev':
      return <AdminDashboard />;
    case 'viewer':
      return <ViewerDashboard />;
    case 'org_admin':
    case 'user':
    default:
      return <>{children}</>;
  }
};

export default RoleBasedDashboard;

