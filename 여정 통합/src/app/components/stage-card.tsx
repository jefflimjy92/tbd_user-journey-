import { useState, useRef } from "react";
import { COLORS, type Stage, type JourneyNode, getNodeColor } from "./journey-data";
import { NodePill } from "./node-pill";
import { ChevronDown, ChevronRight, Pencil, GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

export type StageStatus = "past" | "active" | "future" | null;

const DRAG_TYPE_NODE = "JOURNEY_NODE";
const DRAG_TYPE_CHILD = "JOURNEY_CHILD";

interface DragItem {
  nodeId: string;
  stageId: string;
  parentId?: string;
  type: string;
}

interface StageCardProps {
  stage: Stage;
  index: number;
  status?: StageStatus;
  onStageClick?: (index: number) => void;
  editMode?: boolean;
  onNodeEdit?: (nodeId: string, rect: DOMRect) => void;
  onDndReorder?: (
    dragNodeId: string,
    dropNodeId: string,
    dropPosition: "before" | "after",
    dragStageId: string,
    dropStageId: string,
    dragParentId?: string,
    dropParentId?: string,
  ) => void;
}

/* ─── Draggable + Droppable Node Wrapper ─── */
function DraggableNode({
  node,
  stageId,
  parentId,
  editMode,
  onNodeEdit,
  onDndReorder,
  children,
}: {
  node: JourneyNode;
  stageId: string;
  parentId?: string;
  editMode?: boolean;
  onNodeEdit?: (nodeId: string, rect: DOMRect) => void;
  onDndReorder?: StageCardProps["onDndReorder"];
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);

  const dragType = parentId ? DRAG_TYPE_CHILD : DRAG_TYPE_NODE;

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: dragType,
    item: (): DragItem => ({
      nodeId: node.id,
      stageId,
      parentId,
      type: dragType,
    }),
    canDrag: () => !!editMode,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: parentId ? DRAG_TYPE_CHILD : [DRAG_TYPE_NODE, DRAG_TYPE_CHILD],
    canDrop: (item: DragItem) => {
      if (item.nodeId === node.id) return false;
      // Only allow children to drop among same parent's children
      if (item.type === DRAG_TYPE_CHILD && !parentId) return false;
      if (item.type === DRAG_TYPE_CHILD && parentId && item.parentId !== parentId) return false;
      return true;
    },
    hover: (_item, monitor) => {
      if (!ref.current || !monitor.isOver({ shallow: true })) {
        setDropPosition(null);
        return;
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      setDropPosition(hoverClientY < hoverMiddleY ? "before" : "after");
    },
    drop: (item: DragItem) => {
      if (!dropPosition || !onDndReorder) return;
      onDndReorder(
        item.nodeId,
        node.id,
        dropPosition,
        item.stageId,
        stageId,
        item.parentId,
        parentId,
      );
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  // Combine drag and drop refs
  drag(drop(ref));
  dragPreview(ref);

  const showIndicator = isOver && canDrop && dropPosition;

  return (
    <div
      ref={ref}
      className="relative group/node"
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: editMode ? "grab" : "default",
        transition: "opacity 0.15s ease",
      }}
    >
      {/* Drop indicator line - before */}
      {showIndicator === "before" && (
        <div
          className="absolute left-0 right-0 z-10"
          style={{
            top: -2,
            height: 3,
            background: "linear-gradient(90deg, #2563EB, #60A5FA)",
            borderRadius: 2,
            boxShadow: "0 0 6px rgba(37,99,235,0.4)",
          }}
        />
      )}

      {/* Drag handle + content */}
      <div className="flex items-center gap-0.5">
        {editMode && (
          <div
            className="shrink-0 flex items-center justify-center opacity-0 group-hover/node:opacity-60 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            style={{
              width: 16,
              height: 24,
              color: "#94A3B8",
              marginLeft: -4,
            }}
          >
            <GripVertical size={12} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {children}
        </div>
        {editMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const rect = ref.current?.getBoundingClientRect();
              if (rect) onNodeEdit?.(node.id, rect);
            }}
            className="shrink-0 flex items-center justify-center cursor-pointer rounded-full opacity-0 group-hover/node:opacity-100 transition-opacity"
            style={{
              width: 20,
              height: 20,
              background: "#2563EB",
              border: "2px solid white",
              color: "white",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              zIndex: 5,
              marginRight: -4,
            }}
          >
            <Pencil size={9} />
          </button>
        )}
      </div>

      {/* Drop indicator line - after */}
      {showIndicator === "after" && (
        <div
          className="absolute left-0 right-0 z-10"
          style={{
            bottom: -2,
            height: 3,
            background: "linear-gradient(90deg, #2563EB, #60A5FA)",
            borderRadius: 2,
            boxShadow: "0 0 6px rgba(37,99,235,0.4)",
          }}
        />
      )}
    </div>
  );
}

/* ─── Children Group ─── */
function ChildGroup({
  node,
  stageId,
  dimmed,
  editMode,
  onNodeEdit,
  onDndReorder,
}: {
  node: JourneyNode;
  stageId: string;
  dimmed?: boolean;
  editMode?: boolean;
  onNodeEdit?: (nodeId: string, rect: DOMRect) => void;
  onDndReorder?: StageCardProps["onDndReorder"];
}) {
  const [open, setOpen] = useState(true);

  if (!node.children || node.children.length === 0) return null;

  return (
    <div
      className="mt-1"
      style={{
        borderLeft: `2px solid ${getNodeColor(node).bg}40`,
        marginLeft: 8,
        paddingLeft: 10,
        opacity: dimmed ? 0.35 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      {node.groupLabel && (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 mb-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            fontSize: 10,
            color: "#8B9BB5",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: "none",
            border: "none",
            padding: 0,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "left",
          }}
          title={node.groupLabel}
        >
          <span className="shrink-0">{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.groupLabel}</span>
        </button>
      )}
      {open && (
        <div className="flex flex-col gap-1">
          {node.children.map((child) => (
            <DraggableNode
              key={child.id}
              node={child}
              stageId={stageId}
              parentId={node.id}
              editMode={editMode}
              onNodeEdit={onNodeEdit}
              onDndReorder={onDndReorder}
            >
              <NodePill node={child} muted parentNode={node} />
              {child.children && child.children.length > 0 && (
                <ChildGroup
                  node={child}
                  stageId={stageId}
                  dimmed={dimmed}
                  editMode={editMode}
                  onNodeEdit={onNodeEdit}
                  onDndReorder={onDndReorder}
                />
              )}
            </DraggableNode>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Stage Card ─── */
export function StageCard({
  stage,
  index,
  status,
  onStageClick,
  editMode,
  onNodeEdit,
  onDndReorder,
}: StageCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const nodeCount = stage.nodes.reduce((acc, n) => {
    let count = 1;
    if (n.children) count += n.children.length;
    return acc + count;
  }, 0);

  const isActive = status === "active";
  const isFuture = status === "future";
  const isPast = status === "past";

  // Visual styles based on progress status
  const cardOpacity = isFuture ? 0.3 : 1;
  const cardBorder = isActive
    ? "2.5px solid #1B4F8A"
    : editMode
      ? "2px dashed #F59E0B"
      : isPast
        ? "1px solid #CBD5E0"
        : "1px solid #E8EEF5";
  const cardShadow = isActive
    ? "0 4px 24px rgba(27,79,138,0.22), 0 0 0 3px rgba(27,79,138,0.08)"
    : editMode
      ? "0 4px 20px rgba(245,158,11,0.12)"
      : isPast
        ? "0 2px 8px rgba(0,0,0,0.03)"
        : "0 4px 20px rgba(0,0,0,0.07)";
  const cardBg = isFuture ? "#F8FAFC" : COLORS.cardBg;

  return (
    <div
      className="flex flex-col shrink-0 transition-all duration-300"
      style={{
        background: cardBg,
        borderRadius: 16,
        boxShadow: cardShadow,
        padding: "18px 16px 20px",
        width: 260,
        minWidth: 260,
        border: cardBorder,
        opacity: cardOpacity,
        cursor: status !== null ? "pointer" : "default",
        position: "relative",
        filter: isFuture ? "grayscale(0.6)" : "none",
        overflow: "hidden",
      }}
      onClick={() => {
        if (onStageClick) onStageClick(index);
      }}
    >
      {/* Edit mode indicator */}
      {editMode && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "white",
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 6px rgba(245,158,11,0.3)",
          }}
        >
          <GripVertical size={8} />
          드래그로 정렬
        </div>
      )}

      {/* Active indicator badge */}
      {isActive && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full"
          style={{
            background: "#1B4F8A",
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            boxShadow: "0 2px 8px rgba(27,79,138,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#60A5FA",
              display: "inline-block",
              animation: "pulse-dot 1.5s ease-in-out infinite",
            }}
          />
          현재 단계
        </div>
      )}

      {/* Past completed checkmark */}
      {isPast && (
        <div
          className="absolute -top-2.5 right-3 flex items-center justify-center"
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#10B981",
            color: "white",
            fontSize: 11,
            fontWeight: 700,
            boxShadow: "0 2px 6px rgba(16,185,129,0.3)",
          }}
        >
          ✓
        </div>
      )}

      {/* Future lock icon */}
      {isFuture && (
        <div
          className="absolute -top-2.5 right-3 flex items-center justify-center"
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#CBD5E0",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          ⏳
        </div>
      )}

      {/* Stage Label */}
      <div
        className="flex items-center justify-between mb-2"
        style={{
          fontSize: 10,
          color: isPast ? "#94A3B8" : "#94A3B8",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        <span>
          STAGE {index + 1} · {stage.nameEn}
        </span>
        <span
          className="px-1.5 py-0.5 rounded"
          style={{ background: "#F1F5F9", fontSize: 9, color: "#64748B" }}
        >
          {nodeCount} nodes
        </span>
      </div>

      {/* Main Stage Node */}
      <div
        className="flex items-center gap-2 mb-3 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
      >
        <NodePill
          node={{
            id: stage.id,
            label: `${stage.badge} ${stage.name}`,
            type: "mainSpine",
          }}
          isMainStage
        />
        <button
          className="flex items-center justify-center shrink-0 cursor-pointer"
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "#F1F5F9",
            border: "1px solid #E2E8F0",
            color: "#64748B",
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Connector line */}
      {!collapsed && (
        <div
          style={{
            width: 2,
            height: 10,
            backgroundColor: "#CBD5E0",
            marginLeft: 24,
            marginBottom: 6,
            borderRadius: 1,
          }}
        />
      )}

      {/* Sub-nodes */}
      {!collapsed && (
        <div
          className="flex flex-col gap-1.5 pl-1"
          style={{
            opacity: isFuture ? 0.5 : isPast ? 0.7 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          {stage.nodes.map((node) => (
            <DraggableNode
              key={node.id}
              node={node}
              stageId={stage.id}
              editMode={editMode}
              onNodeEdit={onNodeEdit}
              onDndReorder={onDndReorder}
            >
              <NodePill node={node} />
              {node.hasChildren && node.children && (
                <ChildGroup
                  node={node}
                  stageId={stage.id}
                  dimmed={isFuture}
                  editMode={editMode}
                  onNodeEdit={onNodeEdit}
                  onDndReorder={onDndReorder}
                />
              )}
            </DraggableNode>
          ))}
        </div>
      )}

      {/* Inline style for animation */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}