import { useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const state = useProjectStore.getState();
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement?.tagName || ''));
      
      // Delete selected component
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused) {
        if (state.selectedComponentId) {
          e.preventDefault();
          state.removeComponent(state.selectedComponentId);
        }
      }

      // Ctrl+Z = Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        state.undo();
      }

      // Ctrl+Y or Ctrl+Shift+Z = Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        state.redo();
      }

      // Ctrl+S = Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const data = {
          projectId: state.projectId,
          projectName: state.projectName,
          settings: state.settings,
          screens: state.screens,
          components: state.components,
          variables: state.variables,
          database: state.database,
          nativeFeatures: state.nativeFeatures,
        };
        localStorage.setItem(`forge_project_${state.projectId}`, JSON.stringify(data));
      }

      // Ctrl+D = Duplicate
      if (e.ctrlKey && e.key === 'd' && !isInputFocused) {
        e.preventDefault();
        if (state.selectedComponentId) {
          state.duplicateComponent(state.selectedComponentId);
        }
      }

      // Escape = Deselect
      if (e.key === 'Escape') {
        state.selectComponent(null);
        state.setPreviewOpen(false);
        state.setApkModalOpen(false);
        state.setTemplateModalOpen(false);
        state.setFigmaModalOpen(false);
      }

      // Arrow keys = nudge selected component
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !isInputFocused && state.selectedComponentId) {
        e.preventDefault();
        const comp = state.components[state.selectedComponentId];
        if (!comp || comp.locked) return;
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        state.moveComponent(comp.id, comp.x + dx, comp.y + dy);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
};
