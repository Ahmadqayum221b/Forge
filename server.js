import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Set environment variables for Android build
const env = {
  ...process.env,
  JAVA_HOME: 'D:\\AS\\jbr',
  ANDROID_HOME: 'C:\\Users\\Ahmad Qayum\\AppData\\Local\\Android\\Sdk'
};

// ── In-memory preview store (for QR phone preview) ────────────────
const previewStore = new Map(); // token -> { data, createdAt }

// Clean up old previews every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of previewStore.entries()) {
    if (now - entry.createdAt > 3_600_000) previewStore.delete(token); // 1h TTL
  }
}, 600_000);

// GET /api/ip — returns this machine's local network IP
app.get('/api/ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        localIP = alias.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  res.json({ ip: localIP });
});

// POST /api/preview — store project snapshot, return token
app.post('/api/preview', (req, res) => {
  const token = Math.random().toString(36).slice(2, 12);
  previewStore.set(token, { data: req.body, createdAt: Date.now() });
  console.log(`[Preview] Stored token: ${token}`);
  res.json({ token });
});

// GET /api/preview/:token — return stored project snapshot
app.get('/api/preview/:token', (req, res) => {
  const entry = previewStore.get(req.params.token);
  if (!entry) {
    return res.status(404).json({ error: 'Preview not found or expired' });
  }
  res.json(entry.data);
});

// POST /api/build — compile APK
app.post('/api/build', async (req, res) => {
  try {
    const projectData = req.body;
    
    // 1. Write project data to the web app's dist directory
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    fs.writeFileSync(path.join(distPath, 'project.json'), JSON.stringify(projectData, null, 2));

    // 2. Sync web assets to Android project
    console.log('Syncing Capacitor...');
    await new Promise((resolve, reject) => {
      exec('npx cap sync android', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    // 3. Build the APK using Gradle
    console.log('Building APK...');
    const androidDir = path.join(__dirname, 'android');
    await new Promise((resolve, reject) => {
      // Use gradlew.bat for Windows
      exec('.\\gradlew.bat assembleDebug', { cwd: androidDir, env }, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    // 4. Send the APK back
    const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    if (fs.existsSync(apkPath)) {
      res.download(apkPath, `${projectData.settings?.appName?.replace(/\s+/g, '_') || 'app'}_debug.apk`);
    } else {
      throw new Error('APK was built but could not be found at ' + apkPath);
    }
  } catch (error) {
    console.error('Build failed:', error);
    res.status(500).json({ error: 'Build failed: ' + error.message });
  }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  // Get and display local network IP
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        localIP = alias.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  console.log(`\n🚀 Forge Backend running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${localIP}:${PORT}`);
  console.log(`\n📱 For QR phone preview, your local IP is: ${localIP}`);
  console.log(`   Make sure your phone is on the same WiFi!\n`);
});
