import { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from "react";

interface ReceiptUploadProps {
  onFileSelect: (file: File | null) => void;
  initialUrl?: string;
  disabled?: boolean;
}

export const ReceiptUpload = ({
  onFileSelect,
  initialUrl,
  disabled = false,
}: ReceiptUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (previewUrl) {
    return (
      <div className="relative inline-block">
        <img
          src={previewUrl}
          alt="Receipt preview"
          className="max-h-48 rounded-lg border"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2"
          onClick={handleRemove}
          disabled={disabled}
        >
          <X size={16} />
        </Button>
      </div>
    );
  }

  if (fileName) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-lg">
        <FileText size={24} className="text-gray-400" />
        <span className="text-sm flex-1">{fileName}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={disabled}
        >
          <X size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={handleClick}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-2">
          <span className="text-sm text-blue-600 hover:text-blue-500">
            Загрузить чек
          </span>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF до 5MB</p>
        </div>
      </div>
    </div>
  );
};
