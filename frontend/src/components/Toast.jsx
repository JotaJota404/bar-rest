import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium">
        <CheckCircle2 className="w-5 h-5" />
        <span>{message}</span>
      </div>
    </div>
  );
}
