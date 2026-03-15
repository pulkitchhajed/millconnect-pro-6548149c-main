import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  name: string;
  hex: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ColorSwatch = ({ name, hex, size = "md", className }: ColorSwatchProps) => {
  const sizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3.5 w-3.5",
    lg: "h-5 w-5",
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "rounded-full border border-black/10 shadow-sm cursor-help transition-all duration-300 hover:scale-150 hover:z-10 hover:shadow-md",
              sizeClasses[size],
              className
            )}
            style={{ backgroundColor: hex || "#CCCCCC" }}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black text-white border-none py-1 px-2 text-[10px] font-medium">
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface ColorSwatchListProps {
  colors: string;
  limit?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showCount?: boolean;
}

export const ColorSwatchList = ({ 
  colors, 
  limit = 20, 
  size = "md", 
  className,
  showCount = true 
}: ColorSwatchListProps) => {
  if (!colors) return null;

  const colorArray = colors.split(",").filter(s => s.trim());
  const displayArray = colorArray.slice(0, limit);
  const remainingCount = colorArray.length - limit;

  return (
    <div className={cn("flex flex-wrap gap-1.5 items-center", className)}>
      {displayArray.map((c, i) => {
        const parts = c.trim().split(":");
        const name = parts[0]?.trim() || "Color";
        const hex = parts[1]?.trim() || "#CCCCCC";
        return <ColorSwatch key={i} name={name} hex={hex} size={size} />;
      })}
      {showCount && remainingCount > 0 && (
        <span className="text-[10px] text-muted-foreground font-medium ml-0.5">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};
