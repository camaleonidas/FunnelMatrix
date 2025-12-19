
import React, { useState } from 'react';
import { Plus, ChevronRight, Search } from 'lucide-react';
import { NODE_TYPES, CATEGORY_LABELS, CATEGORY_COLORS } from '../constants';
import { useFunnelStore } from '../store';
import { FunnelNodeData } from '../types';

const Toolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const addNode = useFunnelStore((state) => state.addNode);

  const filteredTypes = NODE_TYPES.filter(t => 
    t.label.toLowerCase().includes(search.toLowerCase()) || 
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const addNewNode = (type: typeof NODE_TYPES[0]) => {
    const id = `${Date.now()}`;
    const newNode = {
      id,
      type: 'funnelNode',
      position: { x: 100 + Math.random() * 400, y: 100 + Math.random() * 400 },
      data: {
        label: type.label,
        description: type.defaultDescription,
        category: type.category,
        iconType: type.type,
        tags: [type.category.toLowerCase()]
      } as FunnelNodeData,
    };
    addNode(newNode);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
      {isOpen && (
        <div className="mb-4 w-[600px] bg-[#0A0A0A] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/50">
            <Search className="text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar tipo de nó (ex: Instagram, Checkout...)"
              className="bg-transparent border-none text-sm text-white focus:outline-none w-full"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(CATEGORY_LABELS).map((cat) => {
                const typesInCat = filteredTypes.filter(t => t.category === cat);
                if (typesInCat.length === 0) return null;

                return (
                  <div key={cat} className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50 pb-2 flex justify-between items-center">
                      {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                      <span className="text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded">{typesInCat.length}</span>
                    </h4>
                    <div className="space-y-1">
                      {typesInCat.map((type) => {
                        const Icon = type.icon;
                        const catColor = CATEGORY_COLORS[type.category].split(' ')[1];
                        return (
                          <button 
                            key={type.type}
                            onClick={() => addNewNode(type)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-[#00FF94]/5 rounded-lg group transition-all"
                          >
                            <div className={`p-1.5 rounded bg-zinc-900 border border-zinc-800 group-hover:border-[#00FF94]/30 ${catColor}`}>
                              <Icon size={14} />
                            </div>
                            <div className="text-left overflow-hidden">
                              <span className="text-xs text-white group-hover:text-[#00FF94] transition-colors block truncate">{type.label}</span>
                            </div>
                            <ChevronRight size={12} className="ml-auto text-zinc-700 opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all
          ${isOpen ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-[#00FF94] text-[#050505] shadow-[0_0_30px_rgba(0,255,148,0.4)] hover:scale-105 active:scale-95'}
        `}
      >
        <Plus size={18} strokeWidth={4} className={isOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
        {isOpen ? 'Fechar Paleta' : 'Adicionar Elemento'}
      </button>
    </div>
  );
};

export default Toolbar;
