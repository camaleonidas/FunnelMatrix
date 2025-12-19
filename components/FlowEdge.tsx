
import React, { useState } from 'react';
import {
  getBezierPath,
  EdgeProps,
  EdgeLabelRenderer,
  useReactFlow,
} from 'reactflow';
import { X } from 'lucide-react';

export default function FlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <>
      {/* Interaction Path (Hit Slop): Extra thick invisible path to make hovering easier */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Visible Path: The actual styled line */}
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: isHovered ? 4 : 2,
          stroke: isHovered ? '#00FF94' : '#525252',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          strokeDasharray: isHovered ? '5,5' : '0',
          animation: isHovered ? 'flow 0.5s linear infinite' : 'none',
          pointerEvents: 'none', // Path doesn't block events for the hit-slop or label
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all', // Critical for click registration
            cursor: 'pointer',
            opacity: isHovered ? 1 : 0, // Using opacity instead of removal to prevent flicker
            transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
            zIndex: 1000,
          }}
          className="nodrag nopan"
          onMouseEnter={handleMouseEnter} // Keep edge active when hovering the button
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`
              w-7 h-7 bg-zinc-950 border-2 rounded-full flex items-center justify-center 
              transition-all shadow-xl
              ${isHovered ? 'border-red-500 text-red-500 scale-100' : 'border-zinc-800 text-zinc-600 scale-75'}
              hover:bg-red-500 hover:text-white hover:border-white
            `}
            onClick={onEdgeClick}
            title="Remover conexão"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      </EdgeLabelRenderer>

      <style>{`
        @keyframes flow {
          from {
            stroke-dashoffset: 10;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
}
