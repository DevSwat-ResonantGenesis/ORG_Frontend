/**
 * Editor Module
 * 
 * Provides editor functionality for the IDE including:
 * - Editor state management (open files, tabs, content)
 * - Editor panel component with Monaco integration
 * - Save operations and unsaved changes tracking
 */

export { EditorPanel } from './EditorPanel';
export type { EditorPanelProps } from './EditorPanel';

export { useEditorState } from './useEditorState';
export type {
    Tab, UseEditorStateOptions,
    UseEditorStateReturn
} from './useEditorState';

