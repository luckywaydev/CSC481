/**
 * Confirm Modal Component
 * Modal สำหรับยืนยันการกระทำ แทน window.confirm()
 */

"use client";

import { Button } from "./Button";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmModalProps) {
  const bgColor = {
    danger: "bg-red-500/20 border-red-500/50",
    warning: "bg-yellow-500/20 border-yellow-500/50",
    info: "bg-purple-500/20 border-purple-500/50",
  }[type];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-secondary/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-background-tertiary shadow-2xl animate-slide-in-right">
        <h3 className="text-2xl font-bold text-text-primary mb-4">{title}</h3>
        
        <div className={`${bgColor} border rounded-xl p-4 mb-6`}>
          <p className="text-text-primary whitespace-pre-line">{message}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook สำหรับใช้งาน Confirm Modal
interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

let confirmResolver: ((value: boolean) => void) | null = null;
const confirmListeners: Array<(options: ConfirmOptions | null) => void> = [];

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    confirmResolver = resolve;
    confirmListeners.forEach((listener) => listener(options));
  });
}

export function ConfirmContainer() {
  const [confirmOptions, setConfirmOptions] = React.useState<ConfirmOptions | null>(null);

  React.useEffect(() => {
    const listener = (options: ConfirmOptions | null) => {
      setConfirmOptions(options);
    };
    confirmListeners.push(listener);
    return () => {
      const index = confirmListeners.indexOf(listener);
      if (index > -1) confirmListeners.splice(index, 1);
    };
  }, []);

  if (!confirmOptions) return null;

  return (
    <ConfirmModal
      {...confirmOptions}
      onConfirm={() => {
        confirmResolver?.(true);
        setConfirmOptions(null);
      }}
      onCancel={() => {
        confirmResolver?.(false);
        setConfirmOptions(null);
      }}
    />
  );
}

// Import React
import React from "react";
