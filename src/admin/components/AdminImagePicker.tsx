import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X, Eye, ExternalLink } from 'lucide-react';

interface AdminImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helpText?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'auto';
  className?: string;
  presetImages?: Array<{ label: string; url: string }>;
}

export default function AdminImagePicker({
  label,
  value,
  onChange,
  helpText = 'Provide a valid image URL or choose from uploaded media.',
  aspectRatio = '16:9',
  className = '',
  presetImages = [],
}: AdminImagePickerProps) {
  const [imageError, setImageError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video'
      : aspectRatio === '4:3'
      ? 'aspect-4/3'
      : aspectRatio === '1:1'
      ? 'aspect-square'
      : 'h-40';

  const handleClear = () => {
    onChange('');
    setImageError(false);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-slate-800">
          {label}
        </label>
        {value && (
          <span className="text-xs text-slate-500 truncate max-w-[200px]">
            {value.split('/').pop()}
          </span>
        )}
      </div>

      {/* Thumbnail Preview Area */}
      <div
        className={`relative w-full ${aspectClass} rounded-xl border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center group`}
      >
        {value && !imageError ? (
          <>
            <img
              src={value}
              alt={label}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-contain p-2 bg-slate-50 transition-transform duration-200 group-hover:scale-102"
            />
            {/* Quick action overlay */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="min-h-[40px] min-w-[40px] px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015557]"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="min-h-[40px] min-w-[40px] px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <ImageIcon className="w-8 h-8 mb-2 stroke-1" />
            <p className="text-xs font-medium text-slate-600">
              {imageError ? 'Could not load image from URL' : 'No image selected'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Paste an image link below or choose a preset
            </p>
          </div>
        )}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setImageError(false);
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full min-h-[44px] px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#015557] focus-visible:border-[#015557]"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear image URL"
            title="Clear image"
            className="min-h-[44px] min-w-[44px] px-3 flex items-center justify-center text-slate-500 hover:text-[#d80000] bg-slate-100 hover:bg-red-50 border border-slate-300 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d80000]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preset Quick Chooser */}
      {presetImages.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-medium text-slate-600">Select Media Preset</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presetImages.map((img) => (
              <button
                key={img.url}
                type="button"
                onClick={() => {
                  onChange(img.url);
                  setImageError(false);
                }}
                className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                  value === img.url
                    ? 'border-[#015557] bg-emerald-50/50 ring-1 ring-[#015557]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-8 h-8 rounded object-cover shrink-0 bg-slate-100"
                />
                <span className="text-xs font-medium text-slate-700 truncate">
                  {img.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {helpText && (
        <p className="text-xs text-slate-500 leading-relaxed">
          {helpText}
        </p>
      )}

      {/* Large View Modal */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">{label}</span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={value}
                alt={label}
                className="max-w-full max-h-[70vh] rounded object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
