# StaffSync Web Hosting & Deployment Guide

This guide explains how to deploy the **StaffSync Staff & Attendance Management System** onto any web hosting space (cPanel, shared hosting, Apache, Nginx, Vercel, Netlify, Cloudflare Pages, Docker, or a Linux VPS).

---

## Table of Contents
1. [Application Architecture Overview](#1-application-architecture-overview)
2. [Prerequisites & Build Process](#2-prerequisites--build-process)
3. [Option A: Traditional Shared Hosting / cPanel (Hostinger, Namecheap, GoDaddy, Bluehost)](#3-option-a-traditional-shared-hosting--cpanel)
4. [Option B: Nginx Web Server on Linux VPS (Ubuntu / Debian)](#4-option-b-nginx-web-server-on-linux-vps)
5. [Option C: Free Modern Static Web Hosting (Vercel, Netlify, Cloudflare Pages)](#5-option-c-free-modern-static-web-hosting)
6. [Option D: Docker Container Deployment](#6-option-d-docker-container-deployment)
7. [Crucial Requirements (Camera, HTTPS & USB Scanner)](#7-crucial-requirements-camera-https--usb-scanner)
8. [Data Backup, Persistence & Migration](#8-data-backup-persistence--migration)
9. [Troubleshooting & FAQs](#9-troubleshooting--faqs)

---

## 1. Application Architecture Overview

StaffSync is a high-performance **Single Page Application (SPA)** built with:
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Features**: USB Barcode Scanning (HID Keyboard wedge), Webcam QR Scanner, Staff ID Badge Generator, Real-time Attendance Analytics, Light/Dark Modes, and Print-ready Timesheets.
- **Storage**: Client-side resilient storage (`localStorage`) with built-in full JSON backup and restore capabilities.
- **Build Output**: A folder of static HTML, CSS, JavaScript, and asset files (`dist/`) that can be hosted on **any standard web server or web hosting space without requiring a complex backend database**.

---

## 2. Prerequisites & Build Process

To prepare your application for deployment, generate the production build on your local computer:

### Step 1: Install Dependencies
Open your terminal in the project directory and run:
```bash
npm install
```

### Step 2: Build the Production Bundle
Run the build script:
```bash
npm run build
```

This compiles your application and creates a `dist/` folder containing:
```
dist/
├── index.html
├── .htaccess        (Apache rewrite & HTTPS rules)
├── _redirects       (SPA redirects for Cloudflare/Netlify)
└── assets/
    ├── index-[hash].css
    └── index-[hash].js
```
The files inside the `dist/` directory are the **only files you need to upload to your web hosting space**.

---

## 3. Option A: Traditional Shared Hosting / cPanel

Shared hosting providers (e.g., **Hostinger, Namecheap, GoDaddy, Bluehost, SiteGround, cPanel**) use Apache or LiteSpeed web servers.

### Step-by-Step Instructions:

1. **Log in to your Web Hosting Control Panel** (cPanel / hPanel).
2. **Open the File Manager**:
   - Navigate to the root web directory: `public_html/` (or your subdomain directory, e.g., `public_html/attendance/`).
3. **Delete placeholder files**:
   - If there is a default `default.html` or `index.php` from your hosting company, delete or rename it.
4. **Upload the contents of `dist/`**:
   - *Tip*: Zip the **contents** of your local `dist/` folder into a file called `dist.zip`.
   - Upload `dist.zip` into `public_html/`.
   - Right-click `dist.zip` in cPanel File Manager and select **Extract**.
   - Ensure `index.html` is located directly inside `public_html/` (not inside a nested `public_html/dist/` subfolder).
5. **Verify `.htaccess` is present**:
   - In cPanel File Manager, click **Settings (top right)** -> check **Show Hidden Files (dotfiles)**.
   - You should see `.htaccess`. The provided `.htaccess` includes:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>

     # Force HTTPS for webcam scanner camera permissions
     <IfModule mod_rewrite.c>
       RewriteCond %{HTTPS} !=on
       RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
     </IfModule>
     ```
6. **Enable Free SSL Certificate**:
   - In cPanel, find **SSL/TLS Status** or **Let's Encrypt**.
   - Click **Run AutoSSL** or install a free certificate. *(HTTPS is mandatory for browser camera access).*
7. **Visit your website** at `https://yourdomain.com`!

---

## 4. Option B: Nginx Web Server on Linux VPS

If you run your own Virtual Private Server (VPS) with **Ubuntu / Debian / AlmaLinux** and **Nginx**:

### Step 1: Upload Files
Upload your `dist/` folder to your server:
```bash
scp -r dist/* user@your-server-ip:/var/www/staffsync/
```

### Step 2: Configure Permissions
```bash
sudo chown -R www-data:www-data /var/www/staffsync
sudo chmod -R 755 /var/www/staffsync
```

### Step 3: Configure Nginx Virtual Host
Create or edit `/etc/nginx/sites-available/staffsync`:
```nginx
server {
    listen 80;
    server_name attendance.yourcompany.com;

    root /var/www/staffsync;
    index index.html;

    # Handle SPA routing so page refreshes work properly
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
```

### Step 4: Enable Site and Install SSL
```bash
sudo ln -s /etc/nginx/sites-available/staffsync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install free Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d attendance.yourcompany.com
```

---

## 5. Option C: Free Modern Static Web Hosting

Modern cloud platforms allow zero-maintenance, automated global deployment:

### Netlify:
1. Go to [netlify.com](https://www.netlify.com/) and sign in.
2. Go to **Sites** -> **Add new site** -> **Deploy manually**.
3. Drag and drop the `dist/` folder from your file explorer directly into the Netlify dashboard.
4. Your site will be live instantly with a free SSL certificate.

### Vercel:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel deploy --prod` inside your project root, or connect your GitHub repository in the Vercel web console with build command `npm run build` and output directory `dist`.

### Cloudflare Pages:
1. Log into the Cloudflare dashboard and go to **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your Git repository or drag-and-drop the `dist` folder.
3. Set build command: `npm run build` and build output directory: `dist`.

---

## 6. Option D: Docker Container Deployment

If your company uses Docker or Kubernetes:

### `Dockerfile`:
```dockerfile
# Stage 1: Build the app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t staffsync-app .
docker run -d -p 8080:80 --name staffsync staffsync-app
```
Then access the app at `http://localhost:8080`.

---

## 7. Crucial Requirements (Camera, HTTPS & USB Scanner)

### 1. **HTTPS (SSL) is Required for Camera QR Scanning**
- Modern web browsers (Google Chrome, Safari, Edge, Firefox) **strictly block webcam / camera access** unless the site is served over a secure **HTTPS** connection (or `localhost`).
- Ensure your hosting space has an active SSL certificate. Free certificates are provided by cPanel AutoSSL, Let's Encrypt, or Cloudflare.

### 2. **USB Barcode Scanners (Plug & Play Compatibility)**
- Any standard handheld USB laser/CCD barcode scanner acts as an **HID keyboard wedge**.
- **No drivers or special software are needed**:
  1. Plug the scanner's USB cable (or wireless 2.4GHz dongle) into the computer/terminal running the StaffSync Attendance Kiosk (`/scanner` tab).
  2. The kiosk terminal detects scanner input automatically and performs clock-ins and clock-outs without requiring the user to click into any input field.
  3. Ensure the scanner is set to send a standard `Enter` / carriage-return suffix (the default factory setting on 99% of barcode scanners).

---

## 8. Data Backup, Persistence & Migration

StaffSync stores system records (staff directory, shifts, departments, and clocking logs) in the browser's persistent local storage.

### Best Practices for Enterprise Production:
1. **Periodic JSON Backups**:
   - Navigate to **Settings** -> **Database Storage & Disaster Recovery**.
   - Click **Export JSON** to save a complete snapshot file (e.g., `StaffSync_Database_Backup_2026-09-23.json`).
   - Store these backups on a secure company drive or cloud folder.
2. **Restoring or Moving to Another Computer / Kiosk**:
   - To transfer data to a new terminal or computer, open StaffSync on the new device, navigate to **Settings**, and click **Import JSON** to upload your backup file.
3. **Dedicated Kiosk Mode**:
   - For a reception or hallway tablet/PC, launch the `/scanner` view and press `F11` (or your browser's full-screen shortcut) to create a kiosk terminal.

---

## 9. Troubleshooting & FAQs

### Q: Why do I get a 404 error when I refresh the page on my website?
**A:** This happens if your server is not configured to rewrite URL requests to `index.html`. 
- On **Apache / cPanel**: Ensure the `.htaccess` file was uploaded to `public_html/`.
- On **Nginx**: Ensure your configuration has `try_files $uri $uri/ /index.html;`.

### Q: Why is the camera not opening on the Attendance Kiosk?
**A:** Check the following:
1. Verify that your site URL begins with `https://`.
2. Check browser permissions: click the lock icon in your browser's address bar and make sure "Camera" is set to "Allow".
3. If using an external USB webcam, ensure it is plugged in and not currently being used by another application (like Zoom or Teams).

### Q: Can staff use both the USB scanner and the Camera on the same kiosk?
**A:** Yes! The Attendance Kiosk seamlessly listens to both camera video frames and USB hardware keystrokes simultaneously.
