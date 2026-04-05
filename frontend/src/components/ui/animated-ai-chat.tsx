"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import { UploadCloud, Sparkles, XIcon, FileIcon, Home, Server, FileJson, FileCode2, BookOpen, Copy, Check, AlertCircle, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

interface ToolSchema {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    endpoint: string;
    method: string;
}

interface GenerateResponse {
    server_code: string;
    tools: ToolSchema[];
    install_command: string;
    claude_config: Record<string, unknown>;
    readme: string;
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all"
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
}

export function AnimatedAIChat() {
    const [file, setFile] = useState<File | null>(null);
    const [taskDesc, setTaskDesc] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<GenerateResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [serverName, setServerName] = useState("");

    // Instead of complex routing, we use simple location matching for our two pages
    const isReservePage = typeof window !== 'undefined' && window.location.pathname === "/mcp-reserve";

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
=======
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
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/80 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {label ?? (copied ? "Copied!" : "Copy")}
    </button>
  );
}

// (DownloadButton removed in favor of Zip download)

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
          onClick={async () => {
            const zip = new JSZip();
            zip.file(`${serverName}_mcp.py`, result.server_code);
            zip.file(`claude_config.json`, JSON.stringify(result.claude_config, null, 2));
            zip.file(`README.md`, result.readme);
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${serverName}_mcp_bundle.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <Archive className="w-4 h-4" />
          Download ZIP
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
            <div className="flex items-center gap-3">
              <CopyButton text={result.server_code} />
            </div>
          </div>
        <div className="text-xs font-mono text-white/40 truncate">{serverName}_mcp.py</div>
        <pre className="text-[10px] font-mono text-white/30 leading-relaxed overflow-hidden max-h-24 text-ellipsis whitespace-pre-wrap break-all">
          {result.server_code.slice(0, 350)}…
        </pre>
        <div className="text-[10px] text-white/20 mt-auto">
          {result.tools.length} tool{result.tools.length !== 1 ? "s" : ""} generated
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
        <div className="text-[10px] text-white/20 mt-auto font-mono">{result.install_command}</div>
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
          className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-colors relative group"
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
        <div className="w-8 h-8 rounded-full border border-white/20 border-t-white/70 animate-spin" />
        <p className="text-white/30 text-xs">Loading registry…</p>
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
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-white/50 text-sm">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
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
          <Server className="w-10 h-10 text-white/20 group-hover:text-white/60 transition-colors" />
        </div>
        <h2 className="text-2xl font-heading font-medium tracking-tight text-white/90 mb-3">
          No reserves yet
        </h2>
        <p className="text-white/40 text-sm max-w-sm text-center leading-relaxed">
          You currently have no active MCP server reserves. Generate one from the home page.
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
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/40 text-xs">{servers.length} server{servers.length !== 1 ? "s" : ""} in reserve</p>
        <button
          onClick={load}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/70 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>
      {servers.map((srv, i) => (
        <motion.div
          key={srv.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-violet-400/70" />
              <span className="text-sm font-heading font-medium text-white/90">{srv.name}</span>
              <span className="text-[10px] font-mono text-white/25 bg-white/5 px-2 py-0.5 rounded-full">
                {srv.tools_count} tool{srv.tools_count !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-white/40 pl-6 max-w-md truncate">{srv.description}</p>
            <p className="text-[10px] text-white/20 pl-6 font-mono">
              {new Date(srv.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
            </p>
          </div>
          <a
            href={downloadServerUrl(srv.name)}
            download={`${srv.name}_mcp.py`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.05] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white/90 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </a>
        </motion.div>
      ))}
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
>>>>>>> ce7a920e9bb5217749c4c50919cd77f68930a8f0

  const [activeView, setActiveView] = useState<"home" | "reserve">("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

<<<<<<< HEAD
    const handleGenerate = async () => {
        if (!file || !taskDesc.trim()) return;
        setIsGenerating(true);
        setResult(null);
        setError(null);

        try {
            const name = serverName.trim()
                ? serverName.trim().replace(/\s+/g, "_").toLowerCase()
                : file.name.replace(/\.har$/i, "").replace(/\s+/g, "_").toLowerCase();

            const formData = new FormData();
            formData.append("har_file", file);
            formData.append("task_description", taskDesc.trim());
            formData.append("server_name", name);

            const res = await fetch("http://localhost:8000/generate/", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `Server error: ${res.status}`);
            }

            const data: GenerateResponse = await res.json();
            setResult(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadZip = async () => {
        if (!result) return;
        const zip = new JSZip();
        
        const safeName = serverName.trim()
            ? serverName.trim().replace(/\s+/g, "_").toLowerCase()
            : "mcp_server";

        zip.file(`${safeName}.py`, result.server_code);
        zip.file("claude_desktop_config.json", JSON.stringify(result.claude_config, null, 2));
        zip.file("README.md", result.readme);

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${safeName}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
=======
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
>>>>>>> ce7a920e9bb5217749c4c50919cd77f68930a8f0

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

  const canGenerate = !isGenerating && !!file && taskDesc.trim().length > 0 && serverName.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate || !file) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateServer(file, taskDesc.trim(), serverName.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-white/5 bg-white/[0.01] flex flex-col p-6 z-20 shrink-0 transition-all duration-300 relative",
          isSidebarOpen ? "w-64" : "w-20 items-center px-4"
        )}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 bg-neutral-900 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-neutral-800 transition-colors z-30"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
        </button>

        <div className={cn("mb-10", isSidebarOpen ? "pl-2" : "flex justify-center")}>
          <h2 className="text-xl font-heading font-black tracking-widest text-neutral-200 select-none flex items-center">
            <span className={cn(isSidebarOpen ? "block" : "hidden")}>
              MCP<span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">FORGE</span>
            </span>
            <span className={cn(!isSidebarOpen ? "block font-black text-2xl tracking-tighter" : "hidden")}>
              M<span className="text-neutral-500">F</span>
            </span>
          </h2>
        </div>

        <nav className="flex flex-col gap-2 w-full">
          <button
            onClick={() => setActiveView("home")}
            className={cn(
              "flex items-center rounded-xl text-sm font-medium transition-all duration-300 w-full",
              isSidebarOpen ? "px-4 py-3 gap-3 justify-start" : "p-3 justify-center",
              activeView === "home"
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/40 hover:bg-white/5 hover:text-white/80"
            )}
            title={!isSidebarOpen ? "Home" : undefined}
          >
            <Home className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Home</span>}
          </button>
          <button
            onClick={() => setActiveView("reserve")}
            className={cn(
              "flex items-center rounded-xl text-sm font-medium transition-all duration-300 w-full",
              isSidebarOpen ? "px-4 py-3 gap-3 justify-start" : "p-3 justify-center",
              activeView === "reserve"
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/40 hover:bg-white/5 hover:text-white/80"
            )}
            title={!isSidebarOpen ? "MCP Reserve" : undefined}
          >
            <Server className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>MCP Reserve</span>}
          </button>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 relative overflow-y-auto flex flex-col">
        {/* Background ambient effects */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
          <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-fuchsia-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto p-8 flex flex-col gap-10 mt-12 pb-24">
          {/* Header */}
          <motion.div
            className="text-center relative inline-block mx-auto mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl font-heading tracking-[-0.04em] flex items-center justify-center gap-3 select-none">
              <span className="font-light text-neutral-400">MCP</span>
              <span className="font-black bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
                FORGE
              </span>
            </h1>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-px bg-gradient-to-r from-transparent via-neutral-600/60 to-transparent" />
          </motion.div>

          {/* ── Page content ── */}
          {activeView === "reserve" ? (
            <ReservePage />
          ) : (
            <>
              <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                {/* Server name input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
                  className="relative backdrop-blur-3xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-xl px-5 py-3 transition-all focus-within:border-white/20 focus-within:bg-white/[0.03]"
                >
                  <label className="block text-[10px] text-white/30 font-mono mb-1 uppercase tracking-wider">
                    Server name
                  </label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="e.g. github_search"
                    className="w-full bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/25 font-mono"
                    disabled={isGenerating}
                  />
                </motion.div>

                {/* HAR file upload */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className={cn(
                    "relative backdrop-blur-3xl bg-white/[0.02] rounded-3xl border border-white/[0.05] shadow-xl overflow-hidden transition-colors h-[140px]",
                    "hover:bg-white/[0.03]",
                    file ? "border-violet-500/30 bg-violet-500/[0.02]" : ""
                  )}
                >
                  <input
                    type="file"
                    accept=".har"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AnimatePresence mode="popLayout">
                      {file ? (
                        <motion.div
                          key="file"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center gap-2 text-white/90"
                        >
                          <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-300">
                            <FileIcon className="w-5 h-5" />
                          </div>
                          <div className="text-xs font-medium font-mono text-center truncate max-w-[200px]">
                            {file.name}
                          </div>
                          <button
                            className="text-[10px] text-white/40 hover:text-white/90 mt-1 flex items-center gap-1 z-10 relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                            }}
                          >
                            <XIcon className="w-3 h-3" />
                            Remove
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex flex-col items-center gap-3 text-white/40 group"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 relative overflow-hidden backdrop-blur-sm group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-transparent pointer-events-none" />
                                <Server className="w-10 h-10 text-white/20 group-hover:text-white/60 transition-colors" />
                            </div>
                            <h2 className="text-2xl font-heading font-medium tracking-tight text-white/90 mb-3">No reserves available right now</h2>
                            <p className="text-white/40 text-sm max-w-sm text-center leading-relaxed">
                                You currently have no active MCP server reserves. Start by configuring a new reserve on the home page.
                            </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Task description + Generate button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="relative backdrop-blur-3xl bg-white/[0.02] rounded-3xl border border-white/[0.05] shadow-xl p-2 transition-all focus-within:border-white/20 focus-within:bg-white/[0.03] overflow-hidden"
                >
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center gap-4 border border-white/[0.05]"
                      >
                        <div className="w-8 h-8 rounded-full border-[3px] border-white/20 border-t-violet-400 animate-spin" />
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="font-mono text-xs tracking-widest text-violet-200/80 uppercase"
                        >
                          Processing HAR & Generating
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <textarea
                    ref={textareaRef}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder="Describe your task here…"
                    className="w-full min-h-[100px] h-auto resize-y bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-white/30 p-4 leading-relaxed relative z-10"
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between items-center px-2 pb-2 pt-2 relative z-10">
                    <span className="text-[10px] text-white/20 pl-2">{taskDesc.length} chars</span>
                    <motion.button
                      onClick={handleGenerate}
                      disabled={!canGenerate}
                      whileHover={canGenerate ? { scale: 1.02 } : {}}
                      whileTap={canGenerate ? { scale: 0.98 } : {}}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2",
                        isGenerating
                          ? "bg-white/10 text-white/50 cursor-not-allowed"
                          : canGenerate
                          ? "bg-white text-black shadow-lg shadow-white/20 hover:shadow-white/30"
                          : "bg-white/[0.05] text-white/30 cursor-not-allowed"
                      )}
                    >
                      {isGenerating ? (
                        <>
<<<<<<< HEAD
                            <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
                                {/* Error Display */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-xs leading-relaxed"
                                        >
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <p>{error}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* 1. File Upload Box */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                                    className={cn(
                                        "relative backdrop-blur-3xl bg-white/[0.02] rounded-3xl border border-white/[0.05] shadow-xl overflow-hidden transition-colors h-[140px]",
                                        "hover:bg-white/[0.03]",
                                        file ? "border-violet-500/30 bg-violet-500/[0.02]" : ""
                                    )}
                                >
                                    <input
                                        type="file"
                                        accept=".har"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    
                                    <div 
                                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {file ? (
                                                <motion.div 
                                                    key="file"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex flex-col items-center gap-2 text-white/90"
                                                >
                                                    <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-300">
                                                        <FileIcon className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-xs font-medium font-mono text-center truncate max-w-[200px]">
                                                        {file.name}
                                                    </div>
                                                    <button 
                                                        className="text-[10px] text-white/40 hover:text-white/90 mt-1 flex items-center gap-1 z-10 relative"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFile(null);
                                                        }}
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                        Remove
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="empty"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex flex-col items-center gap-3 text-white/40 group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors flex items-center justify-center cursor-pointer">
                                                        <UploadCloud className="w-5 h-5 group-hover:text-white/90 transition-colors" />
                                                    </div>
                                                    <div className="text-xs font-medium">
                                                        Click to attach a .har file
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                {/* 2. Config & Task Description */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                                    className="relative backdrop-blur-3xl bg-white/[0.02] rounded-3xl border border-white/[0.05] shadow-xl p-4 flex flex-col gap-3"
                                >
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-white/30 ml-2">Server Name</label>
                                        <input
                                            type="text"
                                            value={serverName}
                                            onChange={(e) => setServerName(e.target.value)}
                                            placeholder={file ? file.name.replace(/\.har$/i, "").replace(/\s+/g, "_").toLowerCase() : "e.g. my_server"}
                                            className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/10 transition-colors"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5 pt-1">
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-white/30 ml-2">Task Description</label>
                                        <textarea
                                            ref={textareaRef}
                                            value={taskDesc}
                                            onChange={(e) => setTaskDesc(e.target.value)}
                                            placeholder="Describe what this MCP server should do..."
                                            className="w-full min-h-[80px] bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 text-sm text-white/90 focus:outline-none focus:border-white/10 transition-colors resize-none leading-relaxed"
                                            disabled={isGenerating}
                                        />
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] text-white/20 pl-2">
                                            {taskDesc.length} chars
                                        </span>
                                        <motion.button
                                            onClick={handleGenerate}
                                            disabled={isGenerating || (!taskDesc.trim() || !file)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                                                isGenerating 
                                                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                                                    : (taskDesc.trim() && file)
                                                        ? "bg-white text-black shadow-lg shadow-white/20 hover:shadow-white/30"
                                                        : "bg-white/[0.05] text-white/30 cursor-not-allowed"
                                            )}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <div className="w-3 h-3 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                                                    Forging...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3 h-3" />
                                                    Forge Server
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Output Cards */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                                className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
                            >
                                {/* File 1: Python Code */}
                                <div className={cn(
                                    "flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border transition-all relative group h-[160px]",
                                    result ? "border-violet-500/20 bg-violet-500/[0.01]" : "border-white/[0.05] opacity-50"
                                )}>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-300">
                                                <FileCode2 className="w-5 h-5" />
                                            </div>
                                            <div className="font-heading font-medium text-sm">Python Tool</div>
                                        </div>
                                        {result && <CopyButton text={result.server_code} />}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/40 break-all leading-relaxed">
                                        {result ? `${result.tools[0]?.name || "server"}.py` : "Waiting for Forge..."}
                                    </div>
                                    {result && (
                                        <div className="mt-auto flex items-center gap-2">
                                            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                                                {result.tools.length} Tools
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* File 2: Config */}
                                <div className={cn(
                                    "flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border transition-all relative group h-[160px]",
                                    result ? "border-indigo-500/20 bg-indigo-500/[0.01]" : "border-white/[0.05] opacity-50"
                                )}>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-300">
                                                <FileJson className="w-5 h-5" />
                                            </div>
                                            <div className="font-heading font-medium text-sm">Claude Config</div>
                                        </div>
                                        {result && <CopyButton text={JSON.stringify(result.claude_config, null, 2)} />}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/40 break-all leading-relaxed">
                                        {result ? "claude_desktop_config.json" : "Waiting for Forge..."}
                                    </div>
                                    {result && (
                                        <div className="mt-auto px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[9px] font-mono text-white/40 truncate">
                                            {result.install_command}
                                        </div>
                                    )}
                                </div>

                                {/* File 3: README */}
                                <div className={cn(
                                    "flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.02] border transition-all relative group h-[160px]",
                                    result ? "border-fuchsia-500/20 bg-fuchsia-500/[0.01]" : "border-white/[0.05] opacity-50"
                                )}>
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div className="font-heading font-medium text-sm">Guide</div>
                                        </div>
                                        {result && <CopyButton text={result.readme} />}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/40 break-all leading-relaxed">
                                        {result ? "README.md" : "Waiting for Forge..."}
                                    </div>
                                    {result && (
                                        <div className="mt-auto flex items-center gap-2">
                                            <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full font-mono uppercase">
                                                Documentation
                                            </span>
                                        </div>
                                    )}
                                    </div>
                                </motion.div>

                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex justify-center mt-12 pb-20"
                                    >
                                        <button
                                            onClick={handleDownloadZip}
                                            className="flex items-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm shadow-2xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 group"
                                        >
                                            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                                            Download Project Bundle (.zip)
                                        </button>
                                    </motion.div>
                                )}
                            </>
=======
                          <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/80 animate-spin" />
                          Generating...
                        </>
>>>>>>> ce7a920e9bb5217749c4c50919cd77f68930a8f0
                    )}

                </div>
            </main>
        </div>
    );
}
