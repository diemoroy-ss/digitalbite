import { create } from 'zustand';

interface AlertState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  isConfirm?: boolean;
  hasInput?: boolean;
  inputValue?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  openAlert: (message: string, type?: 'success' | 'warning' | 'error' | 'info', duration?: number) => void;
  openConfirm: (options: { 
    message: string, 
    type?: 'success' | 'warning' | 'error' | 'info', 
    onConfirm: () => void, 
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
    hasInput?: boolean,
    initialInputValue?: string
  }) => void;
  closeAlert: () => void;
  setInputValue: (val: string) => void;
}

let autoCloseTimeout: NodeJS.Timeout | null = null;

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  message: '',
  type: 'info',
  isConfirm: false,
  hasInput: false,
  inputValue: '',
  setInputValue: (inputValue) => set({ inputValue }),
  openAlert: (message, type = 'info', duration) => {
    set({ isOpen: true, message, type, isConfirm: false, hasInput: false, onConfirm: undefined, onCancel: undefined });
    
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    
    if (duration) {
      autoCloseTimeout = setTimeout(() => {
        set({ isOpen: false });
      }, duration);
    }
  },
  openConfirm: ({ message, type = 'warning', onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', hasInput = false, initialInputValue = '' }) => {
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    set({ 
      isOpen: true, 
      message, 
      type, 
      isConfirm: true, 
      onConfirm, 
      onCancel, 
      confirmText, 
      cancelText,
      hasInput,
      inputValue: initialInputValue
    });
  },
  closeAlert: () => {
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    set({ isOpen: false });
  },
}));
