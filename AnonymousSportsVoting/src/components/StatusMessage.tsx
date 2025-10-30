import { useEffect } from 'react';
import type { StatusMessage as StatusMessageType } from '@/types';

interface StatusMessageProps {
  message: StatusMessageType;
  onRemove: (id: number) => void;
}

export function StatusMessage({ message, onRemove }: StatusMessageProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(message.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message.id, onRemove]);

  const bgColor = {
    success: '#c6f6d5',
    error: '#fed7d7',
    info: '#bee3f8',
  }[message.type];

  const textColor = {
    success: '#22543d',
    error: '#742a2a',
    info: '#2a4365',
  }[message.type];

  const borderColor = {
    success: '#9ae6b4',
    error: '#fc8181',
    info: '#63b3ed',
  }[message.type];

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        padding: '15px',
        borderRadius: '8px',
        margin: '10px 0',
        fontWeight: 600,
      }}
    >
      {message.message}
    </div>
  );
}
