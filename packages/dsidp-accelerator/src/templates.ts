/**
 * DSID-P Template Library
 * 
 * Project templates for quick starts:
 * - Next.js
 * - React + Vite
 * - Express API
 * - React Native
 * - Electron
 * - Full-stack
 */

// ============== TYPES ==============

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  stack: string[];
  features: string[];
  files: TemplateFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  postInstall?: string[];
}

export type TemplateCategory = 
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'desktop'
  | 'api'
  | 'library';

export interface TemplateFile {
  path: string;
  content: string;
  template?: boolean; // If true, process placeholders
}

export interface TemplateVariables {
  projectName: string;
  description: string;
  author: string;
  license: string;
  [key: string]: string;
}

// ============== TEMPLATES ==============

const NEXTJS_TEMPLATE: ProjectTemplate = {
  id: 'nextjs',
  name: 'Next.js App',
  description: 'Modern Next.js 14 with App Router, TypeScript, and TailwindCSS',
  category: 'fullstack',
  stack: ['Next.js', 'React', 'TypeScript', 'TailwindCSS'],
  features: ['App Router', 'Server Components', 'API Routes', 'Dark Mode'],
  dependencies: {
    'next': '^14.0.0',
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
  },
  devDependencies: {
    'typescript': '^5.0.0',
    '@types/react': '^18.2.0',
    '@types/node': '^20.0.0',
    'tailwindcss': '^3.3.0',
    'postcss': '^8.4.0',
    'autoprefixer': '^10.4.0',
  },
  scripts: {
    'dev': 'next dev',
    'build': 'next build',
    'start': 'next start',
    'lint': 'next lint',
  },
  files: [
    {
      path: 'app/layout.tsx',
      content: `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: '{{description}}',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`,
      template: true,
    },
    {
      path: 'app/page.tsx',
      content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to {{projectName}}</h1>
      <p className="mt-4 text-gray-600">{{description}}</p>
    </main>
  );
}
`,
      template: true,
    },
    {
      path: 'app/globals.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    },
    {
      path: 'tailwind.config.ts',
      content: `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
`,
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
    },
    {
      path: 'next.config.js',
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
`,
    },
  ],
};

const REACT_VITE_TEMPLATE: ProjectTemplate = {
  id: 'react-vite',
  name: 'React + Vite',
  description: 'Fast React development with Vite, TypeScript, and TailwindCSS',
  category: 'frontend',
  stack: ['React', 'Vite', 'TypeScript', 'TailwindCSS'],
  features: ['Hot Module Replacement', 'Fast Build', 'TypeScript'],
  dependencies: {
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
  },
  devDependencies: {
    '@types/react': '^18.2.0',
    '@types/react-dom': '^18.2.0',
    '@vitejs/plugin-react': '^4.0.0',
    'typescript': '^5.0.0',
    'vite': '^5.0.0',
    'tailwindcss': '^3.3.0',
    'postcss': '^8.4.0',
    'autoprefixer': '^10.4.0',
  },
  scripts: {
    'dev': 'vite',
    'build': 'tsc && vite build',
    'preview': 'vite preview',
  },
  files: [
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{projectName}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      template: true,
    },
    {
      path: 'src/main.tsx',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      path: 'src/App.tsx',
      content: `function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">{{projectName}}</h1>
        <p className="mt-2 text-gray-600">{{description}}</p>
      </div>
    </div>
  );
}

export default App;
`,
      template: true,
    },
    {
      path: 'src/index.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    },
    {
      path: 'vite.config.ts',
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
    },
  ],
};

const EXPRESS_API_TEMPLATE: ProjectTemplate = {
  id: 'express-api',
  name: 'Express API',
  description: 'RESTful API with Express, TypeScript, and Prisma',
  category: 'backend',
  stack: ['Express', 'TypeScript', 'Prisma', 'PostgreSQL'],
  features: ['REST API', 'Authentication', 'Database ORM', 'Validation'],
  dependencies: {
    'express': '^4.18.0',
    '@prisma/client': '^5.0.0',
    'cors': '^2.8.0',
    'helmet': '^7.0.0',
    'dotenv': '^16.0.0',
    'zod': '^3.22.0',
    'jsonwebtoken': '^9.0.0',
    'bcryptjs': '^2.4.0',
  },
  devDependencies: {
    'typescript': '^5.0.0',
    '@types/express': '^4.17.0',
    '@types/cors': '^2.8.0',
    '@types/node': '^20.0.0',
    '@types/jsonwebtoken': '^9.0.0',
    '@types/bcryptjs': '^2.4.0',
    'prisma': '^5.0.0',
    'tsx': '^4.0.0',
    'nodemon': '^3.0.0',
  },
  scripts: {
    'dev': 'nodemon --exec tsx src/index.ts',
    'build': 'tsc',
    'start': 'node dist/index.js',
    'db:push': 'prisma db push',
    'db:generate': 'prisma generate',
  },
  files: [
    {
      path: 'src/index.ts',
      content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to {{projectName}} API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
      template: true,
    },
    {
      path: 'prisma/schema.prisma',
      content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`,
    },
    {
      path: '.env.example',
      content: `DATABASE_URL="postgresql://user:password@localhost:5432/{{projectName}}"
JWT_SECRET="your-secret-key"
PORT=3000
`,
      template: true,
    },
  ],
};

const REACT_NATIVE_TEMPLATE: ProjectTemplate = {
  id: 'react-native',
  name: 'React Native App',
  description: 'Cross-platform mobile app with React Native and Expo',
  category: 'mobile',
  stack: ['React Native', 'Expo', 'TypeScript'],
  features: ['Cross-platform', 'Hot Reload', 'Native APIs'],
  dependencies: {
    'expo': '~49.0.0',
    'expo-status-bar': '~1.6.0',
    'react': '18.2.0',
    'react-native': '0.72.0',
  },
  devDependencies: {
    '@babel/core': '^7.20.0',
    '@types/react': '~18.2.0',
    'typescript': '^5.0.0',
  },
  scripts: {
    'start': 'expo start',
    'android': 'expo start --android',
    'ios': 'expo start --ios',
    'web': 'expo start --web',
  },
  files: [
    {
      path: 'App.tsx',
      content: `import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{{projectName}}</Text>
      <Text style={styles.subtitle}>{{description}}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});
`,
      template: true,
    },
    {
      path: 'app.json',
      content: `{
  "expo": {
    "name": "{{projectName}}",
    "slug": "{{projectName}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
`,
      template: true,
    },
  ],
};

const ELECTRON_TEMPLATE: ProjectTemplate = {
  id: 'electron',
  name: 'Electron Desktop App',
  description: 'Cross-platform desktop app with Electron and React',
  category: 'desktop',
  stack: ['Electron', 'React', 'TypeScript'],
  features: ['Cross-platform Desktop', 'Native APIs', 'Auto Updates'],
  dependencies: {
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
  },
  devDependencies: {
    'electron': '^27.0.0',
    'electron-builder': '^24.0.0',
    '@types/react': '^18.2.0',
    'typescript': '^5.0.0',
    'vite': '^5.0.0',
    '@vitejs/plugin-react': '^4.0.0',
    'concurrently': '^8.0.0',
    'wait-on': '^7.0.0',
  },
  scripts: {
    'dev': 'concurrently "vite" "wait-on http://localhost:5173 && electron ."',
    'build': 'vite build && electron-builder',
    'preview': 'vite preview',
  },
  files: [
    {
      path: 'main.js',
      content: `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
`,
    },
    {
      path: 'src/App.tsx',
      content: `function App() {
  return (
    <div className="app">
      <h1>{{projectName}}</h1>
      <p>{{description}}</p>
    </div>
  );
}

export default App;
`,
      template: true,
    },
  ],
};

// ============== ALL TEMPLATES ==============

export const TEMPLATES: ProjectTemplate[] = [
  NEXTJS_TEMPLATE,
  REACT_VITE_TEMPLATE,
  EXPRESS_API_TEMPLATE,
  REACT_NATIVE_TEMPLATE,
  ELECTRON_TEMPLATE,
];

// ============== TEMPLATE MANAGER ==============

export class TemplateManager {
  private templates: Map<string, ProjectTemplate> = new Map();

  constructor() {
    for (const template of TEMPLATES) {
      this.templates.set(template.id, template);
    }
  }

  getTemplate(id: string): ProjectTemplate | null {
    return this.templates.get(id) || null;
  }

  listTemplates(category?: TemplateCategory): ProjectTemplate[] {
    const templates = Array.from(this.templates.values());
    if (category) {
      return templates.filter(t => t.category === category);
    }
    return templates;
  }

  async generate(templateId: string, outputDir: string, variables: TemplateVariables): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const fs = await import('fs/promises');
    const path = await import('path');

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Generate package.json
    const packageJson = {
      name: variables.projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      description: variables.description,
      author: variables.author,
      license: variables.license,
      scripts: template.scripts,
      dependencies: template.dependencies,
      devDependencies: template.devDependencies,
    };

    await fs.writeFile(
      path.join(outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Generate template files
    for (const file of template.files) {
      let content = file.content;
      
      if (file.template) {
        content = this.processTemplate(content, variables);
      }

      const filePath = path.join(outputDir, file.path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content);
    }

    // Generate README
    const readme = this.generateReadme(template, variables);
    await fs.writeFile(path.join(outputDir, 'README.md'), readme);

    // Generate .gitignore
    const gitignore = this.generateGitignore(template);
    await fs.writeFile(path.join(outputDir, '.gitignore'), gitignore);
  }

  private processTemplate(content: string, variables: TemplateVariables): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  private generateReadme(template: ProjectTemplate, variables: TemplateVariables): string {
    return `# ${variables.projectName}

${variables.description}

## Tech Stack

${template.stack.map(s => `- ${s}`).join('\n')}

## Features

${template.features.map(f => `- ${f}`).join('\n')}

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## License

${variables.license}
`;
  }

  private generateGitignore(template: ProjectTemplate): string {
    const common = `# Dependencies
node_modules/

# Build output
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/
`;

    const specific: Record<TemplateCategory, string> = {
      frontend: '',
      backend: '\n# Database\nprisma/migrations/\n',
      fullstack: '\n# Database\nprisma/migrations/\n',
      mobile: '\n# Expo\n.expo/\n*.jks\n*.p8\n*.p12\n*.key\n*.mobileprovision\n',
      desktop: '\n# Electron\nrelease/\n*.dmg\n*.exe\n',
      api: '\n# Database\nprisma/migrations/\n',
      library: '\n# Package\n*.tgz\n',
    };

    return common + (specific[template.category] || '');
  }

  addTemplate(template: ProjectTemplate): void {
    this.templates.set(template.id, template);
  }

  removeTemplate(id: string): boolean {
    return this.templates.delete(id);
  }
}

// ============== FACTORY ==============

export function createTemplateManager(): TemplateManager {
  return new TemplateManager();
}
