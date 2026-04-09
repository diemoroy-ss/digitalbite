import { create } from 'zustand';

interface AlertState {
  isOpen: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  openAlert: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  message: '',
  type: 'info',
  openAlert: (message, type = 'info') => set({ isOpen: true, message, type }),
  closeAlert: () => set({ isOpen: false }),
}));
