import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'lifespan_sleep_quiz_answers_v1';

export function useProgressStorage() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setSelectedAnswers(JSON.parse(saved));
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveAnswer = (lessonId: string, choice: string) => {
    setSelectedAnswers((prev) => {
      const updated = { ...prev, [lessonId]: choice };
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      } catch {
        // Fallback
      }
      return updated;
    });
  };

  const resetProgress = () => {
    setSelectedAnswers({});
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Fallback
    }
  };

  return { selectedAnswers, saveAnswer, resetProgress, isLoaded };
}
