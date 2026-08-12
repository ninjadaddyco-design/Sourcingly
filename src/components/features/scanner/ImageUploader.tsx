import { useState, useRef } from 'react';
import { Upload, Camera, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export const ImageUploader = ({ onImageSelect, disabled }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onImageSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageSelect(file);
    e.target.value = '';
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'relative w-full border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center',
        isDragging ? 'border-[#A3C9A8] bg-[#A3C9A8]/5 scale-[1.01]' : 'border-slate-200 dark:border-slate-700 hover:border-[#A3C9A8]/60 hover:bg-[#A3C9A8]/3',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#A3C9A8]/10 flex items-center justify-center mb-4">
        <ImageIcon size={28} className="text-[#A3C9A8]" />
      </div>
      <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Drop a product image here</h3>
      <p className="text-sm text-slate-500 mb-5">or click to browse your files — JPEG, PNG, WEBP accepted</p>
      <div className="flex items-center gap-3">
        <button type="button" disabled={disabled} onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#A3C9A8] hover:bg-[#8ab89f] text-slate-800 font-semibold rounded-xl text-sm transition-all hover:shadow-md">
          <Upload size={16} /> Browse Files
        </button>
        <span className="text-xs text-slate-400">or</span>
        <button type="button" disabled={disabled}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:border-[#A3C9A8]/50 text-slate-600 dark:text-slate-400 font-medium rounded-xl text-sm transition-all">
          <Camera size={16} /> Use Camera
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
    </div>
  );
};
