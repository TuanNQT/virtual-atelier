import { Pose } from "../types";

export const THEMES = [
  { id: "modern", label: "Hiện đại", icon: "✨" },
  { id: "glamorous", label: "Quyến rũ", icon: "💃" },
  { id: "street", label: "Đường phố", icon: "🏙️" },
  { id: "corner", label: "Góc phố", icon: "🏘️" },
  { id: "cafe", label: "Cafe", icon: "☕" },
  { id: "studio", label: "Studio", icon: "📸" },
];

export const GENDERS = [
  { id: "female", label: "Nữ", icon: "👩" },
  { id: "male", label: "Nam", icon: "👨" },
];

export const ASPECT_RATIOS = [
  { id: "9:16", label: "9:16", icon: "📱" },
  { id: "3:4", label: "3:4", icon: "📸" },
  { id: "1:1", label: "1:1", icon: "⬜" },
  { id: "4:3", label: "4:3", icon: "🖼️" },
  { id: "16:9", label: "16:9", icon: "📺" },
];

// #2 Poses
export const POSES: Pose[] = [
  {
    id: "selfie",
    label: "Selfie",
    icon: "🤳",
    prompt:
      "holding an iPhone taking a selfie in front of a mirror, natural expression",
  },
  {
    id: "standing",
    label: "Đứng thẳng",
    icon: "🧍",
    prompt:
      "standing upright, full body shot, confident professional model pose on a clean background",
  },
  {
    id: "walking",
    label: "Đi bộ",
    icon: "🚶",
    prompt:
      "walking naturally, candid street fashion shot, mid-stride, relaxed energy",
  },
  {
    id: "sitting",
    label: "Ngồi",
    icon: "🪑",
    prompt:
      "sitting elegantly, lifestyle photography, relaxed and natural pose",
  },
  {
    id: "detail",
    label: "Chi tiết",
    icon: "🔍",
    prompt:
      "close-up editorial shot highlighting fabric texture, stitching, and clothing details",
  },
];

export const GEMINI_MODEL = "gemini-2.5-flash-image";
