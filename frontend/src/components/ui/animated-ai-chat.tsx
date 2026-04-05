"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  UploadCloud,
  Sparkles,
  XIcon,
  FileIcon,
  Home,
  Server,
  FileJson,
  FileCode2,
  BookOpen,
  Download,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Archive,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateServer,
  listRegistry,
  downloadServerUrl,
  type GenerateResponse,
  type RegistryServerItem,
} from "@/lib/api";
import JSZip from "jszip";

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      className={cn(
        "flex items-center gap-1 text-[10px] transition-colors p-1.5 rounded-lg bg-white/5",
        copied ? "text-emerald-400" : "text-white/40 hover:text-white/80 hover:bg-white/10"
      )}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {label ?? (copied ? "Copied!" : "Copy")}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Result output cards (rendered after generation)
// ──────────────────────────────────────────────────────────────────────────────

function ResultCards({
  result,
  serverName,
}: {
  result: GenerateResponse;
  serverName: string;
}) {
  const configJson = JSON.stringify(result.claude_config, null, 2);

  const downloadZip = async () => {
    const zip = new JSZip();
    const safeName = serverName.trim().replace(/\s+/g, "_").toLowerCase() || "mcp_server";
    
    zip.file(`${safeName}_mcp.py`, result.server_code);
    zip.file(`claude_config.json`, configJson);
    zip.file(`README.md`, result.readme);
    
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}_mcp_bundle.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full flex flex-col gap-6 mt-6"
    >
      <div className="flex items-center justify-between w-full mb-2">
        <h3 className="text-white/80 font-heading font-medium tracking-wide text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          Generation Complete
        </h3>
        <button
          onClick={downloadZip}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-white/10 text-white rounded-xl text-xs font-bold transition-all shadow-xl shadow-indigo-500/20"
        >
          <Archive className="w-4 h-4" />
          Download ZIP Bundle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1 — Python server file */}
        <div className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.03] transition-colors relative group min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-300">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div className="font-heading font-medium text-sm">The AI Tool</div>
            </div>
            <CopyButton text={result.server_code} />
          </div>
          <div className="text-xs font-mono text-white/40 truncate">{serverName}_mcp.py</div>
          <pre className="text-[10px] font-mono text-white/30 leading-relaxed overflow-hidden max-h-24 text-ellipsis whitespace-pre-wrap break-all">
            {result.server_code.slice(0, 350)}…
          </pre>
          <div className="text-[10px] text-white/20 mt-auto flex items-center gap-2">
             <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                {result.tools.length} Tools
             </span>
          </div>
        </div>

        {/* Card 2 — Claude config */}
        <div className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.03] transition-colors relative group min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-300">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="font-heading font-medium text-sm">The Config</div>
            </div>
            <CopyButton text={configJson} />
          </div>
          <div className="text-xs font-mono text-white/40 truncate">claude_config.json</div>
          <pre className="text-[10px] font-mono text-white/30 leading-relaxed overflow-hidden max-h-24 whitespace-pre-wrap break-all">
            {configJson.slice(0, 350)}…
          </pre>
          <div className="text-[9px] text-white/20 mt-auto px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg font-mono truncate">
            {result.install_command}
          </div>
        </div>

        {/* Card 3 — README */}
        <div className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.03] transition-colors relative group min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="font-heading font-medium text-sm">The README</div>
            </div>
            <CopyButton text={result.readme} />
          </div>
          <div className="text-xs font-mono text-white/40 truncate">README.md</div>
          <p className="text-[10px] text-white/30 leading-relaxed overflow-hidden max-h-24 whitespace-pre-wrap break-all">
            {result.readme.slice(0, 350)}…
          </p>
          <div className="mt-auto flex items-center gap-2">
              <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full font-mono uppercase">
                  Documentation
              </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Empty placeholder cards (before any generation)
// ──────────────────────────────────────────────────────────────────────────────

function PlaceholderCards() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
    >
      {[
        { icon: <FileCode2 className="w-5 h-5" />, label: "File 1 — The AI Tool", filename: "*.py", accent: "violet" as const },
        { icon: <FileJson className="w-5 h-5" />, label: "File 2 — The Config", filename: "claude_config.json", accent: "indigo" as const },
        { icon: <BookOpen className="w-5 h-5" />, label: "File 3 — The README", filename: "README.md", accent: "fuchsia" as const },
      ].map(({ icon, label, filename, accent }) => (
        <div
          key={label}
          className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-colors relative group opacity-50"
        >
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none bg-gradient-to-br to-transparent",
            accent === "violet" && "from-violet-500/5",
            accent === "indigo" && "from-indigo-500/5",
            accent === "fuchsia" && "from-fuchsia-500/5",
          )} />
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className={cn(
              "p-2 rounded-xl",
              accent === "violet" && "bg-violet-500/10 text-violet-300",
              accent === "indigo" && "bg-indigo-500/10 text-indigo-300",
              accent === "fuchsia" && "bg-fuchsia-500/10 text-fuchsia-300",
            )}>{icon}</div>
            <div className="font-heading font-medium text-sm">{label}</div>
          </div>
          <div className="text-xs font-mono text-white/40 truncate">{filename}</div>
          <div className="text-[10px] text-white/20 mt-auto">Waiting for Forge...</div>
        </div>
      ))}
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Registry page
// ──────────────────────────────────────────────────────────────────────────────

function ReservePage() {
  const [servers, setServers] = useState<RegistryServerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRegistry();
      setServers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center w-full min-h-[260px] gap-4 mt-10"
      >
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
        <p className="text-white/30 text-xs font-mono tracking-widest uppercase">Scanning Reserves…</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center w-full min-h-[260px] gap-4 mt-10"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-red-400/70 text-sm font-medium">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white/60 hover:text-white transition-all border border-white/5"
        >
          <RefreshCw className="w-3 h-3" />
          Reconnect
        </button>
      </motion.div>
    );
  }

  if (servers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="flex flex-col items-center justify-center w-full min-h-[300px] mt-10"
      >
        <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 relative overflow-hidden backdrop-blur-sm group">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent pointer-events-none" />
          <Server className="w-10 h-10 text-white/10 group-hover:text-violet-400/50 transition-colors duration-700" />
        </div>
        <h2 className="text-2xl font-heading font-medium tracking-tight text-white/90 mb-3">
          The Vault is Empty
        </h2>
        <p className="text-white/30 text-sm max-w-sm text-center leading-relaxed">
          You haven't forged any MCP servers yet. Head back to the Home page to start your first project.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-4 mt-6"
    >
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <div className="flex flex-col">
           <h2 className="text-xl font-heading font-medium text-white/90">MCP Reserve</h2>
           <p className="text-white/30 text-[10px] uppercase font-mono tracking-widest mt-0.5">
             {servers.length} secure toolsets detected
           </p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {servers.map((srv, i) => (
          <motion.div
            key={srv.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
            <div className="flex flex-col gap-1 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-600/10 text-violet-400 group-hover:scale-110 transition-transform">
                   <Server className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-3">
                   <span className="text-sm font-heading font-medium text-white/90">{srv.name}</span>
                   <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                     {srv.tools_count} tool{srv.tools_count !== 1 ? "s" : ""}
                   </span>
                </div>
              </div>
              <p className="text-xs text-white/40 pl-11 max-w-md truncate">{srv.description || "Experimental MCP tool collection."}</p>
              <div className="flex items-center gap-2 pl-11 mt-1">
                 <span className="text-[9px] text-white/15 font-mono">
                    {new Date(srv.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                 </span>
              </div>
            </div>
            <a
              href={downloadServerUrl(srv.name)}
              download={`${srv.name}_mcp.py`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white shrink-0 z-10"
            >
              <Download className="w-3.5 h-3.5" />
              Fetch Script
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

export function AnimatedAIChat() {
  const [file, setFile] = useState<File | null>(null);
  const [taskDesc, setTaskDesc] = useState("");
  const [serverName, setServerName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"home" | "reserve">("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-populate server name from filename
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!serverName) {
        setServerName(f.name.replace(/\.har$/i, "").replace(/[^a-z0-9_-]/gi, "_").toLowerCase());
      }
    }
  };

  const handleGenerate = async () => {
    if (!file || !taskDesc.trim() || !serverName.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await generateServer(file, taskDesc.trim(), serverName.trim());
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = !isGenerating && !!file && taskDesc.trim().length > 0 && serverName.trim().length > 0;

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden selection:bg-violet-500/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-white/5 bg-white/[0.01] flex flex-col p-6 z-30 shrink-0 transition-all duration-500 relative",
          isSidebarOpen ? "w-64" : "w-20 items-center px-4"
        )}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-10 w-6 h-6 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all z-40 hover:scale-110 active:scale-90 shadow-2xl"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-3 h-3" /> : <PanelLeftOpen className="w-3 h-3" />}
        </button>

        <div className={cn("mb-12", isSidebarOpen ? "pl-2" : "flex justify-center")}>
          <h2 className="text-xl font-heading font-black tracking-widest select-none flex items-center">
            <span className={cn(isSidebarOpen ? "block" : "hidden")}>
                <span className="text-white">MCP</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/40 to-white/10 font-light">FORGE</span>
            </span>
            <span className={cn(!isSidebarOpen ? "block font-black text-2xl tracking-tighter text-white" : "hidden")}>
              M<span className="text-white/20">F</span>
            </span>
          </h2>
        </div>

        <nav className="flex flex-col gap-2 w-full">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "reserve", icon: Server, label: "MCP Reserve" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={cn(
                  "flex items-center rounded-2xl text-[13px] font-medium transition-all duration-400 w-full group overflow-hidden relative",
                  isSidebarOpen ? "px-4 py-3.5 gap-3.5 justify-start" : "p-3.5 justify-center",
                  isActive
                    ? "bg-white/10 text-white shadow-[0_0_20px_-10px_rgba(255,255,255,0.3)]"
                    : "text-white/30 hover:text-white/70"
                )}
                title={!isSidebarOpen ? item.label : undefined}
              >
                {isActive && (
                    <motion.div 
                        layoutId="nav-bg"
                        className="absolute inset-0 bg-white/5 pointer-events-none"
                    />
                )}
                <Icon className={cn(
                    "w-4 h-4 shrink-0 transition-all duration-500",
                    isActive ? "text-violet-400 scale-110" : "group-hover:text-white/80"
                )} />
                {isSidebarOpen && <span className="z-10">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-white/5 opacity-40">
           <div className={cn("flex flex-col gap-4", !isSidebarOpen && "items-center")}>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    className="h-full bg-white/20"
                 />
              </div>
              {isSidebarOpen && <span className="text-[10px] font-mono tracking-tighter text-white/50">V 1.0.4 — STABLE</span>}
           </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-[#050505]">
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
             style={{ backgroundImage: "linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        
        {/* Background ambient effects */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full mix-blend-normal filter blur-[120px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-normal filter blur-[120px] animate-pulse delay-700 pointer-events-none" />
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
           <div className="w-full max-w-4xl mx-auto p-8 flex flex-col gap-12 mt-12 pb-32">
              {/* Header */}
              <motion.div
                className="text-center relative inline-block mx-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                   <span className="text-[9px] font-black tracking-[0.2em] text-violet-400 uppercase">Automated Integration</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-heading tracking-[-0.05em] flex items-center justify-center gap-4 select-none">
                  <span className="text-white">MCP</span>
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                    FORGE
                  </span>
                </h1>
                <p className="mt-4 text-white/30 text-sm font-medium tracking-wide max-w-md mx-auto leading-relaxed">
                  Transform API traffic into secure, high-performance MCP server tools in seconds.
                </p>
                <div className="mt-8 flex items-center justify-center gap-8">
                   <div className="h-px w-20 bg-gradient-to-r from-transparent to-white/10" />
                   <Sparkles className="w-4 h-4 text-white/10" />
                   <div className="h-px w-20 bg-gradient-to-l from-transparent to-white/10" />
                </div>
              </motion.div>

              {/* ── Page content ── */}
              <AnimatePresence mode="wait">
                 {activeView === "reserve" ? (
                    <motion.div 
                        key="reserve"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                    >
                        <ReservePage />
                    </motion.div>
                 ) : (
                    <motion.div 
                        key="home"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col gap-6 w-full max-w-xl mx-auto mt-4"
                    >
                        {/* Server name input */}
                        <div className="relative group">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative backdrop-blur-3xl bg-white/[0.02] rounded-2xl border border-white/5 p-5 shadow-2xl transition-all focus-within:border-white/20 focus-within:bg-white/[0.04]"
                          >
                            <label className="block text-[10px] text-white/25 font-bold uppercase tracking-[0.1em] mb-2 pointer-events-none">
                              Identify your server
                            </label>
                            <input
                              type="text"
                              value={serverName}
                              onChange={(e) => setServerName(e.target.value)}
                              placeholder="e.g. synapse_collector"
                              className="w-full bg-transparent border-none text-white text-lg font-medium focus:outline-none placeholder:text-white/10"
                              disabled={isGenerating}
                            />
                          </motion.div>
                        </div>

                        {/* HAR file upload & Task Desc unified container */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4"
                        >
                            {/* File Upload (Left-ish) */}
                            <div className="md:col-span-5 relative group h-[180px]">
                                <input
                                    type="file"
                                    accept=".har"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <div
                                    className={cn(
                                        "w-full h-full rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-6 gap-3",
                                        file 
                                            ? "bg-violet-600/[0.05] border-violet-500/30" 
                                            : "bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                                        file ? "bg-violet-600/20 text-violet-400" : "bg-white/5 text-white/20 group-hover:text-white/40"
                                    )}>
                                        {file ? <FileIcon className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                                    </div>
                                    <div className="text-center">
                                         <p className="text-[11px] font-bold text-white/60 truncate max-w-[140px]">
                                             {file ? file.name : "Attach .HAR data"}
                                         </p>
                                         <p className="text-[9px] text-white/20 uppercase tracking-widest mt-1">
                                             {file ? "Traffic Detected" : "Network Logs"}
                                         </p>
                                    </div>
                                    {file && (
                                        <button 
                                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white/20 hover:text-white/80 hover:bg-red-500/20 transition-all"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Task Description (Right-ish) */}
                            <div className="md:col-span-7 relative group h-[180px]">
                                <div className="absolute inset-x-0 bottom-0 top-0 rounded-2xl bg-white/[0.02] border border-white/5 focus-within:border-white/20 focus-within:bg-white/[0.04] transition-all p-5">
                                    <label className="block text-[10px] text-white/25 font-bold uppercase tracking-[0.1em] mb-2">
                                      Objectives
                                    </label>
                                    <textarea
                                        ref={textareaRef}
                                        value={taskDesc}
                                        onChange={(e) => setTaskDesc(e.target.value)}
                                        placeholder="What logic should I extract?"
                                        className="w-full h-[100px] bg-transparent border-none text-white/80 text-sm focus:outline-none placeholder:text-white/10 resize-none leading-relaxed overflow-y-auto custom-scrollbar"
                                        disabled={isGenerating}
                                    />
                                    <div className="absolute bottom-4 right-5 text-[9px] font-mono text-white/10">
                                       {taskDesc.length} CHARS
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Forge Button */}
                        <div className="mt-4 flex flex-col items-center gap-8">
                             <motion.button
                                onClick={handleGenerate}
                                disabled={!canGenerate}
                                whileHover={canGenerate ? { scale: 1.02, y: -2 } : {}}
                                whileTap={canGenerate ? { scale: 0.98 } : {}}
                                className={cn(
                                    "w-full py-5 rounded-2xl font-black text-sm tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-4 relative overflow-hidden group",
                                    isGenerating
                                      ? "bg-white/10 text-white/20 cursor-not-allowed"
                                      : canGenerate
                                      ? "bg-white text-black shadow-[0_20px_40px_-15px_rgba(255,255,255,0.4)]"
                                      : "bg-white/[0.03] text-white/10 cursor-not-allowed border border-white/5"
                                )}
                              >
                                {isGenerating ? (
                                  <>
                                    <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-white animate-spin" />
                                    <span>Forging Architecture...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className={cn("w-5 h-5 transition-transform group-hover:rotate-12", !canGenerate && "opacity-20")} />
                                    <span>Forge MCP Server</span>
                                  </>
                                )}
                                
                                {canGenerate && !isGenerating && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                )}
                              </motion.button>

                              {/* Error display */}
                              <AnimatePresence>
                                {error && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="w-full flex items-start gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/20"
                                  >
                                    <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                                       <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                       <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Forge Failure</span>
                                       <p className="text-[11px] text-red-300/70 leading-relaxed">{error}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Result section */}
                              <div className="w-full">
                                {result ? (
                                    <ResultCards result={result} serverName={serverName} />
                                ) : (
                                    <PlaceholderCards />
                                )}
                              </div>
                        </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </main>
    </div>
  );
}
