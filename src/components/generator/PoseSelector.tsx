import React from "react";
import { cn } from "../../lib/utils";
import { POSES } from "../../constants/config";
import { PoseId } from "../../types";

interface PoseSelectorProps {
  selectedPose: PoseId;
  onPoseChange: (pose: PoseId) => void;
}

export const PoseSelector: React.FC<PoseSelectorProps> = ({
  selectedPose,
  onPoseChange,
}) => (
  <div className="flex flex-wrap gap-2">
    {POSES.map((p) => (
      <button
        key={p.id}
        onClick={() => onPoseChange(p.id)}
        className={cn(
          "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all",
          selectedPose === p.id
            ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md"
            : "bg-white border-black/12 text-black/65 hover:border-black/25 hover:text-black",
        )}
      >
        <span>{p.icon}</span>
        {p.label}
      </button>
    ))}
  </div>
);
