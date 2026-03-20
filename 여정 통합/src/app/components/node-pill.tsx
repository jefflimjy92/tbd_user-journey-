import { COLORS, getNodeColor, type JourneyNode } from "./journey-data";

interface NodePillProps {
  node: JourneyNode;
  isMainStage?: boolean;
  muted?: boolean;
  parentNode?: JourneyNode;
}

export function NodePill({ node, isMainStage, muted, parentNode }: NodePillProps) {
  if (isMainStage) {
    return (
      <div
        className="flex items-center justify-center select-none text-center"
        style={{
          backgroundColor: COLORS.mainSpine.bg,
          color: COLORS.mainSpine.text,
          borderRadius: 24,
          padding: "8px 20px",
          minWidth: 120,
          minHeight: 40,
          boxShadow: "0 3px 12px rgba(27,79,138,0.30)",
          letterSpacing: "0.04em",
          fontSize: 14,
          fontWeight: 700,
          wordBreak: "keep-all",
          lineHeight: 1.3,
        }}
      >
        {node.label}
      </div>
    );
  }

  const color = getNodeColor(node, muted, parentNode);
  const hasBorder = node.type === "neutral" || muted;
  const borderColor = (color as any).border || "#CBD5E0";

  return (
    <div
      className="flex items-start select-none transition-all duration-150 hover:scale-[1.03] cursor-default"
      style={{
        backgroundColor: color.bg,
        color: color.text,
        border: hasBorder ? `1px solid ${borderColor}` : "none",
        borderRadius: muted ? 12 : 16,
        padding: muted ? "4px 10px" : "5px 12px",
        minHeight: muted ? 28 : 32,
        boxShadow: muted ? "0 1px 3px rgba(0,0,0,0.04)" : "0 2px 6px rgba(0,0,0,0.08)",
        fontSize: muted ? 10 : 11,
        fontWeight: muted ? 400 : 500,
        letterSpacing: "0.01em",
        wordBreak: "keep-all",
        lineHeight: 1.4,
      }}
    >
      {node.type === "exit" && <span className="mr-1 shrink-0" style={{ opacity: muted ? 0.5 : 0.8 }}>✕</span>}
      {node.type === "goal" && <span className="mr-1 shrink-0" style={{ opacity: muted ? 0.5 : 0.8 }}>✓</span>}
      {node.label}
    </div>
  );
}