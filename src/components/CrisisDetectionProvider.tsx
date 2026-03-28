import { useEffect, useState, useCallback, useRef } from 'react';
import { detectCrisis } from '@/utils/crisisDetection';
import { CrisisSOSModal } from '@/components/CrisisSOSModal';

/**
 * Global crisis detection provider.
 * Monitors ALL input/textarea fields across the entire app using
 * multiple strategies to ensure nothing is missed:
 * 1. Native 'input' event listener (capture phase)
 * 2. Periodic polling of all focused inputs
 * 3. Keyboard event monitoring
 * 4. Custom event for voice recognition integration
 */
export const CrisisDetectionProvider = () => {
  const [showSOS, setShowSOS] = useState(false);
  const lastTriggerRef = useRef(0);

  const triggerSOS = useCallback(() => {
    const now = Date.now();
    // 60-second cooldown between triggers
    if (now - lastTriggerRef.current < 60000) return;
    lastTriggerRef.current = now;
    setShowSOS(true);
  }, []);

  const checkText = useCallback((text: string) => {
    if (text && text.length >= 4 && detectCrisis(text)) {
      triggerSOS();
    }
  }, [triggerSOS]);

  useEffect(() => {
    // Strategy 1: Native input event (capture phase to catch before React)
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target) return;
      const value = target.value || target.textContent || '';
      checkText(value);
    };

    // Strategy 2: Keyup on any element — catches React controlled inputs
    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        const value = (target as HTMLInputElement).value || target.textContent || '';
        checkText(value);
      }
    };

    // Strategy 3: Custom event for voice recognition
    const handleVoiceCrisis = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.text) checkText(detail.text);
    };

    // Strategy 4: Paste event
    const handlePaste = (e: ClipboardEvent) => {
      const pasted = e.clipboardData?.getData('text') || '';
      if (pasted) {
        // Check pasted text + existing value
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const existing = target?.value || '';
        checkText(existing + pasted);
      }
    };

    document.addEventListener('input', handleInput, true);
    document.addEventListener('keyup', handleKeyUp, true);
    document.addEventListener('paste', handlePaste, true);
    window.addEventListener('calmora-voice-input', handleVoiceCrisis);

    // Strategy 5: Poll active element every 2 seconds as fallback
    const pollInterval = setInterval(() => {
      const active = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        const value = active.value || '';
        if (value.length >= 4) checkText(value);
      }
    }, 2000);

    return () => {
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      document.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('calmora-voice-input', handleVoiceCrisis);
      clearInterval(pollInterval);
    };
  }, [checkText]);

  const handleClose = useCallback(() => {
    setShowSOS(false);
  }, []);

  return <CrisisSOSModal isOpen={showSOS} onClose={handleClose} />;
};
