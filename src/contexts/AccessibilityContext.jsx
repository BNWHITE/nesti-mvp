import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import userPreferencesService from '../services/userPreferencesService';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const { user } = useAuth();
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await userPreferencesService.getAccessibilityNeeds(user.id);
        setAccessibilityNeeds(data);
        applyAccessibilitySettings(data);
      } catch (error) {
        console.error('Error loading accessibility needs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const applyAccessibilitySettings = (needs) => {
    if (!needs) return;

    const root = document.documentElement;

    // Dyslexia: Use OpenDyslexic font and increase spacing
    if (needs.dyslexia) {
      root.style.setProperty('--font-family', 'OpenDyslexic, Arial, sans-serif');
      root.style.setProperty('--letter-spacing', '0.05em');
      root.style.setProperty('--word-spacing', '0.15em');
      root.style.setProperty('--line-height', '1.8');
    }

    // Visual impairment: High contrast and larger text
    if (needs.visual) {
      root.style.setProperty('--font-size-multiplier', '1.2');
      root.classList.add('high-contrast');
      // Increase all font sizes
      root.style.setProperty('--font-size-base', '16px'); // Up from 13px
      root.style.setProperty('--font-size-lg', '19px'); // Up from 16px
      root.style.setProperty('--font-size-xl', '22px'); // Up from 18px
    }

    // Cognitive: Simplified UI
    if (needs.cognitive) {
      root.classList.add('simplified-ui');
      root.style.setProperty('--animation-duration', '0s'); // Disable animations
    }

    // Hearing: Visual indicators
    if (needs.hearing) {
      root.classList.add('visual-indicators');
    }

    // Mobility: Larger touch targets
    if (needs.mobility) {
      root.style.setProperty('--touch-target-min', '48px');
      root.classList.add('large-touch-targets');
    }
  };

  const updateAccessibilityNeeds = async (needs) => {
    if (!user) return;

    try {
      await userPreferencesService.saveAccessibilityNeeds(user.id, needs);
      setAccessibilityNeeds(needs);
      applyAccessibilitySettings(needs);
    } catch (error) {
      console.error('Error updating accessibility needs:', error);
    }
  };

  const value = {
    accessibilityNeeds,
    loading,
    updateAccessibilityNeeds
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityContext;
