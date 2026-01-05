import { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash-es';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseFormAutoSaveOptions {
  saveFn: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

/**
 * Event-driven auto-save hook (Google Docs pattern).
 * 
 * Only triggers saves when user explicitly changes form fields,
 * not when state is updated programmatically (e.g., loading from backend).
 * 
 * Usage:
 * ```tsx
 * const { handleChange, saveStatus } = useFormAutoSave({
 *   saveFn: async () => await saveToBackend(data),
 *   delay: 1000,
 *   enabled: !!id,
 * });
 * 
 * <input
 *   onChange={(e) => {
 *     handleChange(() => updateField(e.target.value));
 *   }}
 * />
 * ```
 * 
 * @param options - Configuration options
 * @param options.saveFn - Async function to save data
 * @param options.delay - Debounce delay in milliseconds (default: 1000)
 * @param options.enabled - Whether auto-save is enabled (default: true)
 * @returns handleChange wrapper and current save status
 */
export function useFormAutoSave({
  saveFn,
  delay = 1000,
  enabled = true,
}: UseFormAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isDirty = useRef(false);

  // Save function with status management
  const save = useCallback(async () => {
    if (!enabled || !isDirty.current) return;

    try {
      setSaveStatus('saving');
      await saveFn();
      setSaveStatus('saved');
      isDirty.current = false;

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [enabled, saveFn]);

  // Debounced save (memoized)
  const debouncedSave = useCallback(
    debounce(() => save(), delay),
    [delay, save]
  );

  /**
   * Wrapper for onChange handlers.
   * Call this with your state update function to trigger auto-save.
   */
  const handleChange = useCallback((updateFn: () => void) => {
    console.log('✏️ handleChange called - updating state');
    updateFn(); // Execute the state update
    isDirty.current = true; // Mark as dirty
    console.log('  ⏰ Debounced save scheduled');
    debouncedSave(); // Trigger debounced save
  }, [debouncedSave]);

  return { handleChange, saveStatus };
}
