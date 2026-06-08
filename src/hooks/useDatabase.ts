import { useState, useEffect } from 'react';
import { initDatabase } from '@/db/database';
import { seedIfEmpty } from '@/db/seed';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        await seedIfEmpty();
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  return { isReady };
}
