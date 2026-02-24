// Generation Result Type
export interface GenerationResult {
  id: string;
  url: string;
}

// Window AI Studio API Type
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// User Type
export interface User {
  email: string;
  request_count: number;
}

// Gender Type
export type Gender = 'male' | 'female';

// Theme Type
export type ThemeId = string;

// Aspect Ratio Type
export type AspectRatio = '9:16' | '3:4' | '1:1' | '4:3' | '16:9';
