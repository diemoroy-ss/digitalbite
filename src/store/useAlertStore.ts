import { create } from 'zustand';

interface AlertState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  openAlert: (message: string, type?: 'success' | 'warning' | 'error' | 'info', duration?: number) => void;
  closeAlert: () => void;
}

let autoCloseTimeout: NodeJS.Timeout | null = null;

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  message: '',
  type: 'info',
  openAlert: (message, type = 'info', duration) => {
    set({ isOpen: true, message, type });
    
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    
    if (duration) {
      autoCloseTimeout = setTimeout(() => {
        set({ isOpen: false });
      }, duration);
    }
  },
  closeAlert: () => {
    if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    set({ isOpen: false });
  },
}));
