/**
 * Button Diagnostics Utility
 * Run this in browser console to diagnose button clickability issues
 */

import logger from './logger';

export const diagnoseButtons = () => {
  logger.info('🔍 Button Diagnostics Starting...');

  // Find all buttons
  const buttons = document.querySelectorAll('button, .btn, [role="button"]');
  logger.info(`Found ${buttons.length} buttons`);

  // Check each button
  let blockedCount = 0;
  let clickableCount = 0;

  buttons.forEach((btn, index) => {
    const element = btn as HTMLElement;
    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    const isVisible = rect.width > 0 && rect.height > 0 && styles.display !== 'none';
    const pointerEvents = styles.pointerEvents;
    const zIndex = styles.zIndex;
    const position = styles.position;
    const cursor = styles.cursor;
    const disabled = element.hasAttribute('disabled') || element.classList.contains('disabled');

    // Check if there's an overlay on top
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const topElement = document.elementFromPoint(centerX, centerY);

    const isBlocked = topElement !== element && topElement !== element.parentElement;

    if (isBlocked || pointerEvents === 'none' || disabled) {
      blockedCount++;
      logger.warn(`❌ Button ${index + 1} (${element.textContent?.substring(0, 30)}...) is BLOCKED`, {
        visible: isVisible,
        pointerEvents,
        zIndex,
        position,
        cursor,
        disabled,
        blockedBy: isBlocked ? topElement?.tagName + '.' + topElement?.className : 'none',
        rect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left }
      });
    } else {
      clickableCount++;
      if (index < 5) { // Only log first 5 clickable buttons
        logger.info(`✅ Button ${index + 1} (${element.textContent?.substring(0, 30)}...) is CLICKABLE`);
      }
    }
  });

  logger.info('📊 Summary:', {
    clickable: clickableCount,
    blocked: blockedCount,
  });

  // Check for overlays
  const overlays = document.querySelectorAll('[class*="overlay"], [class*="modal"], [class*="loading"]');
  logger.info(`🔍 Found ${overlays.length} potential overlays`);
  overlays.forEach((overlay, index) => {
    const element = overlay as HTMLElement;
    const styles = window.getComputedStyle(element);
    const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
    if (isVisible) {
      logger.info(`⚠️  Overlay ${index + 1}: ${element.className} (visible: ${isVisible})`);
    }
  });

  // Check z-index stacking
  logger.info('📚 Z-Index Stacking:');
  const elements = document.querySelectorAll('*');
  const zIndexMap = new Map<number, HTMLElement[]>();
  elements.forEach((el) => {
    const styles = window.getComputedStyle(el);
    const zIndex = parseInt(styles.zIndex);
    if (!isNaN(zIndex) && zIndex > 100) {
      if (!zIndexMap.has(zIndex)) {
        zIndexMap.set(zIndex, []);
      }
      zIndexMap.get(zIndex)!.push(el as HTMLElement);
    }
  });

  Array.from(zIndexMap.entries())
    .sort((a, b) => b[0] - a[0])
    .slice(0, 10)
    .forEach(([zIndex, elements]) => {
      logger.info(`z-index: ${zIndex} - ${elements.length} elements`);
      elements.slice(0, 3).forEach((el) => {
        logger.info(`   - ${el.tagName}.${el.className}`);
      });
    });

  return {
    total: buttons.length,
    clickable: clickableCount,
    blocked: blockedCount,
    overlays: overlays.length
  };
};

// Auto-run in development
if (import.meta.env.DEV) {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        logger.info('🔍 Running automatic button diagnostics...');
        diagnoseButtons();
      }, 2000);
    });
  } else {
    setTimeout(() => {
      logger.info('🔍 Running automatic button diagnostics...');
      diagnoseButtons();
    }, 2000);
  }
}

