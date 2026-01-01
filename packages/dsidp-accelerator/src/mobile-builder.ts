/**
 * DSID-P Mobile Builder
 * 
 * React Native and Flutter app generation:
 * - Project scaffolding
 * - Component generation
 * - Navigation setup
 * - Native module integration
 * - Build and deploy automation
 */

import { LLMEngine } from './llm-engine';

// ============== TYPES ==============

export interface MobileConfig {
  framework: MobileFramework;
  projectName: string;
  bundleId: string;
  platforms: Platform[];
  features: MobileFeature[];
  styling: MobileStyling;
  navigation: NavigationType;
  stateManagement?: StateManagement;
}

export type MobileFramework = 'react-native' | 'flutter' | 'expo';
export type Platform = 'ios' | 'android' | 'web';
export type MobileFeature = 
  | 'authentication'
  | 'push-notifications'
  | 'deep-linking'
  | 'analytics'
  | 'crash-reporting'
  | 'in-app-purchases'
  | 'biometrics'
  | 'camera'
  | 'location'
  | 'offline-storage';

export type MobileStyling = 'stylesheet' | 'styled-components' | 'nativewind' | 'tamagui';
export type NavigationType = 'stack' | 'tab' | 'drawer' | 'mixed';
export type StateManagement = 'redux' | 'zustand' | 'jotai' | 'mobx' | 'riverpod' | 'bloc';

export interface MobileProject {
  name: string;
  framework: MobileFramework;
  structure: ProjectStructure;
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface ProjectStructure {
  directories: string[];
  files: ProjectFile[];
}

export interface ProjectFile {
  path: string;
  content: string;
  template?: string;
}

export interface MobileScreen {
  name: string;
  route: string;
  component: string;
  styles?: string;
  hasHeader?: boolean;
  params?: Record<string, string>;
}

export interface MobileComponent {
  name: string;
  code: string;
  styles?: string;
  props: ComponentProp[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  default?: unknown;
}

export interface BuildResult {
  success: boolean;
  platform: Platform;
  outputPath?: string;
  errors?: string[];
  warnings?: string[];
  duration: number;
}

// ============== REACT NATIVE BUILDER ==============

export class ReactNativeBuilder {
  private config: MobileConfig;
  private llm: LLMEngine | null;

  constructor(config: MobileConfig, llmEngine?: LLMEngine) {
    this.config = config;
    this.llm = llmEngine || null;
  }

  async createProject(): Promise<MobileProject> {
    const isExpo = this.config.framework === 'expo';
    
    const directories = [
      'src',
      'src/screens',
      'src/components',
      'src/navigation',
      'src/hooks',
      'src/services',
      'src/utils',
      'src/assets',
      'src/types',
      ...(isExpo ? [] : ['android', 'ios']),
    ];

    const files: ProjectFile[] = [
      this.generatePackageJson(),
      this.generateAppEntry(),
      this.generateNavigation(),
      this.generateTheme(),
      ...this.generateScreens(),
      ...this.generateComponents(),
      this.generateTsConfig(),
      this.generateBabelConfig(),
    ];

    return {
      name: this.config.projectName,
      framework: this.config.framework,
      structure: { directories, files },
      dependencies: this.getDependencies(),
      scripts: this.getScripts(),
    };
  }

  private generatePackageJson(): ProjectFile {
    const isExpo = this.config.framework === 'expo';
    
    const content = {
      name: this.config.projectName,
      version: '1.0.0',
      main: isExpo ? 'expo-router/entry' : 'index.js',
      scripts: this.getScripts(),
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
    };

    return {
      path: 'package.json',
      content: JSON.stringify(content, null, 2),
    };
  }

  private generateAppEntry(): ProjectFile {
    const isExpo = this.config.framework === 'expo';
    
    if (isExpo) {
      return {
        path: 'app/_layout.tsx',
        content: `import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
`,
      };
    }

    return {
      path: 'src/App.tsx',
      content: `import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './theme/ThemeProvider';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
`,
    };
  }

  private generateNavigation(): ProjectFile {
    const navigationType = this.config.navigation;
    
    let content: string;
    
    switch (navigationType) {
      case 'tab':
        content = this.generateTabNavigation();
        break;
      case 'drawer':
        content = this.generateDrawerNavigation();
        break;
      case 'mixed':
        content = this.generateMixedNavigation();
        break;
      default:
        content = this.generateStackNavigation();
    }

    return {
      path: 'src/navigation/RootNavigator.tsx',
      content,
    };
  }

  private generateStackNavigation(): string {
    return `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { DetailsScreen } from '../screens/DetailsScreen';

export type RootStackParamList = {
  Home: undefined;
  Details: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Stack.Screen 
        name="Details" 
        component={DetailsScreen}
        options={{ title: 'Details' }}
      />
    </Stack.Navigator>
  );
}
`;
  }

  private generateTabNavigation(): string {
    return `import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';

export type RootTabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
`;
  }

  private generateDrawerNavigation(): string {
    return `import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootDrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export function RootNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}
`;
  }

  private generateMixedNavigation(): string {
    return `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DetailsScreen } from '../screens/DetailsScreen';

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Details: { id: string };
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Main" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}
`;
  }

  private generateTheme(): ProjectFile {
    return {
      path: 'src/theme/ThemeProvider.tsx',
      content: `import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#F2F2F7',
    text: '#000000',
    border: '#C6C6C8',
    notification: '#FF3B30',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
};

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  
  const theme = isDark ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
`,
    };
  }

  private generateScreens(): ProjectFile[] {
    return [
      {
        path: 'src/screens/HomeScreen.tsx',
        content: `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function HomeScreen({ navigation }: any) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Welcome to ${this.config.projectName}
      </Text>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('Details', { id: '1' })}
      >
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
`,
      },
      {
        path: 'src/screens/DetailsScreen.tsx',
        content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function DetailsScreen({ route }: any) {
  const { theme } = useTheme();
  const { id } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Details for item {id}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
  },
});
`,
      },
    ];
  }

  private generateComponents(): ProjectFile[] {
    return [
      {
        path: 'src/components/Button.tsx',
        content: `import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.card;
      case 'outline': return 'transparent';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return theme.colors.text;
      case 'outline': return theme.colors.primary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'medium': return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'large': return { paddingVertical: 16, paddingHorizontal: 32 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
        variant === 'outline' && { borderWidth: 1, borderColor: theme.colors.primary },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
`,
      },
      {
        path: 'src/components/Card.tsx',
        content: `import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export function Card({ children, style, elevation = 2 }: CardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          shadowOpacity: theme.dark ? 0 : 0.1,
          elevation: theme.dark ? 0 : elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
});
`,
      },
    ];
  }

  private generateTsConfig(): ProjectFile {
    return {
      path: 'tsconfig.json',
      content: JSON.stringify({
        extends: this.config.framework === 'expo' ? 'expo/tsconfig.base' : undefined,
        compilerOptions: {
          strict: true,
          baseUrl: '.',
          paths: {
            '@/*': ['src/*'],
          },
        },
      }, null, 2),
    };
  }

  private generateBabelConfig(): ProjectFile {
    return {
      path: 'babel.config.js',
      content: `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['${this.config.framework === 'expo' ? 'babel-preset-expo' : 'module:metro-react-native-babel-preset'}'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
`,
    };
  }

  private getDependencies(): Record<string, string> {
    const isExpo = this.config.framework === 'expo';
    
    const deps: Record<string, string> = {
      'react': '^18.2.0',
      'react-native': isExpo ? undefined : '^0.72.0',
      '@react-navigation/native': '^6.1.0',
      '@react-navigation/native-stack': '^6.9.0',
      'react-native-screens': '^3.25.0',
      'react-native-safe-area-context': '^4.7.0',
    } as Record<string, string>;

    if (isExpo) {
      deps['expo'] = '^49.0.0';
      deps['expo-router'] = '^2.0.0';
      deps['expo-status-bar'] = '~1.6.0';
    }

    if (this.config.navigation === 'tab') {
      deps['@react-navigation/bottom-tabs'] = '^6.5.0';
    }
    if (this.config.navigation === 'drawer') {
      deps['@react-navigation/drawer'] = '^6.6.0';
      deps['react-native-gesture-handler'] = '^2.13.0';
    }

    // Add feature-specific dependencies
    for (const feature of this.config.features) {
      switch (feature) {
        case 'push-notifications':
          deps[isExpo ? 'expo-notifications' : '@react-native-firebase/messaging'] = 'latest';
          break;
        case 'analytics':
          deps['@react-native-firebase/analytics'] = 'latest';
          break;
        case 'biometrics':
          deps[isExpo ? 'expo-local-authentication' : 'react-native-biometrics'] = 'latest';
          break;
        case 'camera':
          deps[isExpo ? 'expo-camera' : 'react-native-camera'] = 'latest';
          break;
        case 'location':
          deps[isExpo ? 'expo-location' : '@react-native-community/geolocation'] = 'latest';
          break;
      }
    }

    return Object.fromEntries(Object.entries(deps).filter(([, v]) => v !== undefined));
  }

  private getDevDependencies(): Record<string, string> {
    return {
      '@types/react': '^18.2.0',
      'typescript': '^5.0.0',
    };
  }

  private getScripts(): Record<string, string> {
    if (this.config.framework === 'expo') {
      return {
        start: 'expo start',
        android: 'expo start --android',
        ios: 'expo start --ios',
        web: 'expo start --web',
        build: 'eas build',
        'build:android': 'eas build --platform android',
        'build:ios': 'eas build --platform ios',
      };
    }

    return {
      start: 'react-native start',
      android: 'react-native run-android',
      ios: 'react-native run-ios',
      test: 'jest',
      lint: 'eslint .',
    };
  }

  async generateScreen(screen: MobileScreen): Promise<MobileComponent> {
    if (this.llm) {
      const prompt = `Generate a React Native screen component:
Name: ${screen.name}
Route: ${screen.route}
Has Header: ${screen.hasHeader}
Params: ${JSON.stringify(screen.params)}

Requirements:
- Use TypeScript
- Include proper navigation typing
- Use theme context for styling
- Be fully accessible
- Follow React Native best practices

Return only the component code.`;

      try {
        const code = await this.llm.generateCode({ task: prompt, language: 'typescript', context: '' });
        return {
          name: screen.name,
          code,
          props: Object.entries(screen.params || {}).map(([name, type]) => ({
            name,
            type,
            required: true,
          })),
        };
      } catch {}
    }

    return {
      name: screen.name,
      code: this.generateBasicScreen(screen),
      props: [],
    };
  }

  private generateBasicScreen(screen: MobileScreen): string {
    return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function ${screen.name}({ route, navigation }: any) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        ${screen.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
`;
  }
}

// ============== FLUTTER BUILDER ==============

export class FlutterBuilder {
  private config: MobileConfig;
  private llm: LLMEngine | null;

  constructor(config: MobileConfig, llmEngine?: LLMEngine) {
    this.config = config;
    this.llm = llmEngine || null;
  }

  async createProject(): Promise<MobileProject> {
    const directories = [
      'lib',
      'lib/screens',
      'lib/widgets',
      'lib/models',
      'lib/services',
      'lib/utils',
      'lib/theme',
      'assets',
      'test',
    ];

    const files: ProjectFile[] = [
      this.generatePubspec(),
      this.generateMain(),
      this.generateTheme(),
      ...this.generateScreens(),
      ...this.generateWidgets(),
    ];

    return {
      name: this.config.projectName,
      framework: 'flutter',
      structure: { directories, files },
      dependencies: {},
      scripts: {
        run: 'flutter run',
        build: 'flutter build',
        test: 'flutter test',
      },
    };
  }

  private generatePubspec(): ProjectFile {
    const deps: Record<string, string> = {
      flutter: 'sdk: flutter',
      cupertino_icons: '^1.0.2',
    };

    if (this.config.navigation === 'mixed' || this.config.navigation === 'tab') {
      deps['go_router'] = '^12.0.0';
    }

    if (this.config.stateManagement === 'riverpod') {
      deps['flutter_riverpod'] = '^2.4.0';
    } else if (this.config.stateManagement === 'bloc') {
      deps['flutter_bloc'] = '^8.1.0';
    }

    const content = `name: ${this.config.projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}
description: A new Flutter project.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
${Object.entries(deps).map(([k, v]) => `  ${k}: ${v}`).join('\n')}

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/
`;

    return { path: 'pubspec.yaml', content };
  }

  private generateMain(): ProjectFile {
    return {
      path: 'lib/main.dart',
      content: `import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${this.config.projectName}',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
`,
    };
  }

  private generateTheme(): ProjectFile {
    return {
      path: 'lib/theme/app_theme.dart',
      content: `import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.light,
    ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: Colors.blue,
      brightness: Brightness.dark,
    ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
    ),
  );
}
`,
    };
  }

  private generateScreens(): ProjectFile[] {
    return [
      {
        path: 'lib/screens/home_screen.dart',
        content: `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('${this.config.projectName}'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Welcome to ${this.config.projectName}',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const DetailsScreen(),
                  ),
                );
              },
              child: const Text('View Details'),
            ),
          ],
        ),
      ),
    );
  }
}

class DetailsScreen extends StatelessWidget {
  const DetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Details'),
      ),
      body: const Center(
        child: Text('Details Screen'),
      ),
    );
  }
}
`,
      },
    ];
  }

  private generateWidgets(): ProjectFile[] {
    return [
      {
        path: 'lib/widgets/app_button.dart',
        content: `import 'package:flutter/material.dart';

enum ButtonVariant { primary, secondary, outline }
enum ButtonSize { small, medium, large }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool loading;
  final IconData? icon;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.loading = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    Widget child = loading
        ? SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: variant == ButtonVariant.primary
                  ? colorScheme.onPrimary
                  : colorScheme.primary,
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18),
                const SizedBox(width: 8),
              ],
              Text(label),
            ],
          );

    final padding = switch (size) {
      ButtonSize.small => const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 8,
      ),
      ButtonSize.medium => const EdgeInsets.symmetric(
        horizontal: 24,
        vertical: 12,
      ),
      ButtonSize.large => const EdgeInsets.symmetric(
        horizontal: 32,
        vertical: 16,
      ),
    };

    return switch (variant) {
      ButtonVariant.primary => FilledButton(
        onPressed: loading ? null : onPressed,
        style: FilledButton.styleFrom(padding: padding),
        child: child,
      ),
      ButtonVariant.secondary => FilledButton.tonal(
        onPressed: loading ? null : onPressed,
        style: FilledButton.styleFrom(padding: padding),
        child: child,
      ),
      ButtonVariant.outline => OutlinedButton(
        onPressed: loading ? null : onPressed,
        style: OutlinedButton.styleFrom(padding: padding),
        child: child,
      ),
    };
  }
}
`,
      },
    ];
  }
}

// ============== MOBILE BUILDER ==============

export class MobileBuilder {
  private config: MobileConfig;
  private llm: LLMEngine | null;
  private rnBuilder: ReactNativeBuilder | null = null;
  private flutterBuilder: FlutterBuilder | null = null;

  constructor(config: MobileConfig, llmEngine?: LLMEngine) {
    this.config = config;
    this.llm = llmEngine || null;

    if (config.framework === 'flutter') {
      this.flutterBuilder = new FlutterBuilder(config, llmEngine);
    } else {
      this.rnBuilder = new ReactNativeBuilder(config, llmEngine);
    }
  }

  async createProject(): Promise<MobileProject> {
    if (this.config.framework === 'flutter') {
      return this.flutterBuilder!.createProject();
    }
    return this.rnBuilder!.createProject();
  }

  async generateScreen(screen: MobileScreen): Promise<MobileComponent> {
    if (this.rnBuilder) {
      return this.rnBuilder.generateScreen(screen);
    }
    throw new Error('Screen generation not yet supported for Flutter');
  }
}

// ============== FACTORY ==============

export function createMobileBuilder(config: MobileConfig, llmEngine?: LLMEngine): MobileBuilder {
  return new MobileBuilder(config, llmEngine);
}

export function createReactNativeBuilder(config: MobileConfig, llmEngine?: LLMEngine): ReactNativeBuilder {
  return new ReactNativeBuilder(config, llmEngine);
}

export function createFlutterBuilder(config: MobileConfig, llmEngine?: LLMEngine): FlutterBuilder {
  return new FlutterBuilder(config, llmEngine);
}
