import { useMemo } from 'react';
import { FormBasedEditor } from '../components/FormBasedEditor';
import { createEmptyResume } from '../types/resume';

export function CreateCVPage() {
  // Memoize initialCV to prevent creating a new empty CV on every render
  // This was causing FormBasedEditor's useEffect to reset user data
  const initialCV = useMemo(() => createEmptyResume(), []);
  
  return <FormBasedEditor initialCV={initialCV} />;
}
