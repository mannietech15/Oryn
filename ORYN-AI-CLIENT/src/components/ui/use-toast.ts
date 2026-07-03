import { useState, useEffect, useCallback } from 'react';

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

let memoryState: ToastProps[] = [];
let listeners: Function[] = [];

export function toast(props: Omit<ToastProps, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast = { ...props, id };
  memoryState = [newToast, ...memoryState].slice(0, 5); // keep max 5
  listeners.forEach(l => l(memoryState));

  // Auto dismiss after 5s
  setTimeout(() => {
    dismissToast(id);
  }, 5000);
}

export function dismissToast(id: string) {
  memoryState = memoryState.filter(t => t.id !== id);
  listeners.forEach(l => l(memoryState));
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(memoryState);

  useEffect(() => {
    const listener = (state: ToastProps[]) => setToasts([...state]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return { toasts, toast, dismiss: dismissToast };
}
