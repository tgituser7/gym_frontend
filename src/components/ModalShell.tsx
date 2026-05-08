'use client';

import { X } from 'lucide-react';

interface Props {
  title: string;
  formId: string;
  onClose: () => void;
  loading: boolean;
  submitLabel: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export default function ModalShell({
  title, formId, onClose, loading, submitLabel, maxWidth = 'max-w-lg', children,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4">
      <div className={`bg-white w-full ${maxWidth} max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-xl sm:rounded-xl shadow-xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" form={formId} className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
