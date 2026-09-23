# StaffSync cPanel Shared Hosting Video Deployment Guide
**Format:** Full Screencast Video Tutorial & Storyboard  
**Target Duration:** ~4 Minutes 45 Seconds  
**Resolution:** 1080p 60fps / 4K  
**Prerequisites:** Node.js installed locally, standard cPanel or shared hosting account (Hostinger, Namecheap, GoDaddy, Bluehost, etc.).

---

## Video Chapter Timestamps

| Timestamp | Chapter Title | Key Action |
|---|---|---|
| **00:00 - 00:35** | Chapter 1: Introduction & Architecture | Overview of static SPA architecture & zero database requirement |
| **00:35 - 01:15** | Chapter 2: Local Production Build | Running `npm run build` and packaging `dist.zip` |
| **01:15 - 01:55** | Chapter 3: Navigating cPanel File Manager | Logging into cPanel and opening `public_html/` |
| **01:55 - 02:40** | Chapter 4: Uploading & Extracting Files | Uploading `dist.zip` and extracting directly to root |
| **02:40 - 03:20** | Chapter 5: Configuring `.htaccess` | Ensuring SPA URL rewrite & HTTPS redirection rules |
| **03:20 - 04:00** | Chapter 6: Activating Free SSL (HTTPS) | Enabling cPanel AutoSSL / Let's Encrypt for camera access |
| **04:00 - 04:45** | Chapter 7: Live Verification & Testing | Testing Kiosk, USB Barcode Scanner, and Camera QR scanner |

---

## Detailed Scene-by-Scene Script & Storyboard

### Chapter 1: Introduction & Architecture (00:00 - 00:35)
**Visual on Screen:**
- Title Card: *"StaffSync Deployment Masterclass: How to Deploy to cPanel Shared Hosting"*.
- Transition to clean diagram showing:
  - `Code (React + Vite)` ➔ `npm run build` ➔ `dist/ static package` ➔ `cPanel public_html/` ➔ `End Users & Kiosk Terminals`.
- Callout banner: **"Zero MySQL or PHP required • 100% Static Client-Side Speed"**.

**Narrator / Voiceover:**
> *"Welcome to the StaffSync deployment tutorial! In this guide, you will learn how to deploy the StaffSync Staff and Attendance Management System onto any shared web hosting space powered by cPanel, such as Hostinger, Namecheap, GoDaddy, or Bluehost.*
>
> *Because StaffSync is built as a modern, high-performance Single Page Application, it compiles into completely static HTML, JavaScript, and CSS files. That means you do NOT need to configure complex MySQL databases, PHP runtimes, or backend servers. Let's get started!"*

---

### Chapter 2: Local Production Build (00:35 - 01:15)
**Visual on Screen:**
- VS Code or Terminal window.
- Terminal typing command: `npm run build`.
- Fast scrolling build output showing:
  ```bash
  vite v8.3.0 building client environment for production...
  ✓ 1731 modules transformed.
  dist/index.html                   1.42 kB
  dist/assets/index.css            72.51 kB
  dist/assets/index.js           1,103.90 kB
  ✓ built in 1.27s
  ```
- File Explorer opens displaying the `dist/` directory contents:
  - `index.html`
  - `.htaccess`
  - `_redirects`
  - `assets/` folder
- Mouse selects all items *inside* `dist/`, right-clicks, and creates `dist.zip`.
- **Warning Callout:** *"Important: Zip the contents INSIDE the dist folder, not the outer folder itself."*

**Narrator / Voiceover:**
> *"Step one is to compile the production build on your computer. Open your terminal in the project root and run `npm run build`.*
>
> *In just a few seconds, Vite compiles your optimized bundle into the `dist` folder. When you open this folder, you will see `index.html`, our pre-configured `.htaccess` file, and an `assets` folder.*
>
> *Select all files inside `dist`, right-click, and compress them into a zip file named `dist.zip`. This single file is all we need to upload."*

---

### Chapter 3: Navigating cPanel File Manager (01:15 - 01:55)
**Visual on Screen:**
- Browser opens to cPanel login page (`https://yourdomain.com:2083`).
- User enters credentials and lands on the cPanel Dashboard.
- Mouse moves to the top search bar, types **"File Manager"**, and clicks the icon.
- File Manager tree opens on the left. Mouse double-clicks into `public_html/`.
- Screen zooms in to show any default hosting placeholder files (like `default.html` or `index.php`).
- Mouse highlights them and clicks **"Delete"** in the top toolbar.

**Narrator / Voiceover:**
> *"Step two: Log in to your hosting cPanel dashboard. In the search bar at the top, type 'File Manager' and open it.*
>
> *In the left sidebar, double-click into your web directory—usually `public_html`. If you are installing to a subdomain, like `attendance.yourcompany.com`, open that subdomain's folder instead.*
>
> *If your hosting provider created default placeholder files like `default.html`, delete them now so our application has a clean directory."*

---

### Chapter 4: Uploading & Extracting Files (01:55 - 02:40)
**Visual on Screen:**
- In cPanel File Manager, mouse clicks the **"Upload"** button on the top toolbar.
- A new tab opens with the cPanel File Upload dropzone.
- User drags and drops `dist.zip` into the window. Progress bar reaches 100% and turns green.
- User clicks *"Go Back to /public_html"*.
- Back in `public_html`, `dist.zip` is now visible.
- User right-clicks `dist.zip` and selects **"Extract"**.
- Extraction confirmation modal appears showing path `/public_html`. User clicks **"Extract File(s)"**.
- Files appear: `index.html`, `assets/`, `.htaccess`.
- User right-clicks `dist.zip` and deletes it to keep the directory tidy.

**Narrator / Voiceover:**
> *"Step three: In the top toolbar, click 'Upload'. Drag and drop your `dist.zip` file into the upload window. Once the progress bar turns green at 100%, click 'Go Back to public_html'.*
>
> *Right-click `dist.zip` and click 'Extract'. Confirm extraction to `public_html`. Make sure `index.html` is situated directly inside `public_html`, and not inside an extra nested folder. You can now delete the zip file."*

---

### Chapter 5: Configuring `.htaccess` (02:40 - 03:20)
**Visual on Screen:**
- In cPanel File Manager, mouse clicks **"Settings"** in the top-right corner.
- Modal opens: User checks **"Show Hidden Files (dotfiles)"** and clicks **Save**.
- The `.htaccess` file appears in the list.
- User right-clicks `.htaccess` and chooses **"Edit"**.
- Code Editor displays the Apache rewrite directives:
  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>

  # Force HTTPS for camera permissions
  <IfModule mod_rewrite.c>
    RewriteCond %{HTTPS} !=on
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  </IfModule>
  ```
- Highlight box around the URL rewrite rule and HTTPS redirect rule.
- User clicks **"Save Changes"**.

**Narrator / Voiceover:**
> *"Step four: Verify your `.htaccess` file. In cPanel File Manager, click 'Settings' at the top right, make sure 'Show Hidden Files' is checked, and click Save.*
>
> *Our project includes a pre-configured `.htaccess` file. This does two crucial jobs: first, it redirects all route requests to `index.html`, so users never see a 404 error when refreshing the browser. Second, it automatically enforces HTTPS redirection, which is required for camera permissions."*

---

### Chapter 6: Activating Free SSL / HTTPS (03:20 - 04:00)
**Visual on Screen:**
- Browser returns to main cPanel Dashboard.
- Search box filters for **"SSL/TLS Status"**.
- User clicks into **"SSL/TLS Status"**.
- Table of domains is shown with pending or active certificates.
- User clicks the blue **"Run AutoSSL"** button at the top.
- Status spinner runs, then changes to a green padlock badge next to the domain name.
- Callout: **"Camera Security Requirement: Modern browsers will block webcam QR scanning unless the site uses HTTPS."**

**Narrator / Voiceover:**
> *"Step five: Ensure SSL encryption is enabled. Return to your cPanel dashboard, search for 'SSL/TLS Status', and click 'Run AutoSSL'.*
>
> *Within a couple of minutes, a free Let's Encrypt or Sectigo certificate is applied with a green padlock. This step is mandatory because modern web browsers block webcam access for QR code scanning on insecure HTTP connections."*

---

### Chapter 7: Live Verification & Testing (04:00 - 04:45)
**Visual on Screen:**
- Browser navigates to `https://yourcompany.com`.
- The StaffSync Dashboard loads instantly in pristine dark mode with live metric counters.
- User clicks **"Attendance Kiosk / Scan QR"** tab.
- Browser shows native camera permission popup: User clicks **"Allow"**.
- Webcam feed activates showing the target scanning reticle.
- User tests an employee ID badge with QR code: instant chime sound, green confirmation card appears with staff photo, punch time, and status.
- Next, user tests a handheld USB barcode scanner: a quick laser flash on the badge's 1D barcode instantly registers the clock-out!
- User clicks **"Settings"** -> **"Export JSON"** to demonstrate backup capabilities.
- Final Card: *"Deployment Complete! StaffSync is live in production."*

**Narrator / Voiceover:**
> *"Step six: Test your production system! Navigate to your domain over HTTPS. You'll see the StaffSync dashboard load immediately.*
>
> *Open the 'Scan QR / Kiosk' view and click 'Allow' for camera permissions. Hold up any staff ID badge to test camera scanning, or plug in a USB handheld barcode scanner—it works plug-and-play without any drivers!*
>
> *Remember to periodically export a JSON backup from the Settings tab to safeguard your records. Your StaffSync attendance system is now fully deployed and ready for your staff!"*

---

## Technical Summary & Checklist

- [x] Run `npm run build` locally
- [x] Zip files inside `dist/` as `dist.zip`
- [x] Upload and extract `dist.zip` to `public_html/`
- [x] Verify `.htaccess` has SPA rewrites and HTTPS rules enabled
- [x] Run AutoSSL in cPanel for a valid SSL certificate
- [x] Open `https://yourdomain.com` and verify camera permissions & USB scanner
