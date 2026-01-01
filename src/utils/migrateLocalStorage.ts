/**
 * Migration script for localStorage chat data
 * Moves old shared localStorage data to per-user backend storage
 */

import { getSessionData } from './auth-cookies';
import { createChat, sendResonantMessage } from '@/api/resonantChat';

interface OldMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * Migrate old shared localStorage data to backend
 * This should be called once when user logs in
 */
export const migrateLocalStorageToBackend = async (): Promise<boolean> => {
  try {
    // 1. Check if old shared data exists
    const oldData = localStorage.getItem('resonant_ide_chat_messages');
    if (!oldData) {
      console.log('No old localStorage data to migrate');
      return true;
    }

    // 2. Parse old messages
    const oldMessages: OldMessage[] = JSON.parse(oldData);
    if (!oldMessages || oldMessages.length === 0) {
      console.log('Old localStorage data is empty');
      return true;
    }

    // 3. Check if user is authenticated
    const session = getSessionData();
    if (!session?.userId && !session?.email) {
      console.warn('User not authenticated, cannot migrate to backend');
      return false;
    }

    // 4. Check if already migrated
    const migrationFlag = localStorage.getItem(`rg_migrated_${session.userId || session.email}`);
    if (migrationFlag) {
      console.log('Data already migrated for this user');
      return true;
    }

    console.log(`Migrating ${oldMessages.length} messages to backend...`);

    // 5. Create new chat in backend
    const chatResponse = await createChat('Migrated Chat');
    if (!chatResponse?.chat_id) {
      console.error('Failed to create chat for migration');
      return false;
    }

    // 6. Send messages to backend
    let migratedCount = 0;
    for (const message of oldMessages) {
      // Skip welcome messages
      if (message.id === '1' && message.role === 'assistant') {
        continue;
      }

      try {
        await sendResonantMessage({
          message: message.content,
          chatId: chatResponse.chat_id,
          preferred_provider: 'auto'
        });
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate message ${message.id}:`, error);
      }
    }

    // 7. Mark as migrated
    localStorage.setItem(`rg_migrated_${session.userId || session.email}`, 'true');
    
    // 8. Clear old data (optional, keep for backup)
    // localStorage.removeItem('resonant_ide_chat_messages');
    
    console.log(`Successfully migrated ${migratedCount} messages to backend`);
    return true;

  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};

/**
 * Check if migration is needed
 */
export const needsMigration = (): boolean => {
  const oldData = localStorage.getItem('resonant_ide_chat_messages');
  const session = getSessionData();
  
  if (!oldData || !session) {
    return false;
  }
  
  const migrationFlag = localStorage.getItem(`rg_migrated_${session.userId || session.email}`);
  return !migrationFlag;
};

/**
 * Clear old localStorage data after successful migration
 */
export const clearOldLocalStorage = (): void => {
  localStorage.removeItem('resonant_ide_chat_messages');
  console.log('Cleared old localStorage data');
};
