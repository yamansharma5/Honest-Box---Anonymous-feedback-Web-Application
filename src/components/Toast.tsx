"use client";

import { useEffect } from "react";

export default function Toast({ message, open, onClose }: { message: string; open: boolean; onClose: () => void; }){
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 shadow-lg">
      {message}
    </div>
  );
}
