export interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  icon?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmConfig {
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}
