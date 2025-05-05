const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const os = require('os');
const { pathToFileURL } = require('url');
//const isDev = require('electron-is-dev');
const isDev = !app.isPackaged;

let pyProc = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the frontend
  if (isDev) {
    // Development mode: connect to Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode: load from built files
    //mainWindow.loadFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
    const { join } = require('path');
    const indexHtml = join(app.getAppPath(), 'frontend', 'dist', 'index.html');
    mainWindow.loadFile(indexHtml);   
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const isDev = !app.isPackaged;
  
  // Determine base directory
  const baseDir = isDev
    ? path.join(__dirname, '..', '..')      // repo root in dev
    : process.resourcesPath;                // …/Resources in build
  
  console.log('[BACKEND] Base directory:', baseDir);
  
  // Try multiple possible locations for the backend binary
  const possiblePaths = [
    // Standard paths as per your original code
    path.join(baseDir, isDev ? 'backend/dist/backend_server' : 'backend/backend_server'),
    
    // Additional paths to check
    path.join(baseDir, 'backend', 'dist', 'backend_server'),
    path.join(__dirname, '..', '..', 'backend', 'dist', 'backend_server'),
    
    // Absolute path you mentioned is working
    '/Users/benjaminwu/Schoolwork/CS348/Project/backend/dist/backend_server'
  ];
  
  // Log all paths we're checking
  console.log('[BACKEND] Checking these paths for backend binary:');
  possiblePaths.forEach(p => console.log(`  - ${p}`));
  
  // Find the first existing path
  const backendExe = possiblePaths.find(p => fs.existsSync(p));
  
  if (backendExe) {
    console.log('[BACKEND] Found binary at:', backendExe);
    
    // Make sure it's executable on non-Windows platforms
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(backendExe, 0o755);
      } catch (e) {
        console.error('[BACKEND] Failed to set executable permissions:', e);
      }
    }
    
    // Start the backend process
    try {
      const cwd = path.dirname(backendExe);
      console.log('[BACKEND] Starting binary with working directory:', cwd);
      pyProc = spawn(backendExe, { stdio: 'inherit', cwd: cwd });
      
      pyProc.on('error', (err) => {
        console.error('[BACKEND] Error running backend binary:', err);
      });
      
      console.log('[BACKEND] Started binary backend');
    } catch (e) {
      console.error('[BACKEND] Failed to start backend binary:', e);
    }
  } else {
    console.error('[BACKEND] Could not find backend binary in any of the expected locations.');
    console.error('[BACKEND] Please ensure the backend binary is built and located correctly.');
  }
}


app.on('ready', () => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (pyProc) {
    // Kill process on all platforms
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', pyProc.pid, '/f', '/t']);
    } else {
      pyProc.kill();
    }
    pyProc = null;
  }
});

// Handle backend URL for frontend
app.whenReady().then(() => {
  // Make the backend URL available to the renderer process
  global.backendURL = isDev ? 'http://localhost:8000' : 'http://localhost:8000';
});