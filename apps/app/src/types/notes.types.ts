/**
 * Session Notes Types
 * Type definitions for session note-taking functionality
 */

export type NoteType = 'idea' | 'task' | 'insight' | 'general';

export interface Note {
  id: string;
  sessionId: string;
  content: string;
  type: NoteType;
  createdAt: string; // ISO timestamp
  position?: {
    x: number;
    y: number;
  };
}

export interface NotesDraft {
  content: string;
  type: NoteType;
}

export const NOTE_MAX_LENGTH = 2000;
export const FREE_NOTE_LIMIT = 3;
