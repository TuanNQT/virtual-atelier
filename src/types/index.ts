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

// Dropzone prop types
export interface DropzoneRootProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDragEnter?: React.DragEventHandler<HTMLDivElement>;
  onDragLeave?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  role?: string;
  tabIndex?: number;
  [key: string]: unknown;
}

export interface DropzoneInputProps {
  accept?: string;
  multiple?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
  [key: string]: unknown;
}
