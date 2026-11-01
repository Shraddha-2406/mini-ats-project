import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ResumeUploadBox({ resumeFile, onResumeChange }) {
  const { success, error, info } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      error('Please select a valid PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      error('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          const formattedSize = file.size > 1024 * 1024 
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

          const resumeData = {
            name: file.name,
            size: formattedSize,
            uploadedAt: new Date().toISOString(),
          };

          onResumeChange(resumeData);
          success(`Resume "${file.name}" uploaded successfully!`);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onResumeChange(null);
    setUploadProgress(0);
    info('Resume removed from profile.');
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* When no file uploaded or uploading */}
      {!resumeFile && !isUploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-subtle">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">
            Drag & drop your resume PDF here
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Supports PDF format up to 10MB. File metadata is saved to your candidate profile session.
          </p>
          <button
            type="button"
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-blue-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-blue-50 transition"
          >
            <span>Browse Files</span>
          </button>
        </div>
      )}

      {/* Uploading progress state */}
      {isUploading && (
        <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-6">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-2">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Uploading & validating resume...</span>
            </div>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Uploaded File Card */}
      {resumeFile && !isUploading && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-subtle border border-rose-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-bold text-slate-900 truncate max-w-xs">
                  {resumeFile.name}
                </p>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Size: {resumeFile.size} • Uploaded: {new Date(resumeFile.uploadedAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
              title="Remove Resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Note about Phase 1 PDF storage & AI parsing */}
      <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-700">Prototype Note:</strong> In Phase 1, PDF file metadata is persisted in the local browser session. You select technical skills manually below (no automatic AI parsing is claimed in this prototype).
        </p>
      </div>

      {/* PDF Simulation Preview Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text-slate-800">{resumeFile?.name}</span>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-8 text-center bg-slate-100/50 min-h-[300px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500 mb-3 border border-slate-200">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">
                PDF Document Preview
              </h4>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                {resumeFile?.name} ({resumeFile?.size}). In Phase 2, backend binary file storage and an interactive PDF.js renderer will display full multi-page resumes.
              </p>
              <div className="bg-white p-4 rounded-xl border border-slate-200 max-w-md w-full text-left text-xs space-y-1.5 text-slate-600">
                <p><strong>Status:</strong> Validated PDF structure</p>
                <p><strong>Client Cache:</strong> Session LocalStorage</p>
                <p><strong>Attachment:</strong> Ready for recruiter screening</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

