export interface GenerationResult {
  id: string;
  url: string;
  isRegenerating?: boolean;
}

// #1 History
export interface GenerationSession {
  id: string;
  timestamp: number;
  results: GenerationResult[];
  theme: string;
  gender: string;
  aspectRatio: AspectRatio;
  /** URL ảnh sản phẩm (ImageKit). Dùng ?tr=w-100 để thumbnail. Có thể thiếu ở lịch sử cũ. */
  productImageUrl?: string;
  /** URL ảnh mẫu (ImageKit), nếu có. */
  modelImageUrl?: string;
  /** @deprecated Dùng productImageUrl + ?tr=w-100 thay thế. Giữ để tương thích lịch sử cũ. */
  productImageThumb?: string;
}

// #2 Pose
export type PoseId = "selfie" | "standing" | "walking" | "sitting" | "detail";
export interface Pose {
  id: PoseId;
  label: string;
  icon: string;
  prompt: string;
}

// Window AI Studio
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface User {
  email: string;
  request_count: number;
}
export type Gender = "male" | "female";
export type ThemeId = string;
export type AspectRatio = "9:16" | "3:4" | "1:1" | "4:3" | "16:9";

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
