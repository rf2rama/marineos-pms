import React, { useRef, useState } from 'react';
import { UploadCloud, File, Trash2, CheckCircle2 } from 'lucide-react';
import { AttachmentFile } from '../../types';
import { storageService } from '../../services/storageService';

export interface FileUploadProps {
  bucket?: string;
  path?: string;
  onFileUploaded: (file: AttachmentFile) => void;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket = 'marineos-files',
  path = 'uploads',
  onFileUploaded,
  accept = 'image/*,.pdf,.doc,.docx',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<AttachmentFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    try {
      const res = await storageService.uploadFile(bucket, `${path}/${Date.now()}_${file.name}`, file);
      setUploadedFile(res);
      onFileUploaded(res);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      {uploadedFile ? (
        <div className="flex items-center justify-between p-3 bg-slate-900 border border-emerald-500/30 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="truncate max-w-[200px] font-medium text-white">{uploadedFile.name}</span>
          </div>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-slate-500 hover:text-red-400 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 transition-colors bg-slate-900/40 text-slate-400 hover:text-slate-200"
        >
          <UploadCloud className="w-6 h-6 text-blue-400" />
          <span className="text-xs font-medium">
            {isUploading ? 'Uploading file...' : 'Click to upload attachment'}
          </span>
          <span className="text-[10px] text-slate-500">PDF, JPG, PNG or DOCX up to 10MB</span>
        </button>
      )}
    </div>
  );
};
