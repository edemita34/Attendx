import React, { useState } from 'react';
import {
  Globe,
  Server,
  Cloud,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  X,
  ExternalLink,
  Laptop,
  Terminal,
  FolderArchive,
  ArrowRight,
  PlaySquare,
  Video,
} from 'lucide-react';
import { VideoDeploymentGuide } from './VideoDeploymentGuide';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: GuideTab;
}

export type GuideTab = 'video' | 'cpanel' | 'nginx' | 'cloud' | 'docker' | 'checklist';

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'video',
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>(defaultTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadGuide = () => {
    const link = document.createElement('a');
    link.href = '/DEPLOYMENT_GUIDE.md';
    link.download = 'StaffSync_Deployment_Guide.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadVideoScript = () => {
    const link = document.createElement('a');
    link.href = '/CPANEL_VIDEO_GUIDE.md';
    link.download = 'StaffSync_cPanel_Video_Guide_Script.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const htaccessCode = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Force HTTPS for camera scanner permissions
<IfModule mod_rewrite.c>
  RewriteCond %{HTTPS} !=on
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>`;

  const nginxCode = `server {
    listen 80;
    server_name attendance.yourcompany.com;

    root /var/www/staffsync;
    index index.html;

    # Handle SPA routing so page refreshes work properly
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Web Hosting & Deployment Guide
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Video className="w-2.5 h-2.5" />
                  <span>Video Included</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive video screencast & documentation for cPanel shared hosting, Nginx, or cloud platforms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadVideoScript}
              title="Download Video Script & Storyboard (.MD)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Video Script (.MD)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>Interactive Video Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('cpanel')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'cpanel'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>cPanel / Shared Hosting</span>
          </button>

          <button
            onClick={() => setActiveTab('nginx')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'nginx'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Nginx / Linux VPS</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Netlify & Vercel</span>
          </button>

          <button
            onClick={() => setActiveTab('docker')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'docker'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Docker</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Key Requirements</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* TAB: VIDEO GUIDE */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <VideoDeploymentGuide />
            </div>
          )}

          {/* TAB: cPanel / Shared Hosting */}
          {activeTab === 'cpanel' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-1">
                  How to Deploy to Shared Hosting (Hostinger, Namecheap, GoDaddy, Bluehost, etc.)
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Because StaffSync compiles to a static client bundle, it requires <strong>zero backend databases</strong> and runs lightning-fast on any standard Apache or LiteSpeed shared web hosting package.
                </p>
              </div>

              <ol className="space-y-4 list-decimal list-inside font-medium text-slate-800 dark:text-slate-200">
                <li className="space-y-1.5">
                  <span className="font-bold">Build the static files on your computer:</span>
                  <div className="mt-1 p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs flex items-center justify-between">
                    <code>npm run build</code>
                    <button
                      onClick={() => handleCopy('npm run build', 'build_cmd')}
                      className="text-slate-400 hover:text-white"
                      title="Copy"
                    >
                      {copiedKey === 'build_cmd' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    This creates a <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">dist/</code> folder containing <code className="font-mono">index.html</code>, <code className="font-mono">.htaccess</code>, and the <code className="font-mono">assets/</code> directory.
                  </p>
                </li>

                <li className="space-y-1.5">
                  <span className="font-bold">Log in to your hosting Control Panel (cPanel / hPanel):</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Open <strong>File Manager</strong> and navigate to your public web directory, usually <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">public_html/</code> (or a subdomain directory like <code className="font-mono">public_html/attendance/</code>).
                  </p>
                </li>

                <li className="space-y-1.5">
                  <span className="font-bold">Upload the contents of the `dist/` directory:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Compress the files <em>inside</em> <code className="font-mono">dist/</code> into a zip archive (e.g. <code className="font-mono">dist.zip</code>), upload it to <code className="font-mono">public_html/</code>, and click <strong>Extract</strong>. Ensure <code className="font-mono">index.html</code> is directly in <code className="font-mono">public_html/</code>.
                  </p>
                </li>

                <li className="space-y-1.5">
                  <span className="font-bold">Confirm `.htaccess` is present:</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    The included <code className="font-mono">.htaccess</code> ensures page refreshes work smoothly and forces HTTPS:
                  </p>
                  <div className="relative mt-1">
                    <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                      {htaccessCode}
                    </pre>
                    <button
                      onClick={() => handleCopy(htaccessCode, 'htaccess')}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      title="Copy .htaccess"
                    >
                      {copiedKey === 'htaccess' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </li>

                <li className="space-y-1.5">
                  <span className="font-bold">Enable SSL Certificate (HTTPS):</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Under cPanel &gt; <strong>SSL/TLS Status</strong>, activate free <strong>AutoSSL</strong>. Modern browsers block webcam QR scanners on unencrypted HTTP.
                  </p>
                </li>
              </ol>
            </div>
          )}

          {/* TAB: Nginx / Linux VPS */}
          {activeTab === 'nginx' && (
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                  Nginx Virtual Host Configuration
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Save this configuration in <code className="font-mono">/etc/nginx/sites-available/staffsync</code> and link it to <code className="font-mono">/etc/nginx/sites-enabled/</code>.
                </p>
              </div>

              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {nginxCode}
                </pre>
                <button
                  onClick={() => handleCopy(nginxCode, 'nginx_code')}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  title="Copy Nginx config"
                >
                  {copiedKey === 'nginx_code' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-900 dark:text-white">Quick terminal commands:</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-300 font-mono text-[11px] overflow-x-auto">
{`# Test Nginx and reload
sudo nginx -t && sudo systemctl reload nginx

# Install free Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d attendance.yourcompany.com`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: Netlify & Vercel */}
          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-teal-600" />
                    <span>Netlify (Instant Drag-and-Drop)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    The fastest free deployment method:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <li>Run <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">npm run build</code> locally.</li>
                    <li>Sign into <a href="https://netlify.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">netlify.com</a>.</li>
                    <li>Drag and drop the <code className="font-mono">dist/</code> folder into Netlify.</li>
                    <li>Automatic HTTPS and global CDN configured instantly!</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-indigo-600" />
                    <span>Vercel / Cloudflare Pages</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Automated Git pipeline deployment:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <li>Push code to GitHub or GitLab repository.</li>
                    <li>Import repository in Vercel or Cloudflare dashboard.</li>
                    <li>Set Build Command: <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">npm run build</code>.</li>
                    <li>Set Output Directory: <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded">dist</code>.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Docker */}
          {activeTab === 'docker' && (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400">
                You can containerize StaffSync with a lightweight multi-stage Docker build using Nginx Alpine:
              </p>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`# Multi-stage production Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`}
              </pre>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold">Build and run container:</span>
                <code className="block font-mono text-[11px] bg-slate-900 text-slate-200 p-2 rounded-lg">
                  docker build -t staffsync . && docker run -d -p 8080:80 staffsync
                </code>
              </div>
            </div>
          )}

          {/* TAB: Key Requirements */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                  <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>HTTPS / SSL Mandatory for Camera</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Browsers will disable the webcam QR code scanner on unencrypted HTTP. Always ensure your domain has an active SSL certificate (HTTPS).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>USB Barcode Scanners (Plug & Play)</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Standard USB laser/CCD handheld barcode scanners require no drivers. Simply plug into any kiosk PC or tablet, open the Kiosk Terminal, and scan badges instantly.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-300">
                  Data Backup & Disaster Recovery
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  System state is safely saved in local storage. Administrators can click <strong>Settings &gt; Export JSON</strong> anytime to download a backup file of all staff records, shifts, and attendance logs.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadGuide}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>General Deployment Guide (.MD)</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
