
import React, { memo } from 'react';
// Correctly import Handle, Position and NodeProps from reactflow
import { Handle, Position, type NodeProps } from 'reactflow';
import { FunnelNodeData } from '../types';
import { NODE_TYPES, CATEGORY_COLORS } from '../constants';
import { useFunnelStore } from '../store';
import { Layers } from 'lucide-react';

const FunnelNode = ({ id, data, selected }: NodeProps<FunnelNodeData>) => {
  const setSelectedNodeId = useFunnelStore((state) => state.setSelectedNodeId);
  
  const nodeConfig = NODE_TYPES.find(n => n.type === data.iconType) || NODE_TYPES[0];
  const Icon = nodeConfig.icon;
  const categoryClass = CATEGORY_COLORS[data.category] || 'border-zinc-800';

  // Logic for dynamic thumbnail
  const isStories = data.iconType === 'instagram_stories';
  const isCarousel = data.iconType === 'instagram_feed';
  const isComplex = isStories || isCarousel;

  let thumbnailToDisplay = data.thumbnail;
  let sequenceCount = data.itemCount || 0;

  if (isStories) {
    thumbnailToDisplay = data.storyItems?.[0]?.image || undefined;
    sequenceCount = data.storyItems?.length || 0;
  } else if (isCarousel) {
    thumbnailToDisplay = data.carouselSlides?.[0]?.image || undefined;
    sequenceCount = data.carouselSlides?.length || 0;
  }

  return (
    <div 
      onClick={() => setSelectedNodeId(id)}
      className={`
        min-w-[200px] max-w-[240px] rounded-xl border bg-[#121212] p-3 transition-all duration-300
        ${selected ? 'border-[#00FF94] shadow-[0_0_20px_rgba(0,255,148,0.3)] scale-105' : `border-zinc-800 ${categoryClass.split(' ')[0]}`}
        hover:border-[#00FF94] group cursor-pointer
      `}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-[#00FF94] !border-2 !border-[#050505] hover:!scale-150 hover:!shadow-[0_0_10px_#00FF94] transition-all" 
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-zinc-900 ${categoryClass.split(' ')[1]}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-bold text-white truncate">{data.label}</h3>
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-50 block">
            {data.category}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Thumbnail Container */}
        <div className={`relative w-full h-24 rounded-lg overflow-hidden border border-zinc-800 mb-2 bg-zinc-900 flex items-center justify-center`}>
          {thumbnailToDisplay ? (
            <img src={thumbnailToDisplay} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center opacity-20">
               <Icon size={24} className="mb-1" />
               <span className="text-[8px] font-bold uppercase tracking-widest">No Preview</span>
            </div>
          )}

          {/* Sequence Badge */}
          {isComplex && sequenceCount > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md border border-[#00FF94]/30 rounded-md shadow-lg">
              <Layers size={10} className="text-[#00FF94]" />
              <span className="text-[9px] font-black text-white italic tracking-tighter">
                {isStories ? `1/${sequenceCount}` : `${sequenceCount} Slides`}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {data.description}
        </p>

        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-500 uppercase tracking-tight">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-[#00FF94] !border-2 !border-[#050505] hover:!scale-150 hover:!shadow-[0_0_10px_#00FF94] transition-all" 
      />
    </div>
  );
};

export default memo(FunnelNode);
