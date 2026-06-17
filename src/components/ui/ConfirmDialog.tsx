import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  /** If set, user must type this string to confirm */
  confirmText?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  confirmText,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  const canConfirm = confirmText ? typed === confirmText : true;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
      setTyped('');
    }
  };

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full mt-2 sm:mt-0">
          <Button variant="secondary" onClick={handleClose} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
            disabled={!canConfirm}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {confirmText && (
        <div className="pt-2">
          <p className="text-sm text-gray-600 mb-2">
            Type <strong>{confirmText}</strong> to confirm:
          </p>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={confirmText}
            aria-label="Confirm by typing"
          />
        </div>
      )}
    </Modal>
  );
}
