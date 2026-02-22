import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  '': 'Home',
  'agents': 'Agent Studio',
  'network': 'Network',
  'marketplace': 'Marketplace',
  'templates': 'Templates',
  'publish': 'Publish Agent',
  'dashboard': 'Dashboard',
  'dashboards': 'Dashboards',
  'ml': 'ML Ops',
  'training-jobs': 'Training Jobs',
  'model-versions': 'Model Versions',
  'help': 'Help Center',
  'settings': 'Settings',
  'profile': 'Profile',
  'control-plane': 'Control Plane',
  'autonomy': 'Autonomy',
  'sessions': 'Sessions',
  'teams': 'Teams',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 0',
    fontSize: '0.875rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  link: {
    color: '#888',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    transition: 'color 0.2s',
  },
  linkHover: {
    color: '#6366f1',
  },
  current: {
    color: '#fff',
    fontWeight: '500',
  },
  separator: {
    color: '#444',
    display: 'flex',
    alignItems: 'center',
  },
  homeIcon: {
    display: 'flex',
    alignItems: 'center',
  },
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className,
}) => {
  const location = useLocation();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Auto-generate breadcrumbs from current path if items not provided
  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      generatedItems.push({
        label,
        path: index < pathSegments.length - 1 ? currentPath : undefined,
      });
    });

    return generatedItems;
  }, [items, location.pathname]);

  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      style={styles.container}
      className={className}
    >
      {showHome && (
        <>
          <Link
            to="/"
            style={{
              ...styles.link,
              ...(hoveredIndex === -1 ? styles.linkHover : {}),
            }}
            onMouseEnter={() => setHoveredIndex(-1)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label="Home"
          >
            <span style={styles.homeIcon}>
              <Home size={16} />
            </span>
          </Link>
          {breadcrumbItems.length > 0 && (
            <span style={styles.separator}>
              <ChevronRight size={14} />
            </span>
          )}
        </>
      )}

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isHovered = hoveredIndex === index;

        return (
          <React.Fragment key={index}>
            <span style={styles.item}>
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  style={{
                    ...styles.link,
                    ...(isHovered ? styles.linkHover : {}),
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <span style={styles.current}>
                  {item.icon}
                  {item.label}
                </span>
              )}
            </span>

            {!isLast && (
              <span style={styles.separator}>
                <ChevronRight size={14} />
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
