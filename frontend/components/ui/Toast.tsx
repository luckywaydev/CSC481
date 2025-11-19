/**
 * Toast Notification Component
 * แสดงการแจ้งเตือนแบบ toast แทน alert/confirm
 */

"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-green-500/20 border-green-500/50",
    error: "bg-red-500/20 border-red-500/50",
    warning: "bg-yellow-500/20 border-yellow-500/50",
    info: "bg-purple-500/20 border-purple-500/50",
  }[type];

  const icon = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${bgColor} border rounded-xl p-4 shadow-lg backdrop-blur-sm animate-slide-in-right max-w-md`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-text-primary flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Toast Container for managing multiple toasts
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toastListeners: Array<(toast: ToastMessage) => void> = [];

export function showToast(message: string, type: ToastType = "info") {
  const toast: ToastMessage = {
    id: `toast-${toastId++}`,
    message,
    type,
  };
  toastListeners.forEach((listener) => listener(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (toast: ToastMessage) => {
      setToasts((prev) => [...prev, toast]);
    };
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }}
        />
      ))}
    </div>
  );
}
