import React from "react";
import { cn } from "../../lib/utils";
import { AspectRatio } from "../../types";

interface LoadingSkeletonProps {
  aspectRatio: AspectRatio;
  count?: number; // how many have loaded already
  singleSlot?: number; // render only this slot (0-3), used inline in grid
}

export function SkeletonSlot({
  index,
  aspectRatio,
}: {
  index: number;
  aspectRatio: AspectRatio;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[2.5rem] overflow-hidden border border-black/5 bg-black/5",
        aspectRatio === "9:16" && "aspect-[9/16]",
        aspectRatio === "3:4" && "aspect-[3/4]",
        aspectRatio === "1:1" && "aspect-[1/1]",
        aspectRatio === "4:3" && "aspect-[4/3]",
        aspectRatio === "16:9" && "aspect-[16/9]",
      )}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"
        style={{
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          transform: "translateX(-100%)",
          animationDelay: `${index * 0.15}s`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black/15 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="text-[11px] font-semibold text-black/30">
            Đang tạo {index + 1}/4
          </p>
        </div>
      </div>
    </div>
  );
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  aspectRatio,
  count = 0,
  singleSlot,
}) => {
  const slots = singleSlot !== undefined ? [singleSlot] : [0, 1, 2, 3];
  return (
    <div className="grid grid-cols-2 gap-6">
      {slots.map((i) => (
        <div
          key={i}
          className={cn(
            "relative rounded-[2.5rem] overflow-hidden border border-black/5",
            i < count ? "opacity-0" : "bg-black/5",
            aspectRatio === "9:16" && "aspect-[9/16]",
            aspectRatio === "3:4" && "aspect-[3/4]",
            aspectRatio === "1:1" && "aspect-[1/1]",
            aspectRatio === "4:3" && "aspect-[4/3]",
            aspectRatio === "16:9" && "aspect-[16/9]",
          )}
        >
          {i >= count && (
            <>
              {/* shimmer */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  transform: "translateX(-100%)",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-black/15 border-t-orange-500 rounded-full animate-spin mx-auto" />
                  <p className="text-[11px] font-semibold text-black/30">
                    Đang tạo {i + 1}/4
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
