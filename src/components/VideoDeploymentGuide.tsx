import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Subtitles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Copy,
  Download,
  FolderArchive,
  Terminal,
  ShieldCheck,
  Server,
  ExternalLink,
  Laptop,
  Check,
  ArrowRight,
  Eye,
  FileCode,
  Lock,
  Camera,
  Barcode,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  subtitle: string;
  voiceText: string;
  codeSnippet?: string;
  keyTakeaway: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 0,
    title: '1. Architecture & No-Database Advantage',
    startTime: 0,
    duration: 35,
    subtitle: 'StaffSync compiles into static assets. Zero MySQL or PHP setup required on cPanel.',
    voiceText:
      'Welcome to the StaffSync deployment tutorial! In this guide, you will learn how to deploy StaffSync to any shared web hosting space with cPanel in under five minutes. Because StaffSync is a modern single page application, it compiles into static files with zero database configuration.',
    keyTakeaway: 'Static React SPA = No MySQL database, no PHP, lightning fast on any shared host.',
  },
  {
    id: 1,
    title: '2. Local Production Build (npm run build)',
    startTime: 35,
    duration: 40,
    subtitle: 'Run `npm run build` and compress the contents of `dist/` into `dist.zip`.',
    codeSnippet: 'npm run build',
    voiceText:
      'Step one is to compile the production bundle. Open your terminal and run npm run build. Vite will output your optimized files into the dist folder. Select all files inside dist, right-click, and compress them into dist.zip.',
    keyTakeaway: 'Always compress the files inside dist/, not the outer directory itself.',
  },
  {
    id: 2,
    title: '3. Open cPanel & File Manager',
    startTime: 75,
    duration: 40,
    subtitle: 'Log into cPanel, search for File Manager, and navigate to `public_html/`.',
    voiceText:
      'Step two: Log in to your hosting cPanel account. In the top search bar, type File Manager and open it. Double-click into public_html, and remove any default placeholder files from your host.',
    keyTakeaway: 'Use public_html/ for primary domain, or public_html/subfolder for a subdomain.',
  },
  {
    id: 3,
    title: '4. Upload & Extract dist.zip',
    startTime: 115,
    duration: 45,
    subtitle: 'Click Upload, drop `dist.zip`, and extract files directly to `public_html/`.',
    voiceText:
      'Step three: In the top toolbar, click Upload. Drag and drop your dist.zip file. Once the progress bar turns green, return to public_html, right-click dist.zip, and click Extract. Confirm that index.html is directly in public_html.',
    keyTakeaway: 'Ensure index.html is directly inside public_html/ so the site loads on root domain.',
  },
  {
    id: 4,
    title: '5. Verify .htaccess (SPA & HTTPS)',
    startTime: 160,
    duration: 40,
    subtitle: 'Enable "Show Hidden Files" to confirm the `.htaccess` URL rewrite rules.',
    codeSnippet: `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`,
    voiceText:
      'Step four: In cPanel File Manager, click Settings in the top-right corner, check Show Hidden Files, and click Save. Our included htaccess file ensures that browser page refreshes work properly without 404 errors, and forces HTTPS redirection.',
    keyTakeaway: '.htaccess directs all routes to index.html and forces HTTPS.',
  },
  {
    id: 5,
    title: '6. Activate Free SSL (HTTPS)',
    startTime: 200,
    duration: 40,
    subtitle: 'Navigate to SSL/TLS Status in cPanel and click "Run AutoSSL".',
    voiceText:
      'Step five: Modern web browsers strictly block camera access for barcode scanning on unencrypted HTTP. Return to your cPanel dashboard, search for SSL/TLS Status, and click Run AutoSSL. A free SSL certificate with a green padlock will be installed within minutes.',
    keyTakeaway: 'HTTPS is strictly required by browsers for camera barcode permissions.',
  },
  {
    id: 6,
    title: '7. Live Production Verification & Testing',
    startTime: 240,
    duration: 45,
    subtitle: 'Visit your domain, allow camera permissions, test USB barcode gun & camera scanning.',
    voiceText:
      'Step six: Visit your live domain over HTTPS. Click Staff Barcode Terminal. Hold up any staff barcode ID badge or plug in a USB handheld barcode scanner—it works plug and play! Your system is now in production.',
    keyTakeaway: 'USB Barcode Scanners work without drivers; periodic JSON backups safeguard data.',
  },
];

const TOTAL_DURATION = 285; // 4 minutes 45 seconds

export const VideoDeploymentGuide: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState<boolean>(true);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpokenChapterRef = useRef<number>(-1);

  // Find active chapter based on currentTime
  const currentChapter =
    CHAPTERS.find((ch) => currentTime >= ch.startTime && currentTime < ch.startTime + ch.duration) ||
    CHAPTERS[CHAPTERS.length - 1];

  // Playback timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return Math.min(TOTAL_DURATION, prev + 1 * playbackSpeed);
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed]);

  // Speech synthesis for voiceover narration (if enabled)
  useEffect(() => {
    if (voiceAudioEnabled && isPlaying && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (currentChapter.id !== lastSpokenChapterRef.current) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentChapter.voiceText);
        utterance.rate = playbackSpeed;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        lastSpokenChapterRef.current = currentChapter.id;
      }
    } else if (!voiceAudioEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      lastSpokenChapterRef.current = -1;
    }
  }, [currentChapter, voiceAudioEnabled, isPlaying, playbackSpeed]);

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      lastSpokenChapterRef.current = -1;
    }
  };

  const handleTogglePlay = () => {
    if (currentTime >= TOTAL_DURATION) {
      setCurrentTime(0);
      lastSpokenChapterRef.current = -1;
    }
    setIsPlaying(!isPlaying);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDownloadScript = () => {
    const link = document.createElement('a');
    link.href = '/CPANEL_VIDEO_GUIDE.md';
    link.download = 'StaffSync_cPanel_Video_Guide_Script.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      ref={containerRef}
      className={`space-y-4 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto flex flex-col justify-center'
          : 'relative'
      }`}
    >
      {/* Video Player Box */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Top Video Header Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-white">cPanel Deployment Video Masterclass</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">• 1080p 60fps</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadScript}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              title="Download Full Script & Storyboard Markdown"
            >
              <Download className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Download Script (.MD)</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Video'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 16:9 Simulated Video Screen Viewport */}
        <div className="relative aspect-video w-full bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center select-none">
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* CHAPTER 0: ARCHITECTURE OVERVIEW */}
          {currentChapter.id === 0 && (
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold tracking-wider uppercase">
                  Chapter 1: Application Architecture
                </span>
                <span className="text-slate-400 text-xs font-mono">00:00 - 00:35</span>
              </div>

              <div className="space-y-4 max-w-xl mx-auto text-center py-4">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2">
                  <Laptop className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  High-Speed Static Architecture
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  StaffSync builds to pure HTML, JavaScript, and CSS. No PHP scripts to configure, no MySQL databases to provision, and 100% immune to typical database crashes.
                </p>

                {/* Animated Pipeline Diagram */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-mono">
                    React + Vite
                  </span>
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="px-3 py-1.5 rounded-lg bg-indigo-900/60 text-indigo-200 border border-indigo-700 font-mono">
                    dist/ package
                  </span>
                  <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-700 font-mono">
                    cPanel public_html/
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Works on any $2-$5/month shared hosting package (Hostinger, Namecheap, GoDaddy).</span>
                </div>
              </div>
            </div>
          )}

          {/* CHAPTER 1: LOCAL BUILD */}
          {currentChapter.id === 1 && (
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold tracking-wider uppercase">
                  Chapter 2: Production Compilation
                </span>
                <span className="text-slate-400 text-xs font-mono">00:35 - 01:15</span>
              </div>

              {/* Simulated Terminal Window */}
              <div className="max-w-2xl w-full mx-auto bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
                <div className="px-3.5 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-[11px] text-slate-400">terminal — bash</span>
                  </div>
                  <button
                    onClick={() => handleCopy('npm run build', 'clip_build')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'clip_build' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>

                <div className="p-4 space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <span>$</span>
                    <span className="text-white font-bold">npm run build</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">vite v8.3.0 building client environment for production...</div>
                  <div className="text-emerald-400 text-[11px]">✓ 1731 modules transformed.</div>
                  <div className="text-slate-300 text-[11px] pt-1">
                    dist/index.html &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1.42 kB<br />
                    dist/assets/index.css &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 72.51 kB<br />
                    dist/assets/index.js &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1,103.90 kB
                  </div>
                  <div className="text-emerald-400 font-bold pt-1">✓ built in 1.27s</div>
                </div>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-200">
                <span className="font-semibold">Next Action:</span>
                <span>Select all items inside <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white font-mono">dist/</code> and compress into <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white font-mono">dist.zip</code></span>
              </div>
            </div>
          )}

          {/* CHAPTER 2: cPanel File Manager */}
          {currentChapter.id === 2 && (
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold tracking-wider uppercase">
                  Chapter 3: cPanel Navigation
                </span>
                <span className="text-slate-400 text-xs font-mono">01:15 - 01:55</span>
              </div>

              {/* cPanel Dashboard Mockup */}
              <div className="max-w-2xl w-full mx-auto bg-slate-900 rounded-xl border border-slate-700/80 shadow-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-orange-600 font-black text-white text-[10px]">cPanel</span>
                    <span>Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-xs text-slate-300 w-48">
                    <span>🔍</span>
                    <span className="text-white font-mono">File Manager</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-indigo-600/30 border-2 border-indigo-500 text-white flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer shadow-lg animate-pulse">
                    <FolderArchive className="w-6 h-6 text-indigo-400" />
                    <span className="font-bold text-xs">File Manager</span>
                    <span className="text-[10px] text-indigo-300">Click to Open</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 flex flex-col items-center justify-center gap-1.5 text-center opacity-60">
                    <Server className="w-6 h-6" />
                    <span className="text-xs">MySQL Databases</span>
                    <span className="text-[10px] text-slate-500">(Not Needed)</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 flex flex-col items-center justify-center gap-1.5 text-center opacity-60">
                    <Lock className="w-6 h-6" />
                    <span className="text-xs">SSL/TLS Status</span>
                    <span className="text-[10px] text-slate-500">Step 5</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">Directory Target:</span>
                  <code className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">/home/user/public_html</code>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                Tip: Delete any placeholder files (such as <code className="text-slate-300 font-mono">default.html</code>) in <code className="text-slate-300 font-mono">public_html</code> before uploading.
              </div>
            </div>
          )}

          {/* CHAPTER 3: Upload & Extract */}
          {currentChapter.id === 3 && (
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold tracking-wider uppercase">
                  Chapter 4: Upload & Extraction
                </span>
                <span className="text-slate-400 text-xs font-mono">01:55 - 02:40</span>
              </div>

              {/* Upload & Extract Mockup */}
              <div className="max-w-2xl w-full mx-auto space-y-3">
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <FolderArchive className="w-4 h-4 text-indigo-400" />
                      <span>Uploading `dist.zip` to `/public_html`</span>
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">100% Complete</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full w-full animate-pulse" />
                  </div>

                  {/* Extraction Dialog Mockup */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="text-white font-semibold">Extracting archive to:</div>
                      <code className="text-indigo-400 font-mono text-[11px]">/public_html/</code>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-xs">
                      Extract File(s)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>index.html</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>.htaccess</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80 border border-slate-700 text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>assets/</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
                <strong>Critical Rule:</strong> Verify that <code className="font-mono text-white">index.html</code> is directly in <code className="font-mono text-white">public_html/</code>, and not inside a subfolder.
              </div>
            </div>
          )}

          {/* CHAPTER 4: .htaccess Check */}
          {currentChapter.id === 4 && (
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold tracking-wider uppercase">
                  Chapter 5: .htaccess Configuration
                </span>
                <span className="text-slate-400 text-xs font-mono">02:40 - 03:20</span>
              </div>

              {/* Code Editor View */}
              <div className="max-w-2xl w-full mx-auto bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
                <div className="px-3.5 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>/public_html/.htaccess</span>
                  </div>
                  <button
                    onClick={() => handleCopy(currentChapter.codeSnippet || '', 'clip_htaccess')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'clip_htaccess' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Rules</span>
                  </button>
                </div>

                <pre className="p-3.5 text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`}
                </pre>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-amber-200">
                <span>Can't see .htaccess in cPanel? Click <strong>Settings (top right)</strong> &gt; check <strong>Show Hidden Files (dotfiles)</strong>.</span>
              </div>
            </div>
          )}

          {/* CHAPTER 5: SSL Activation */}
          {currentChapter.id === 5 && (
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold tracking-wider uppercase">
                  Chapter 6: HTTPS & SSL Certificate
                </span>
                <span className="text-slate-400 text-xs font-mono">03:20 - 04:00</span>
              </div>

              {/* SSL Status Mockup */}
              <div className="max-w-2xl w-full mx-auto bg-slate-900 rounded-xl border border-slate-700 p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>cPanel SSL / TLS Status</span>
                  </div>
                  <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 animate-pulse">
                    <span>⚡ Run AutoSSL</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-700 flex items-center justify-center text-emerald-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white font-mono">https://yourdomain.com</div>
                      <div className="text-[10px] text-emerald-400">AutoSSL Certificate Valid (Let's Encrypt)</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>

                <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-200 flex items-center gap-2">
                  <Camera className="w-4 h-4 shrink-0 text-rose-400" />
                  <span><strong>Important:</strong> Browsers disable camera barcode readers on unencrypted HTTP. HTTPS is mandatory!</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
                Most cPanel providers (Hostinger, GoDaddy, Namecheap) generate your free SSL certificate within 2 to 5 minutes.
              </div>
            </div>
          )}

          {/* CHAPTER 6: Live Verification */}
          {currentChapter.id === 6 && (
            <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold tracking-wider uppercase">
                  Chapter 7: Production Verification
                </span>
                <span className="text-slate-400 text-xs font-mono">04:00 - 04:45</span>
              </div>

              {/* Live Testing Showcase */}
              <div className="max-w-2xl w-full mx-auto grid grid-cols-2 gap-3">
                <div className="bg-slate-900 rounded-xl border border-slate-700 p-3.5 space-y-2 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-white">Camera Barcode Reader</div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Tested and working with live video feed and audio feedback chimes.
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    ✓ Verified
                  </span>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-700 p-3.5 space-y-2 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-white">USB Barcode Scanner</div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Plug & play laser scanning. No drivers or browser plugins needed.
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    ✓ Verified
                  </span>
                </div>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Deployment Complete! System is fully operational in production.</span>
                </div>
              </div>
            </div>
          )}

          {/* Subtitles Overlay Bar */}
          {subtitlesEnabled && (
            <div className="absolute bottom-3 left-4 right-4 pointer-events-none flex justify-center">
              <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-center max-w-xl shadow-lg transition-all animate-in fade-in duration-150">
                <p className="text-xs sm:text-sm font-medium text-amber-200 leading-snug">
                  {currentChapter.subtitle}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-2">
          {/* Progress Timeline Scrubber */}
          <div className="relative group flex items-center cursor-pointer">
            <input
              type="range"
              min={0}
              max={TOTAL_DURATION}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-3">
              {/* Play / Pause */}
              <button
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-sm"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              {/* Restart */}
              <button
                onClick={() => handleSeek(0)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Restart Video"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Time display */}
              <div className="font-mono text-xs text-slate-400">
                <span className="text-white font-semibold">{formatTime(currentTime)}</span> / {formatTime(TOTAL_DURATION)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Voice narration sound toggle (SpeechSynthesis) */}
              <button
                onClick={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  voiceAudioEnabled
                    ? 'bg-indigo-600/30 border border-indigo-500/50 text-indigo-300'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={voiceAudioEnabled ? 'Voiceover Audio Enabled' : 'Enable Voiceover Audio'}
              >
                {voiceAudioEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-[11px]">{voiceAudioEnabled ? 'Voice On' : 'Voice Off'}</span>
              </button>

              {/* Subtitles (CC) */}
              <button
                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  subtitlesEnabled
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Toggle Captions"
              >
                <Subtitles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">CC</span>
              </button>

              {/* Speed dropdown */}
              <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                <span className="text-[10px] text-slate-400">Speed:</span>
                {[1, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-1 rounded text-[10px] font-mono ${
                      playbackSpeed === spd
                        ? 'text-white font-bold bg-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Selection Bar & Direct Jump List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Video Chapters & Quick Jump
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click any chapter to jump directly to that step
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {CHAPTERS.map((ch) => {
            const isCurrent = currentChapter.id === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => handleSeek(ch.startTime)}
                className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {ch.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatTime(ch.startTime)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {ch.keyTakeaway}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
