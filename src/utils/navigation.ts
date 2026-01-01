/**
 * Navigation Utilities
 * Unified functions for common navigation patterns
 * All navigation should use these functions for consistency
 */

import { NavigateFunction } from 'react-router-dom';

/**
 * Scrolls to a section by ID
 * @param id - The ID of the section to scroll to
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu (e.g., sidebar)
 */
export const scrollToSection = (
  id: string,
  navigate?: NavigateFunction,
  closeMenu?: () => void
) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    if (closeMenu) closeMenu();
  } else {
    // If section not found, navigate to home and scroll
    if (navigate && window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const homeElement = document.getElementById(id);
        if (homeElement) {
          homeElement.scrollIntoView({ behavior: 'smooth' });
        }
        if (closeMenu) closeMenu();
      }, 100);
    } else if (closeMenu) {
      closeMenu();
    }
  }
};

/**
 * Navigate to pricing page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu (e.g., sidebar)
 */
export const goToPricing = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/pricing');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to home page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToHome = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to LLM Scanner page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToLLMScanner = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/llm-scan');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Validation Tool page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToValidationTool = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/validate');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Resonant Chat page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToResonantChat = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/resonant-chat');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to IDE page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToIDE = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/ide');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Resonant Chat Settings page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToResonantChatSettings = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/settings/resonant-chat');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Dashboard (role-based routing handled by router)
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToDashboard = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/dashboard');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Help Center / Documentation
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToHelp = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/help');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to About page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToAbout = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/about');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Careers page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToCareers = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/careers');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Contact page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToContact = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/contact');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Login page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToLogin = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/login');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Signup page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToSignup = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/public/signup');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Privacy Policy page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToPrivacy = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/public/legal/privacy');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Terms of Service page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToTerms = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/public/legal/terms');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Compliance page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToCompliance = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/public/legal/compliance');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Hash Sphere Test / Prototype page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToHashSphere = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/hash-sphere/fullscreen');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Hash Sphere Fullscreen page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToHashSphereFullscreen = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/hash-sphere/fullscreen');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Predictions page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToPredictions = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/predictions');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Audit Logs page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToAudit = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/audit');
  if (closeMenu) closeMenu();
};

/**
 * Navigate to Policies page
 * @param navigate - React Router navigate function
 * @param closeMenu - Optional callback to close menu
 */
export const goToPolicies = (
  navigate: NavigateFunction,
  closeMenu?: () => void
) => {
  navigate('/policies');
  if (closeMenu) closeMenu();
};

