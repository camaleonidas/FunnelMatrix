
import React, { useCallback, useRef, useState } from 'react';
// Correctly import ReactFlow and its UI components as named exports
import { 
  ReactFlow,
  Background, 
  Controls, 
  MiniMap, 
  Panel,
  BackgroundVariant
} from 'reactflow';
import { toJpeg } from 'html-to-image';
import { useFunnelStore } from './store';
import FunnelNode from './components/FunnelNode';
import FlowEdge from './components/FlowEdge';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import { Layers, Zap, Loader2, CheckCircle, Download, HelpCircle } from 'lucide-react';

const nodeTypes = {
  funnelNode: FunnelNode,
};

const edgeTypes = {
  default: FlowEdge,
};

function App() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success'>('idle');
  
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect,
    setSelectedNodeId
  } = useFunnelStore();

  const handleExport = useCallback(() => {
    if (!reactFlowWrapper.current) return;

    setExportStatus('exporting');

    setTimeout(() => {
      const flowElement = reactFlowWrapper.current?.querySelector('.react-flow') as HTMLElement;
      if (!flowElement) {
        setExportStatus('idle');
        return;
      }

      toJpeg(flowElement, {
        backgroundColor: '#050505',
        quality: 0.95,
        filter: (node) => {
          const exclusionClasses = ['react-flow__controls', 'react-flow__minimap', 'react-flow__panel'];
          return !exclusionClasses.some(cls => node.classList?.contains(cls));
        }
      })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `funnel-strategy-${new Date().toISOString().slice(0, 10)}.jpg`;
        link.href = dataUrl;
        link.click();
        
        setExportStatus('success');
        setTimeout(() => setExportStatus('idle'), 3000);
      })
      .catch((err) => {
        console.error('Export failed', err);
        setExportStatus('idle');
      });
    }, 100);
  }, []);

  return (
    <div className="w-full h-screen bg-[#050505] relative overflow-hidden flex flex-col">
      {/* Export Toast Notification */}
      {exportStatus !== 'idle' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 duration-300">
          <div className={`
            flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl
            ${exportStatus === 'exporting' 
              ? 'bg-zinc-900/80 border-zinc-700 text-white' 
              : 'bg-[#00FF94]/10 border-[#00FF94]/30 text-[#00FF94]'}
          `}>
            {exportStatus === 'exporting' ? (
              <>
                <Loader2 size={18} className="animate-spin text-[#00FF94]" />
                <span className="text-xs font-black uppercase tracking-widest italic">Processando Mapa...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span className="text-xs font-black uppercase tracking-widest italic">Exportação Concluída!</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header Overlay */}
      <header className="absolute top-0 left-0 w-full z-50 p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#00FF94] flex items-center justify-center shadow-[0_0_30px_rgba(0,255,148,0.3)]">
            <Zap size={28} className="text-[#050505] fill-[#050505]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
              Funnel<span className="text-[#00FF94]">Matrix</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Strategist OS v3.1</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={handleExport}
            disabled={exportStatus === 'exporting'}
            className={`
              px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 group
              ${exportStatus === 'exporting'
                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-zinc-900 border-zinc-800 text-white hover:border-[#00FF94] hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] active:scale-95'}
            `}
          >
            {exportStatus === 'exporting' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
            )}
            {exportStatus === 'exporting' ? 'Exportando' : 'Exportar JPG'}
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div ref={reactFlowWrapper} className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          className="bg-transparent"
        >
          <Background 
            color="#00FF94" 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1} 
            className="opacity-10"
          />

          {/* ZONE: Bottom-Left - Status & Help (m-6 margin) */}
          <Panel position="bottom-left" className="m-6 flex flex-col gap-4 pointer-events-none">
            {/* Flow Status Panel */}
            <div className="bg-[#121212]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Status do Fluxo</div>
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[#00FF94] text-lg font-black leading-tight">{nodes.length}</span>
                  <span className="text-[8px] text-zinc-600 uppercase font-black tracking-tighter">Nós Ativos</span>
                </div>
                <div className="flex flex-col border-l border-zinc-800 pl-6">
                  <span className="text-[#00FF94] text-lg font-black leading-tight">{edges.length}</span>
                  <span className="text-[8px] text-zinc-600 uppercase font-black tracking-tighter">Conexões</span>
                </div>
              </div>
            </div>
            
            {/* Help Button */}
            <button className="flex items-center gap-3 bg-[#121212]/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-zinc-400 hover:text-[#00FF94] hover:border-[#00FF94]/30 transition-all pointer-events-auto group shadow-lg">
              <div className="p-1.5 rounded-lg bg-zinc-900 group-hover:bg-[#00FF94]/10 transition-colors">
                <HelpCircle size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Guia de Atalhos</span>
            </button>
          </Panel>

          {/* ZONE: Bottom-Right - Navigation Controls & MiniMap (m-6 margin) */}
          <Panel position="bottom-right" className="m-6 flex flex-col items-end gap-4 pointer-events-none">
             {/* MiniMap Refined */}
             <div className="pointer-events-auto">
              <MiniMap 
                nodeColor="#00FF94"
                maskColor="rgba(5, 5, 5, 0.8)"
                className="!bg-[#121212]/90 !border-white/10 !rounded-2xl !shadow-[0_8px_32px_rgba(0,0,0,0.5)] !relative !m-0 !w-44 !h-28"
              />
            </div>

            {/* Custom Styled Controls */}
            <div className="pointer-events-auto">
              <Controls 
                showInteractive={false}
                className="!bg-[#121212]/90 !border-white/10 !shadow-[0_8px_32px_rgba(0,0,0,0.5)] !rounded-2xl !p-1 !flex !flex-row !relative !m-0 
                [&_button]:!border-none [&_button]:!bg-transparent [&_button]:!text-zinc-500 [&_button:hover]:!text-[#00FF94] [&_button]:!w-10 [&_button]:!h-10 transition-all" 
              />
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* ZONE: Bottom-Center - Add Element (handled by Toolbar's absolute positioning) */}
      <Toolbar />
      <Sidebar />

      {/* Instructions Backdrop Hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-pulse">
            <Zap className="mx-auto mb-4 text-[#00FF94]/20" size={48} />
            <h2 className="text-zinc-800 text-2xl font-black uppercase italic">Inicie seu Funil</h2>
            <p className="text-zinc-800 text-xs font-bold uppercase tracking-widest">Clique no botão de adicionar abaixo</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
