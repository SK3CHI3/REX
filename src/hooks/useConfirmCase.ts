import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ConfirmCaseResponse } from '@/types';

interface UseConfirmCaseReturn {
  confirmCase: (caseId: string) => Promise<ConfirmCaseResponse | null>;
  isConfirming: boolean;
  error: string | null;
  hasConfirmed: (caseId: string) => boolean;
}

/**
 * Custom hook for confirming cases with community verification
 * Handles local storage tracking and API calls to the Edge Function
 */
export const useConfirmCase = (): UseConfirmCaseReturn => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user fingerprint (simple browser-based fingerprint)
  const getUserFingerprint = (): string => {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
      screen.colorDepth.toString(),
      screen.width.toString() + 'x' + screen.height.toString(),
    ].join('|');
    
    return btoa(fingerprint); // Base64 encode
  };

  // Check if user has already confirmed a case (local storage check)
  const hasConfirmed = (caseId: string): boolean => {
    // SSR safety check
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    try {
      const confirmed = localStorage.getItem(`confirmed_case_${caseId}`);
      return confirmed === 'true';
    } catch {
      return false;
    }
  };

  // Mark case as confirmed in local storage
  const markAsConfirmed = (caseId: string): void => {
    // SSR safety check
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(`confirmed_case_${caseId}`, 'true');
      localStorage.setItem(`confirmed_case_${caseId}_at`, new Date().toISOString());
    } catch (err) {
      console.error('Failed to save confirmation to localStorage:', err);
    }
  };

  // Confirm a case
  const confirmCase = async (caseId: string): Promise<ConfirmCaseResponse | null> => {
    setIsConfirming(true);
    setError(null);

    try {
      // Check if already confirmed locally
      if (hasConfirmed(caseId)) {
        setError('You have already confirmed this case');
        setIsConfirming(false);
        return null;
      }

      // Get the Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      // Call the Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/confirm-case`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          case_id: caseId,
          user_fingerprint: getUserFingerprint(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.already_confirmed) {
          markAsConfirmed(caseId); // Update local storage
          setError('You have already confirmed this case');
        } else if (data.rate_limited) {
          setError('You have confirmed too many cases today. Please try again tomorrow.');
        } else {
          setError(data.error || 'Failed to confirm case');
        }
        setIsConfirming(false);
        return null;
      }

      // Success - mark as confirmed locally
      markAsConfirmed(caseId);
      setIsConfirming(false);
      return data as ConfirmCaseResponse;

    } catch (err) {
      console.error('Error confirming case:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsConfirming(false);
      return null;
    }
  };

  return {
    confirmCase,
    isConfirming,
    error,
    hasConfirmed,
  };
};

