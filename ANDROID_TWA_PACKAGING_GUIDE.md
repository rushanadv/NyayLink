# NyayLink — Android Trusted Web Activity (TWA) Packaging Guide

This guide documents the exact, production-ready steps to package the deployed NyayLink Progressive Web App (`https://nyay.live`) into an Android Application Bundle (`.aab`) suitable for distribution on the Google Play Store using **Bubblewrap** or **PWABuilder**.

---

## 1. Prerequisites & PWA Conformance Audit

Before initiating the TWA build, verify that the live deployed PWA satisfies all Google Play and Chromium requirements:

- **Web App Manifest**: Served at `https://nyay.live/manifest.webmanifest` with `display: "standalone"`, `scope: "/"`, and `start_url: "/"`.
- **High-Resolution Icons**:
  - `public/icons/icon-192.png` (192×192 px, `purpose: "any"`)
  - `public/icons/icon-maskable-192.png` (192×192 px, `purpose: "maskable"`, 20% safe-padding)
  - `public/icons/icon-512.png` (512×512 px, `purpose: "any"`)
  - `public/icons/icon-maskable-512.png` (512×512 px, `purpose: "maskable"`)
- **Service Worker**: Active at `https://nyay.live/sw.js` with offline fallback handling.
- **HTTPS Enforcement**: 100% of routes and assets served over TLS with valid certificates.

---

## 2. Recommended Android Application Identifier

- **Application ID / Package Name**: `live.nyay.app` (or `com.nyaylink.app`)
- **App Name**: `NyayLink`
- **Default Launcher Title**: `NyayLink`

---

## 3. Packaging Steps via Bubblewrap CLI (Official Google Tool)

Bubblewrap is Google's official CLI tool for generating Trusted Web Activity wrapper projects.

### Step 3.1: Install Bubblewrap & Android SDK
```bash
# Install Bubblewrap CLI globally via npm
npm install -g @bubblewrap/cli

# Verify installation and initialize JDK / Android Commandline Tools
bubblewrap doctor
```

### Step 3.2: Initialize the TWA Project
```bash
# Create an isolated build directory outside the repository
mkdir -p ~/nyaylink-android-twa && cd ~/nyaylink-android-twa

# Generate TWA configuration directly from the production manifest
bubblewrap init --manifest=https://nyay.live/manifest.webmanifest
```

When prompted:
1. **Application ID**: `live.nyay.app`
2. **Short Name**: `NyayLink`
3. **Display Mode**: `standalone`
4. **Orientation**: `portrait-primary`
5. **Theme Color**: `#205C43`
6. **Background Color**: `#FDFEFC`
7. **Signing Key**: Select *Create a new keystore* if generating a fresh release key, or point to your existing corporate Android release keystore.

### Step 3.3: Build the Android App Bundle (.aab)
```bash
# Compiles the Android project into a signed Google Play release bundle
bubblewrap build
```
The output file `app-release-bundle.aab` is the artifact uploaded to Google Play Console.

---

## 4. Alternative: Packaging via PWABuilder

1. Visit [https://www.pwabuilder.com](https://www.pwabuilder.com).
2. Enter `https://nyay.live` and click **Start**.
3. PWABuilder will audit the manifest, service worker, and security headers (score: 100% PWA compliant).
4. Click **Package for Store** → select **Android**.
5. Configure package name (`live.nyay.app`) and download the generated Android Studio project or signed bundle.

---

## 5. Digital Asset Links (`assetlinks.json`) Configuration

### Why Digital Asset Links Are Required
In a Trusted Web Activity, Chromium displays the browser URL address bar unless mutual cryptographic ownership between the web domain and the Android app package is proven. When Digital Asset Links are configured, Chrome removes the URL bar, delivering a 100% native full-screen app experience.

### Exact File Location
The file must be hosted at:
```
https://nyay.live/.well-known/assetlinks.json
```
Served with `Content-Type: application/json` and returning HTTP 200 without redirects.

### Obtaining the SHA-256 Signing Fingerprint
Do **NOT** guess or invent a fingerprint. Retrieve the exact SHA-256 fingerprint from the actual signing key:

#### Option A: From Local Keystore (Prior to Google Play Signing)
```bash
keytool -list -v -keystore path/to/your-release-key.keystore -alias your-alias
```
Locate the line labeled:
```
SHA256: AA:BB:CC:DD:... (64 hex characters)
```

#### Option B: From Google Play Console (Recommended if using Play App Signing)
1. Sign in to [Google Play Console](https://play.google.com/console).
2. Select **NyayLink** → **Setup** → **App Integrity**.
3. Under **App signing key certificate**, copy the **SHA-256 certificate fingerprint**.

### Asset Links Specification Template
Once the real fingerprint is obtained, place it in `public/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "live.nyay.app",
      "sha256_cert_fingerprints": [
        "REPLACE_WITH_YOUR_ACTUAL_SHA256_HEX_FINGERPRINT"
      ]
    }
  }
]
```

### Verification Tool
Validate the live linkage using Google's Asset Links Testing API:
```
https://digitalassetlinks.googleapis.com/v1/statements:check?source.web.site=https://nyay.live&relation=delegate_permission/common.handle_all_urls&target.android_app.package_name=live.nyay.app&target.android_app.certificate.sha256_fingerprint=YOUR_FINGERPRINT
```

---

## 6. Security & Legal Data Isolation in TWA

- **Session Continuity**: Android TWA shares the device Chrome cookie and localStorage jar, allowing clients and advocates logged in via web to remain authenticated in the installed app.
- **Zero Cache Leaks**: The service worker's strict network-only exclusion rules for `/api/`, `/dashboard`, `/lawyer`, and legal documents prevent any privileged legal records from being stored on unencrypted device cache storage.
- **Biometric Hardware Access**: Future WebAuthn / passkey integrations will function natively inside the TWA container.
