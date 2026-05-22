import React, { useRef, useEffect, useState } from 'react';

interface ParallaxAvatarProps {
  agent: {
    id: string;
    name: string;
    description?: string;
    type?: string;
    avatar_url?: string;
  };
  isOpenClaw?: boolean;
}

const ParallaxAvatar: React.FC<ParallaxAvatarProps> = ({ agent, isOpenClaw }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Generate colors based on agent name/type for unique visual identity
  const generateColors = () => {
    const hash = agent.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = (hash * 137) % 360;
    const hue2 = (hue1 + 60) % 360;
    const hue3 = (hue1 + 120) % 360;
    
    return {
      primary: `hsl(${hue1}, 70%, 60%)`,
      secondary: `hsl(${hue2}, 65%, 55%)`,
      accent: `hsl(${hue3}, 75%, 50%)`,
    };
  };

  const colors = generateColors();

  // Generate pattern based on agent type
  const getPatternType = () => {
    const type = agent.type?.toLowerCase() || 'general';
    if (type.includes('assistant') || type.includes('chat')) return 'circles';
    if (type.includes('data') || type.includes('analysis')) return 'grid';
    if (type.includes('code') || type.includes('developer')) return 'hexagon';
    if (type.includes('creative') || type.includes('design')) return 'waves';
    return 'particles';
  };

  const patternType = getPatternType();

  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  // If agent has custom avatar, use it with parallax overlay
  if (agent.avatar_url) {
    return (
      <div
        ref={containerRef}
        className="parallax-avatar-container"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: '14px',
          overflow: 'hidden',
        }}
      >
        <img
          src={agent.avatar_url}
          alt={agent.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isHovering 
              ? `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px) scale(1.1)` 
              : 'translate(0, 0) scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        {/* Parallax overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at ${50 + mousePosition.x * 30}% ${50 + mousePosition.y * 30}%, 
              ${colors.primary}33 0%, transparent 70%)`,
            opacity: isHovering ? 0.6 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  }

  // Generate dynamic avatar based on agent specs
  return (
    <div
      ref={containerRef}
      className="parallax-avatar-container"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '14px',
        overflow: 'hidden',
        background: isOpenClaw 
          ? 'linear-gradient(135deg, rgba(250, 165, 37, 0.3), rgba(250, 165, 37, 0.1))'
          : `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary}20)`,
      }}
    >
      {/* Animated background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: isHovering 
            ? `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)` 
            : 'translate(0, 0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {patternType === 'circles' && (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.5">
              <animate attributeName="r" values="30;35;30" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="20" fill="none" stroke={colors.secondary} strokeWidth="0.5" opacity="0.4">
              <animate attributeName="r" values="20;25;20" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="10" fill={colors.accent} opacity="0.3">
              <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        )}
        
        {patternType === 'grid' && (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={colors.primary} strokeWidth="0.3" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect x="30" y="30" width="40" height="40" fill={colors.secondary} opacity="0.2">
              <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
            </rect>
          </svg>
        )}
        
        {patternType === 'hexagon' && (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.8;0.5" dur="4s" repeatCount="indefinite" />
            </polygon>
            <polygon points="50,25 75,40 75,60 50,75 25,60 25,40" fill={colors.secondary} opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite" />
            </polygon>
          </svg>
        )}
        
        {patternType === 'waves' && (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke={colors.primary} strokeWidth="0.5" opacity="0.5">
              <animate attributeName="d" values="M0,50 Q25,30 50,50 T100,50;M0,50 Q25,70 50,50 T100,50;M0,50 Q25,30 50,50 T100,50" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M0,60 Q25,40 50,60 T100,60" fill="none" stroke={colors.secondary} strokeWidth="0.5" opacity="0.4">
              <animate attributeName="d" values="M0,60 Q25,40 50,60 T100,60;M0,60 Q25,80 50,60 T100,60;M0,60 Q25,40 50,60 T100,60" dur="2.5s" repeatCount="indefinite" />
            </path>
          </svg>
        )}
        
        {patternType === 'particles' && (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {[...Array(20)].map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 100}
                cy={Math.random() * 100}
                r={Math.random() * 3 + 1}
                fill={i % 2 === 0 ? colors.primary : colors.secondary}
                opacity={Math.random() * 0.5 + 0.2}
              >
                <animate attributeName="cy" values={`${Math.random() * 100};${Math.random() * 100}`} dur={`${Math.random() * 3 + 2}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${Math.random() * 2 + 1}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </svg>
        )}
      </div>

      {/* Center icon with parallax */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: isHovering 
            ? `translate(calc(-50% + ${mousePosition.x * 8}px), calc(-50% + ${mousePosition.y * 8}px)) scale(1.1)` 
            : 'translate(-50%, -50%) scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          fontSize: '24px',
          color: isOpenClaw ? '#FAA525' : colors.primary,
          filter: `drop-shadow(0 0 10px ${colors.primary}80)`,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>

      {/* Glow effect on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at ${50 + mousePosition.x * 40}% ${50 + mousePosition.y * 40}%, 
            ${colors.accent}40 0%, transparent 60%)`,
          opacity: isHovering ? 0.8 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default ParallaxAvatar;
