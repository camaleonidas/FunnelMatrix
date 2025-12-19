
import React, { useState, useRef } from 'react';
import { X, Sparkles, Trash2, Tag, Save, Image as ImageIcon, Globe, Upload, ChevronDown, ChevronUp, Layers, Type, MessageSquare, Palette, Eye } from 'lucide-react';
import { useFunnelStore } from '../store';
// Use standard import for GoogleGenAI
import { GoogleGenAI } from "@google/genai";
import { StoryItem, CarouselSlide } from '../types';

const Sidebar = () => {
  const { nodes, edges, setNodes, setEdges, selectedNodeId, setSelectedNodeId, updateNodeData } = useFunnelStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'strategy'>('details');
  const [activePreview, setActivePreview] = useState<{ url: string, title: string } | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemFileInputRef = useRef<{ index: number, type: 'story' | 'slide' } | null>(null);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  if (!selectedNodeId || !selectedNode) return null;

  const isComplexNode = selectedNode.data.iconType === 'instagram_stories' || selectedNode.data.iconType === 'instagram_feed';

  const toggleAccordion = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateNodeData(selectedNodeId, { [name]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (itemFileInputRef.current) {
          const { index, type } = itemFileInputRef.current;
          if (type === 'story') {
            updateStoryField(index, 'image', reader.result as string);
          } else {
            updateCarouselField(index, 'image', reader.result as string);
          }
          itemFileInputRef.current = null;
        } else {
          updateNodeData(selectedNodeId, { thumbnail: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerItemUpload = (index: number, type: 'story' | 'slide') => {
    itemFileInputRef.current = { index, type };
    hiddenFileInput.current?.click();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value.trim();
      if (val) {
        const currentTags = selectedNode.data.tags || [];
        if (!currentTags.includes(val)) {
          updateNodeData(selectedNodeId, { tags: [...currentTags, val] });
        }
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateNodeData(selectedNodeId, { 
      tags: (selectedNode.data.tags || []).filter(t => t !== tagToRemove) 
    });
  };

  const updateStoryCount = (count: number) => {
    const currentItems = selectedNode.data.storyItems || [];
    let nextItems = [...currentItems];
    if (count > nextItems.length) {
      for (let i = nextItems.length; i < count; i++) {
        nextItems.push({ id: `story-${i}`, intention: '', headline: '', script: '', visualDescription: '' });
      }
    } else {
      nextItems = nextItems.slice(0, count);
    }
    updateNodeData(selectedNodeId, { itemCount: count, storyItems: nextItems });
  };

  const updateStoryField = (index: number, field: keyof StoryItem, value: string) => {
    const nextItems = [...(selectedNode.data.storyItems || [])];
    nextItems[index] = { ...nextItems[index], [field]: value };
    updateNodeData(selectedNodeId, { storyItems: nextItems });
  };

  const updateCarouselCount = (count: number) => {
    const currentSlides = selectedNode.data.carouselSlides || [];
    let nextSlides = [...currentSlides];
    if (count > nextSlides.length) {
      for (let i = nextSlides.length; i < count; i++) {
        nextSlides.push({ id: `slide-${i}`, headline: '', content: '', backgroundSuggestion: '' });
      }
    } else {
      nextSlides = nextSlides.slice(0, count);
    }
    updateNodeData(selectedNodeId, { itemCount: count, carouselSlides: nextSlides });
  };

  const updateCarouselField = (index: number, field: keyof CarouselSlide, value: string) => {
    const nextSlides = [...(selectedNode.data.carouselSlides || [])];
    nextSlides[index] = { ...nextSlides[index], [field]: value };
    updateNodeData(selectedNodeId, { carouselSlides: nextSlides });
  };

  const generateAIStrategy = async () => {
    setIsGenerating(true);
    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Como um copywriter sênior de resposta direta, crie uma estratégia curta e um esboço de copy para esta etapa do funil:
        Tipo: ${selectedNode.data.label}
        Descrição: ${selectedNode.data.description}
        Categoria: ${selectedNode.data.category}
        
        Forneça 3 bullet points de gatilhos psicológicos e 1 frase de mensagem central.
        Idioma: Português.
      `;
      
      // Use gemini-3-pro-preview for complex creative text and strategy tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      if (response.text) {
        updateNodeData(selectedNodeId, { strategyNotes: response.text });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteNode = () => {
    setNodes(nodes.filter(n => n.id !== selectedNodeId));
    setEdges(edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };

  const renderComplexForm = () => {
    if (selectedNode.data.iconType === 'instagram_stories') {
      return (
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Quantidade de Stories (1-7)</span>
            <div className="relative">
              <select 
                value={selectedNode.data.itemCount || 1}
                onChange={(e) => updateStoryCount(parseInt(e.target.value))}
                className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00FF94] transition-all appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Stories</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} />
            </div>
          </label>
          <div className="space-y-2">
            {(selectedNode.data.storyItems || []).map((item, idx) => (
              <div key={item.id} className="border border-zinc-800 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[#00FF94] uppercase tracking-widest italic">Story #{idx + 1}</span>
                    {item.image && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#00FF94]/10 rounded-full border border-[#00FF94]/20">
                        <div className="w-1 h-1 rounded-full bg-[#00FF94]" />
                        <span className="text-[8px] text-[#00FF94] font-bold uppercase">Mídia OK</span>
                      </div>
                    )}
                  </div>
                  {openItems[item.id] ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>
                {openItems[item.id] && (
                  <div className="p-4 bg-[#0D0D0D] space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="relative">
                        <Layers size={12} className="absolute left-3 top-3.5 text-zinc-600" />
                        <input 
                          type="text" 
                          placeholder="Construção Invisível"
                          className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#00FF94]"
                          value={item.intention}
                          onChange={(e) => updateStoryField(idx, 'intention', e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Type size={12} className="absolute left-3 top-3.5 text-zinc-600" />
                        <input 
                          type="text" 
                          placeholder="Headline Principal"
                          className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#00FF94]"
                          value={item.headline}
                          onChange={(e) => updateStoryField(idx, 'headline', e.target.value)}
                        />
                      </div>
                      <textarea 
                        placeholder="Roteiro / Texto Falado"
                        rows={2}
                        className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#00FF94] resize-none"
                        value={item.script}
                        onChange={(e) => updateStoryField(idx, 'script', e.target.value)}
                      />
                      <textarea 
                        placeholder="Descrição Visual / Fundo"
                        rows={2}
                        className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#00FF94] resize-none"
                        value={item.visualDescription}
                        onChange={(e) => updateStoryField(idx, 'visualDescription', e.target.value)}
                      />

                      {/* Item Media Area */}
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          onClick={() => triggerItemUpload(idx, 'story')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
                        >
                          <Upload size={12} />
                          {item.image ? 'Trocar Mídia' : 'Add Mídia/Print'}
                        </button>
                        {item.image && (
                          <button 
                            onClick={() => setActivePreview({ url: item.image!, title: `Story #${idx + 1}` })}
                            className="w-10 h-10 bg-zinc-900 border border-[#00FF94]/30 rounded-lg flex items-center justify-center relative group overflow-hidden"
                          >
                            <img src={item.image} className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity" />
                            <Eye size={14} className="absolute text-[#00FF94]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedNode.data.iconType === 'instagram_feed') {
       return (
        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Quantidade de Slides (1-10)</span>
            <div className="relative">
              <select 
                value={selectedNode.data.itemCount || 1}
                onChange={(e) => updateCarouselCount(parseInt(e.target.value))}
                className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00FF94] transition-all appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n} Slides</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={14} />
            </div>
          </label>
          <div className="space-y-2">
            {(selectedNode.data.carouselSlides || []).map((slide, idx) => (
              <div key={slide.id} className="border border-zinc-800 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleAccordion(slide.id)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[#00FF94] uppercase tracking-widest italic">Slide #{idx + 1}</span>
                    {slide.image && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#00FF94]/10 rounded-full border border-[#00FF94]/20">
                        <div className="w-1 h-1 rounded-full bg-[#00FF94]" />
                        <span className="text-[8px] text-[#00FF94] font-bold uppercase">Slide OK</span>
                      </div>
                    )}
                  </div>
                  {openItems[slide.id] ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>
                {openItems[slide.id] && (
                  <div className="p-4 bg-[#0D0D0D] space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="relative">
                        <Type size={12} className="absolute left-3 top-3.5 text-zinc-600" />
                        <input 
                          type="text" 
                          placeholder="Headline do Slide"
                          className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#00FF94]"
                          value={slide.headline}
                          onChange={(e) => updateCarouselField(idx, 'headline', e.target.value)}
                        />
                      </div>
                      <textarea 
                        placeholder="Conteúdo do Slide"
                        rows={2}
                        className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#00FF94] resize-none"
                        value={slide.content}
                        onChange={(e) => updateCarouselField(idx, 'content', e.target.value)}
                      />
                      <div className="relative">
                        <Palette size={12} className="absolute left-3 top-3.5 text-zinc-600" />
                        <input 
                          type="text" 
                          placeholder="Sugestão de Fundo"
                          className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-[#00FF94]"
                          value={slide.backgroundSuggestion}
                          onChange={(e) => updateCarouselField(idx, 'backgroundSuggestion', e.target.value)}
                        />
                      </div>

                      {/* Item Media Area */}
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          onClick={() => triggerItemUpload(idx, 'slide')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
                        >
                          <Upload size={12} />
                          {slide.image ? 'Trocar Mídia' : 'Add Mídia/Print'}
                        </button>
                        {slide.image && (
                          <button 
                            onClick={() => setActivePreview({ url: slide.image!, title: `Slide #${idx + 1}` })}
                            className="w-10 h-10 bg-zinc-900 border border-[#00FF94]/30 rounded-lg flex items-center justify-center relative group overflow-hidden"
                          >
                            <img src={slide.image} className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity" />
                            <Eye size={14} className="absolute text-[#00FF94]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="fixed top-0 right-0 h-full w-[400px] bg-[#0A0A0A] border-l border-zinc-800 z-[100] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#121212]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00FF94]/10 flex items-center justify-center text-[#00FF94]">
              <Save size={18} />
            </div>
            <div>
              <h2 className="text-white font-bold leading-none text-sm">Editor de Nó</h2>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Configuração Técnica</span>
            </div>
          </div>
          <button 
            onClick={() => setSelectedNodeId(null)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-zinc-800 bg-[#0A0A0A]">
          <button 
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'details' ? 'text-[#00FF94] border-b-2 border-[#00FF94]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Detalhes
          </button>
          <button 
            onClick={() => setActiveTab('strategy')}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'strategy' ? 'text-[#00FF94] border-b-2 border-[#00FF94]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Estratégia AI
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === 'details' ? (
            <>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Título do Passo</span>
                  <input 
                    type="text" 
                    name="label"
                    value={selectedNode.data.label}
                    onChange={handleUpdate}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00FF94] transition-all"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Breve Descrição</span>
                  <textarea 
                    name="description"
                    value={selectedNode.data.description}
                    onChange={handleUpdate}
                    rows={2}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00FF94] transition-all resize-none"
                  />
                </label>
              </div>

              {/* DYNAMIC COMPLEX FORM SECTION */}
              {renderComplexForm()}

              {/* Global Visual Preview - Hidden for complex nodes as they have internal media */}
              {!isComplexNode && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Preview Visual (Mock)</span>
                  <div className="bg-[#0D0D0D] border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      {/* Visual Mockup Icon */}
                      <div className="w-16 h-12 bg-zinc-900 border border-zinc-800 rounded flex flex-col overflow-hidden">
                        <div className="h-2 bg-zinc-800 border-b border-zinc-700 flex items-center px-1 gap-0.5">
                          <div className="w-1 h-1 rounded-full bg-zinc-600" />
                          <div className="w-1 h-1 rounded-full bg-zinc-600" />
                          <div className="w-1 h-1 rounded-full bg-zinc-600" />
                        </div>
                        <div className="flex-1 p-1 space-y-1">
                          <div className="h-1 w-2/3 bg-zinc-800 rounded-full" />
                          <div className="h-3 w-full bg-zinc-800 rounded-sm" />
                          <div className="flex gap-1">
                            <div className="h-1 w-1/4 bg-zinc-800 rounded-full" />
                            <div className="h-1 w-1/4 bg-zinc-800 rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* View Button */}
                      <button 
                        disabled={!selectedNode.data.thumbnail}
                        onClick={() => setActivePreview({ url: selectedNode.data.thumbnail!, title: selectedNode.data.label })}
                        className={`
                          flex-1 flex items-center justify-center gap-2 h-12 border rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                          ${selectedNode.data.thumbnail 
                            ? 'border-[#00FF94] text-[#00FF94] hover:bg-[#00FF94]/5 active:scale-95 shadow-[0_0_10px_rgba(0,255,148,0.1)]' 
                            : 'border-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'}
                        `}
                      >
                        <ImageIcon size={16} />
                        Ver Imagem da Página
                      </button>
                    </div>

                    {/* Footer Action */}
                    <div className="text-center pt-2 border-t border-zinc-800/30">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4 decoration-zinc-700"
                      >
                        Alterar Imagem ou URL
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Tags de Classificação</span>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedNode.data.tags?.map((tag) => (
                    <span key={tag} className="flex items-center gap-2 bg-[#121212] border border-zinc-800 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-400">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                  <input 
                    type="text" 
                    placeholder="Pressione Enter para adicionar tag"
                    onKeyDown={handleAddTag}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#00FF94]"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={generateAIStrategy}
                disabled={isGenerating}
                className="w-full group bg-gradient-to-r from-[#00FF94] to-[#22C55E] p-[1px] rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(0,255,148,0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="w-full h-full bg-[#050505] group-hover:bg-[#050505]/80 rounded-[11px] py-4 flex items-center justify-center gap-3 transition-colors">
                  <Sparkles size={18} className={isGenerating ? "animate-spin text-[#00FF94]" : "text-[#00FF94]"} />
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                    {isGenerating ? 'Calculando Estratégia...' : 'Gerar Estratégia com IA'}
                  </span>
                </div>
              </button>

              <div className="bg-[#121212] border border-zinc-800 rounded-xl p-5 min-h-[300px]">
                <div className="flex items-center gap-2 mb-4 text-[#00FF94]">
                  <Sparkles size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Contexto Gerado</span>
                </div>
                <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap font-mono text-[11px]">
                  {selectedNode.data.strategyNotes || "Nenhuma estratégia definida ainda. Use a IA para começar ou escreva aqui seus insights de copy e gatilhos mentais..."}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden input for item-specific uploads */}
        <input 
          type="file" 
          ref={hiddenFileInput}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />

        <div className="p-6 border-t border-zinc-800 bg-[#121212]/50 backdrop-blur-md">
          <button 
            onClick={deleteNode}
            className="w-full flex items-center justify-center gap-2 text-zinc-600 hover:text-red-500 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors"
          >
            <Trash2 size={16} />
            Remover do Mapa
          </button>
        </div>
      </div>

      {/* Lightbox / Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setActivePreview(null)}
          />
          <div className="relative w-full max-w-5xl max-h-full flex flex-col animate-in zoom-in-95 duration-300 pointer-events-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00FF94] shadow-[0_0_10px_#00FF94]" />
                <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">
                  Preview: <span className="text-[#00FF94]">{activePreview.title}</span>
                </h3>
              </div>
              <button 
                onClick={() => setActivePreview(null)}
                className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-white transition-all rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative w-full overflow-hidden rounded-2xl border border-[#00FF94]/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto">
              <img 
                src={activePreview.url} 
                alt="Media Preview" 
                className="w-full max-h-[80vh] object-contain bg-zinc-950"
              />
            </div>

            {/* Footer Tip */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Clique fora da imagem para fechar</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
