/**
 * DSID-P Figma-to-Code
 * 
 * Design-to-component conversion:
 * - Figma API integration
 * - Design token extraction
 * - Component generation (React, Vue, etc.)
 * - Style extraction (CSS, Tailwind, etc.)
 * - Responsive breakpoint handling
 */

import { LLMEngine } from './llm-engine';

// ============== TYPES ==============

export interface FigmaConfig {
  accessToken: string;
  fileKey?: string;
  outputDir: string;
  framework: FrameworkTarget;
  styleFormat: StyleFormat;
  componentPrefix?: string;
  generateTypes: boolean;
  generateStories: boolean;
}

export type FrameworkTarget = 'react' | 'vue' | 'svelte' | 'angular' | 'html';
export type StyleFormat = 'css' | 'scss' | 'tailwind' | 'styled-components' | 'emotion';

export interface FigmaFile {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: FigmaDocument;
  components: Record<string, FigmaComponent>;
  styles: Record<string, FigmaStyle>;
}

export interface FigmaDocument {
  id: string;
  name: string;
  type: FigmaNodeType | string;
  children: FigmaNode[];
}

export interface FigmaNode {
  id: string;
  name: string;
  type: FigmaNodeType;
  visible?: boolean;
  children?: FigmaNode[];
  absoluteBoundingBox?: BoundingBox;
  constraints?: Constraints;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  cornerRadius?: number;
  effects?: Effect[];
  characters?: string;
  style?: TextStyle;
  componentId?: string;
}

export type FigmaNodeType = 
  | 'DOCUMENT'
  | 'CANVAS'
  | 'FRAME'
  | 'GROUP'
  | 'VECTOR'
  | 'BOOLEAN_OPERATION'
  | 'STAR'
  | 'LINE'
  | 'ELLIPSE'
  | 'REGULAR_POLYGON'
  | 'RECTANGLE'
  | 'TEXT'
  | 'SLICE'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Constraints {
  vertical: ConstraintType;
  horizontal: ConstraintType;
}

export type ConstraintType = 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'CENTER' | 'SCALE';

export interface Paint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  visible?: boolean;
  opacity?: number;
  color?: Color;
  gradientStops?: GradientStop[];
  imageRef?: string;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface GradientStop {
  position: number;
  color: Color;
}

export interface Effect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible: boolean;
  radius: number;
  color?: Color;
  offset?: { x: number; y: number };
}

export interface TextStyle {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeightPx?: number;
  letterSpacing?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID';
  description?: string;
}

export interface DesignToken {
  name: string;
  type: 'color' | 'typography' | 'spacing' | 'shadow' | 'borderRadius';
  value: unknown;
  description?: string;
}

export interface GeneratedComponent {
  name: string;
  code: string;
  styles: string;
  types?: string;
  story?: string;
  tokens: DesignToken[];
}

export interface ConversionResult {
  components: GeneratedComponent[];
  tokens: DesignToken[];
  globalStyles: string;
  indexFile: string;
}

// ============== FIGMA API CLIENT ==============

export class FigmaClient {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    return this.fetch<FigmaFile>(`/files/${fileKey}`);
  }

  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<{ nodes: Record<string, FigmaNode> }> {
    const ids = nodeIds.join(',');
    return this.fetch(`/files/${fileKey}/nodes?ids=${ids}`);
  }

  async getImages(fileKey: string, nodeIds: string[], format: 'jpg' | 'png' | 'svg' = 'svg'): Promise<{ images: Record<string, string> }> {
    const ids = nodeIds.join(',');
    return this.fetch(`/images/${fileKey}?ids=${ids}&format=${format}`);
  }

  async getFileStyles(fileKey: string): Promise<{ styles: Record<string, FigmaStyle> }> {
    const file = await this.getFile(fileKey);
    return { styles: file.styles };
  }

  async getFileComponents(fileKey: string): Promise<{ components: Record<string, FigmaComponent> }> {
    const file = await this.getFile(fileKey);
    return { components: file.components };
  }
}

// ============== DESIGN TOKEN EXTRACTOR ==============

export class DesignTokenExtractor {
  extractFromFile(file: FigmaFile): DesignToken[] {
    const tokens: DesignToken[] = [];

    // Extract color tokens from styles
    for (const [_, style] of Object.entries(file.styles)) {
      if (style.styleType === 'FILL') {
        tokens.push({
          name: this.tokenizeName(style.name),
          type: 'color',
          value: style.name, // Would need node data for actual color
          description: style.description,
        });
      }
    }

    // Extract from document
    this.extractFromNode(file.document as unknown as FigmaNode, tokens);

    return this.deduplicateTokens(tokens);
  }

  private extractFromNode(node: FigmaNode, tokens: DesignToken[]): void {
    // Extract colors from fills
    if (node.fills) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.color) {
          tokens.push({
            name: this.generateColorName(fill.color),
            type: 'color',
            value: this.colorToHex(fill.color),
          });
        }
      }
    }

    // Extract typography
    if (node.style) {
      tokens.push({
        name: this.tokenizeName(node.name || 'text'),
        type: 'typography',
        value: {
          fontFamily: node.style.fontFamily,
          fontSize: node.style.fontSize,
          fontWeight: node.style.fontWeight,
          lineHeight: node.style.lineHeightPx,
          letterSpacing: node.style.letterSpacing,
        },
      });
    }

    // Extract spacing (from frames)
    if (node.absoluteBoundingBox && (node.type === 'FRAME' || node.type === 'GROUP')) {
      const { width, height } = node.absoluteBoundingBox;
      if (width === height && [4, 8, 12, 16, 20, 24, 32, 40, 48, 64].includes(width)) {
        tokens.push({
          name: `spacing-${width}`,
          type: 'spacing',
          value: `${width}px`,
        });
      }
    }

    // Extract border radius
    if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
      tokens.push({
        name: `radius-${node.cornerRadius}`,
        type: 'borderRadius',
        value: `${node.cornerRadius}px`,
      });
    }

    // Extract shadows
    if (node.effects) {
      for (const effect of node.effects) {
        if ((effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') && effect.visible) {
          tokens.push({
            name: `shadow-${effect.radius}`,
            type: 'shadow',
            value: this.effectToCSS(effect),
          });
        }
      }
    }

    // Recurse into children
    if (node.children) {
      for (const child of node.children) {
        this.extractFromNode(child, tokens);
      }
    }
  }

  private tokenizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateColorName(color: Color): string {
    const hex = this.colorToHex(color).slice(1);
    return `color-${hex}`;
  }

  private colorToHex(color: Color): string {
    const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  private colorToRgba(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
  }

  private effectToCSS(effect: Effect): string {
    if (effect.type === 'DROP_SHADOW' && effect.color && effect.offset) {
      return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${this.colorToRgba(effect.color)}`;
    }
    return '';
  }

  private deduplicateTokens(tokens: DesignToken[]): DesignToken[] {
    const seen = new Set<string>();
    return tokens.filter(token => {
      const key = `${token.type}:${JSON.stringify(token.value)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

// ============== CODE GENERATOR ==============

export class ComponentCodeGenerator {
  private config: FigmaConfig;
  private llm: LLMEngine | null;

  constructor(config: FigmaConfig, llmEngine?: LLMEngine) {
    this.config = config;
    this.llm = llmEngine || null;
  }

  async generateComponent(node: FigmaNode, tokens: DesignToken[]): Promise<GeneratedComponent> {
    const componentName = this.formatComponentName(node.name);
    
    switch (this.config.framework) {
      case 'react':
        return this.generateReactComponent(node, componentName, tokens);
      case 'vue':
        return this.generateVueComponent(node, componentName, tokens);
      case 'svelte':
        return this.generateSvelteComponent(node, componentName, tokens);
      default:
        return this.generateReactComponent(node, componentName, tokens);
    }
  }

  private async generateReactComponent(node: FigmaNode, name: string, tokens: DesignToken[]): Promise<GeneratedComponent> {
    const styles = this.generateStyles(node);
    const jsx = this.nodeToJSX(node);

    let code: string;
    
    if (this.llm) {
      // Use LLM to enhance the generated code
      code = await this.enhanceWithLLM(name, jsx, styles, node);
    } else {
      code = this.generateBasicReactComponent(name, jsx, styles);
    }

    const types = this.config.generateTypes ? this.generateTypeDefinitions(name, node) : undefined;
    const story = this.config.generateStories ? this.generateStory(name) : undefined;

    return {
      name,
      code,
      styles,
      types,
      story,
      tokens,
    };
  }

  private generateBasicReactComponent(name: string, jsx: string, styles: string): string {
    const styleImport = this.getStyleImport(name);
    
    return `import React from 'react';
${styleImport}

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${name}: React.FC<${name}Props> = ({ className, children }) => {
  return (
    <div className={\`${this.getStyleClassName(name)} \${className || ''}\`}>
      ${jsx}
      {children}
    </div>
  );
};

export default ${name};
`;
  }

  private async generateVueComponent(node: FigmaNode, name: string, tokens: DesignToken[]): Promise<GeneratedComponent> {
    const styles = this.generateStyles(node);
    const template = this.nodeToHTML(node);

    const code = `<template>
  <div class="${this.kebabCase(name)}">
    ${template}
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<style scoped>
${styles}
</style>
`;

    return {
      name,
      code,
      styles,
      tokens,
    };
  }

  private async generateSvelteComponent(node: FigmaNode, name: string, tokens: DesignToken[]): Promise<GeneratedComponent> {
    const styles = this.generateStyles(node);
    const template = this.nodeToHTML(node);

    const code = `<script lang="ts">
  export let className: string = '';
</script>

<div class="${this.kebabCase(name)} {className}">
  ${template}
  <slot></slot>
</div>

<style>
${styles}
</style>
`;

    return {
      name,
      code,
      styles,
      tokens,
    };
  }

  private async enhanceWithLLM(name: string, jsx: string, styles: string, node: FigmaNode): Promise<string> {
    if (!this.llm) return this.generateBasicReactComponent(name, jsx, styles);

    const prompt = `Convert this Figma-extracted component to a production-ready React component:

Component name: ${name}
Node type: ${node.type}
Structure:
${jsx}

Styles:
${styles}

Requirements:
1. Use TypeScript with proper prop types
2. Make it accessible (ARIA attributes)
3. Add hover/focus states where appropriate
4. Use semantic HTML
5. Follow React best practices
6. ${this.config.styleFormat === 'tailwind' ? 'Use Tailwind CSS classes' : 'Use CSS modules'}

Return only the component code, no explanation.`;

    try {
      return await this.llm.generateCode({ task: prompt, language: 'typescript', context: '' });
    } catch {
      return this.generateBasicReactComponent(name, jsx, styles);
    }
  }

  private generateStyles(node: FigmaNode): string {
    const rules: string[] = [];

    if (node.absoluteBoundingBox) {
      rules.push(`width: ${node.absoluteBoundingBox.width}px`);
      rules.push(`height: ${node.absoluteBoundingBox.height}px`);
    }

    if (node.fills) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
          const hex = this.colorToHex(fill.color);
          rules.push(`background-color: ${hex}`);
        }
      }
    }

    if (node.cornerRadius) {
      rules.push(`border-radius: ${node.cornerRadius}px`);
    }

    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.type === 'SOLID' && stroke.color) {
        rules.push(`border: ${node.strokeWeight || 1}px solid ${this.colorToHex(stroke.color)}`);
      }
    }

    if (node.effects) {
      const shadows = node.effects
        .filter(e => (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') && e.visible)
        .map(e => this.effectToCSS(e))
        .filter(s => s);
      
      if (shadows.length > 0) {
        rules.push(`box-shadow: ${shadows.join(', ')}`);
      }
    }

    if (node.style) {
      rules.push(`font-family: '${node.style.fontFamily}', sans-serif`);
      rules.push(`font-size: ${node.style.fontSize}px`);
      rules.push(`font-weight: ${node.style.fontWeight}`);
      if (node.style.lineHeightPx) {
        rules.push(`line-height: ${node.style.lineHeightPx}px`);
      }
      if (node.style.letterSpacing) {
        rules.push(`letter-spacing: ${node.style.letterSpacing}px`);
      }
    }

    if (this.config.styleFormat === 'tailwind') {
      return this.cssToTailwind(rules);
    }

    return `.${this.kebabCase(node.name)} {\n  ${rules.join(';\n  ')};\n}`;
  }

  private cssToTailwind(rules: string[]): string {
    // Basic CSS to Tailwind conversion
    const tailwindClasses: string[] = [];
    
    for (const rule of rules) {
      const [prop, value] = rule.split(':').map(s => s.trim());
      
      // Width/Height
      if (prop === 'width') tailwindClasses.push(`w-[${value}]`);
      if (prop === 'height') tailwindClasses.push(`h-[${value}]`);
      
      // Colors
      if (prop === 'background-color') tailwindClasses.push(`bg-[${value}]`);
      if (prop === 'color') tailwindClasses.push(`text-[${value}]`);
      
      // Border radius
      if (prop === 'border-radius') {
        const px = parseInt(value);
        if (px <= 4) tailwindClasses.push('rounded-sm');
        else if (px <= 8) tailwindClasses.push('rounded');
        else if (px <= 12) tailwindClasses.push('rounded-lg');
        else tailwindClasses.push(`rounded-[${value}]`);
      }
      
      // Font
      if (prop === 'font-size') {
        const px = parseInt(value);
        if (px <= 12) tailwindClasses.push('text-xs');
        else if (px <= 14) tailwindClasses.push('text-sm');
        else if (px <= 16) tailwindClasses.push('text-base');
        else if (px <= 18) tailwindClasses.push('text-lg');
        else if (px <= 20) tailwindClasses.push('text-xl');
        else tailwindClasses.push(`text-[${value}]`);
      }
      
      if (prop === 'font-weight') {
        const weight = parseInt(value);
        if (weight <= 400) tailwindClasses.push('font-normal');
        else if (weight <= 500) tailwindClasses.push('font-medium');
        else if (weight <= 600) tailwindClasses.push('font-semibold');
        else tailwindClasses.push('font-bold');
      }
    }
    
    return tailwindClasses.join(' ');
  }

  private nodeToJSX(node: FigmaNode): string {
    if (node.type === 'TEXT') {
      return `<span>${node.characters || ''}</span>`;
    }

    const children = node.children?.map(child => this.nodeToJSX(child)).join('\n      ') || '';
    
    if (node.type === 'FRAME' || node.type === 'GROUP' || node.type === 'COMPONENT') {
      return `<div className="${this.kebabCase(node.name)}">\n      ${children}\n    </div>`;
    }

    if (node.type === 'RECTANGLE') {
      return `<div className="${this.kebabCase(node.name)}" />`;
    }

    if (node.type === 'ELLIPSE') {
      return `<div className="${this.kebabCase(node.name)} rounded-full" />`;
    }

    return children || '';
  }

  private nodeToHTML(node: FigmaNode): string {
    if (node.type === 'TEXT') {
      return `<span>${node.characters || ''}</span>`;
    }

    const children = node.children?.map(child => this.nodeToHTML(child)).join('\n    ') || '';
    
    return `<div class="${this.kebabCase(node.name)}">\n    ${children}\n  </div>`;
  }

  private generateTypeDefinitions(name: string, node: FigmaNode): string {
    return `export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
  // Add component-specific props here
}

export type ${name}Variant = 'default' | 'primary' | 'secondary';
`;
  }

  private generateStory(name: string): string {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {},
};

export const WithContent: Story = {
  args: {
    children: 'Example content',
  },
};
`;
  }

  private getStyleImport(name: string): string {
    switch (this.config.styleFormat) {
      case 'css':
      case 'scss':
        return `import './${name}.${this.config.styleFormat === 'scss' ? 'scss' : 'css'}';`;
      case 'styled-components':
        return `import styled from 'styled-components';`;
      case 'emotion':
        return `import { css } from '@emotion/react';`;
      case 'tailwind':
        return ''; // No import needed
      default:
        return '';
    }
  }

  private getStyleClassName(name: string): string {
    return this.config.styleFormat === 'tailwind' ? '' : this.kebabCase(name);
  }

  private formatComponentName(name: string): string {
    const prefix = this.config.componentPrefix || '';
    const baseName = name
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
    return prefix + baseName;
  }

  private kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .toLowerCase()
      .replace(/^-|-$/g, '');
  }

  private colorToHex(color: Color): string {
    const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  private colorToRgba(color: Color): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
  }

  private effectToCSS(effect: Effect): string {
    if ((effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') && effect.color && effect.offset) {
      const inset = effect.type === 'INNER_SHADOW' ? 'inset ' : '';
      return `${inset}${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${this.colorToRgba(effect.color)}`;
    }
    return '';
  }
}

// ============== FIGMA TO CODE CONVERTER ==============

export class FigmaToCode {
  private config: FigmaConfig;
  private client: FigmaClient;
  private tokenExtractor: DesignTokenExtractor;
  private codeGenerator: ComponentCodeGenerator;

  constructor(config: FigmaConfig, llmEngine?: LLMEngine) {
    this.config = config;
    this.client = new FigmaClient(config.accessToken);
    this.tokenExtractor = new DesignTokenExtractor();
    this.codeGenerator = new ComponentCodeGenerator(config, llmEngine);
  }

  async convertFile(fileKey: string): Promise<ConversionResult> {
    const file = await this.client.getFile(fileKey);
    const tokens = this.tokenExtractor.extractFromFile(file);
    
    const components: GeneratedComponent[] = [];
    
    // Find and convert all components
    const componentNodes = this.findComponents(file.document as unknown as FigmaNode);
    
    for (const node of componentNodes) {
      const component = await this.codeGenerator.generateComponent(node, tokens);
      components.push(component);
    }

    const globalStyles = this.generateGlobalStyles(tokens);
    const indexFile = this.generateIndexFile(components);

    return {
      components,
      tokens,
      globalStyles,
      indexFile,
    };
  }

  async convertNode(fileKey: string, nodeId: string): Promise<GeneratedComponent> {
    const { nodes } = await this.client.getFileNodes(fileKey, [nodeId]);
    const node = nodes[nodeId] as unknown as FigmaNode;
    
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const file = await this.client.getFile(fileKey);
    const tokens = this.tokenExtractor.extractFromFile(file);
    
    return this.codeGenerator.generateComponent(node, tokens);
  }

  async exportImages(fileKey: string, nodeIds: string[], format: 'svg' | 'png' = 'svg'): Promise<Record<string, string>> {
    const { images } = await this.client.getImages(fileKey, nodeIds, format);
    return images;
  }

  private findComponents(node: FigmaNode): FigmaNode[] {
    const components: FigmaNode[] = [];
    
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push(node);
    }
    
    if (node.children) {
      for (const child of node.children) {
        components.push(...this.findComponents(child));
      }
    }
    
    return components;
  }

  private generateGlobalStyles(tokens: DesignToken[]): string {
    const colorTokens = tokens.filter(t => t.type === 'color');
    const spacingTokens = tokens.filter(t => t.type === 'spacing');
    const radiusTokens = tokens.filter(t => t.type === 'borderRadius');
    const shadowTokens = tokens.filter(t => t.type === 'shadow');

    return `:root {
  /* Colors */
${colorTokens.map(t => `  --${t.name}: ${t.value};`).join('\n')}

  /* Spacing */
${spacingTokens.map(t => `  --${t.name}: ${t.value};`).join('\n')}

  /* Border Radius */
${radiusTokens.map(t => `  --${t.name}: ${t.value};`).join('\n')}

  /* Shadows */
${shadowTokens.map(t => `  --${t.name}: ${t.value};`).join('\n')}
}
`;
  }

  private generateIndexFile(components: GeneratedComponent[]): string {
    const exports = components.map(c => `export { ${c.name} } from './${c.name}';`);
    return exports.join('\n') + '\n';
  }
}

// ============== FACTORY ==============

export function createFigmaToCode(config: FigmaConfig, llmEngine?: LLMEngine): FigmaToCode {
  return new FigmaToCode(config, llmEngine);
}

export function createFigmaClient(accessToken: string): FigmaClient {
  return new FigmaClient(accessToken);
}

export function createDesignTokenExtractor(): DesignTokenExtractor {
  return new DesignTokenExtractor();
}
