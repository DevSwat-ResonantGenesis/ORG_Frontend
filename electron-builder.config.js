const { app, BrowserWindow } = require('electron');
const path = require('path');

module.exports = {
  appId: 'com.resonantgraph.ai',
  productName: 'ResonantGraph AI',
  directories: {
    output: 'release',
    buildResources: 'electron/build',
  },
  files: [
    'electron/dist/**/*',
    'dist/**/*',
    'package.json',
    'node_modules/**/*',
    '!node_modules/**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
  ],
  extraFiles: [
    {
      from: 'dist',
      to: 'renderer',
      filter: ['**/*'],
    },
  ],
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'electron/build/icon.icns',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64'],
      },
    ],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'electron/build/entitlements.mac.plist',
    entitlementsInherit: 'electron/build/entitlements.mac.plist',
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
      {
        target: 'portable',
        arch: ['x64'],
      },
    ],
    icon: 'electron/build/icon.ico',
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
      {
        target: 'deb',
        arch: ['x64'],
      },
      {
        target: 'rpm',
        arch: ['x64'],
      },
    ],
    icon: 'electron/build/icon.png',
    category: 'Development',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },
  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications',
      },
    ],
  },
  publish: {
    provider: 'github',
    owner: 'louienemesh',
    repo: 'ResonantGraphAI_FrontendV0.1',
  },
  // Auto-updater configuration
  autoUpdater: {
    enabled: true,
  },
  // Update server configuration
  // For GitHub releases, electron-updater automatically uses:
  // https://github.com/{owner}/{repo}/releases/latest
  // Or latest.yml for update info
};

