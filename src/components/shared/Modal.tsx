import { ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const Modal = ({ open, onClose, children, size = 'medium' }: Props) => {
  useEffect(() => {
    if (open) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Always restore scrolling when modal closes
        document.body.style.overflow = '';
      };
    } else {
      // Ensure scrolling is enabled when modal is closed
      document.body.style.overflow = '';
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={`${styles.content} ${styles[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
