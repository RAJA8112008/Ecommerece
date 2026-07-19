/**
 * =============================================================
 * UploadPage.jsx — Where you drop a PDF to create a course
 * =============================================================
 * 
 * Uses `react-dropzone` to create a drag-and-drop file upload area.
 * =============================================================
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload as UploadIcon, FileText, X, Sparkles, Loader2 } from 'lucide-react';

import { uploadPDF } from '../services/courseService';
import { formatFileSize } from '../utils/helpers';

export const UploadPage = () => {
  const [file, setFile] = useState(null);           // The PDF file the user selected
  const [isUploading, setIsUploading] = useState(false); // Are we currently uploading?
  const navigate = useNavigate();

  // Called when the user drops a file into the dotted box
  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    if (selected) {
      if (selected.size > 20 * 1024 * 1024) {
        return toast.error('File size must be less than 20MB');
      }
      setFile(selected); // Save the file to our state
    }
  }, []);

  // Setup the dropzone rules (only PDFs allowed, only 1 file at a time)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] }, 
    maxFiles: 1, 
    multiple: false,
  });

  // Called when they click "Generate Course"
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      await uploadPDF(file); // Send the file to our backend API
      toast.success('PDF uploaded! AI is generating your course.', { duration: 5000 });
      navigate('/dashboard'); // Go back to dashboard while it generates
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload PDF');
      setIsUploading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-3xl mx-auto min-h-screen flex flex-col justify-center">
      
      {/* Header Text */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Create <span className="gradient-text">New Course</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Upload any PDF document. Our AI will automatically structure it into lessons and quizzes.
        </p>
      </div>

      <div className="card p-2 shadow-2xl shadow-violet-900/10">
        {!file ? (
          // ================= STEP 1: DROPZONE =================
          // If no file is selected yet, show the drag & drop area
          <div {...getRootProps()} className={`border-2 border-dashed rounded-[20px] p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive ? 'border-violet-500 bg-violet-500/10 scale-[0.99]' : 'border-violet-500/20 bg-black/20 hover:bg-white/5 hover:border-violet-500/40'
          }`}>
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-6 text-violet-400 shadow-inner">
              <UploadIcon className={`w-8 h-8 ${isDragActive ? 'animate-bounce' : ''}`} />
            </div>
            <h3 className="font-display text-xl font-semibold text-white mb-2">
              {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">or click to browse files (Max 20MB)</p>
            <button className="btn-ghost pointer-events-none text-sm px-6 py-2">Select PDF File</button>
          </div>
        ) : (
          // ================= STEP 2: FILE SELECTED =================
          // If a file IS selected, show its name and the "Generate Course" button
          <div className="p-8">
            <div className="flex items-start gap-5 mb-8 p-5 rounded-[20px] glass border border-violet-500/20 relative">
              
              {/* Little X button to clear the selected file */}
              <button 
                onClick={() => setFile(null)} 
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center shrink-0 border border-rose-500/30">
                <FileText className="w-7 h-7 text-rose-400" />
              </div>
              
              <div>
                <h3 className="font-medium text-white text-lg mb-1 pr-8 truncate max-w-md">{file.name}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  {formatFileSize(file.size)} <span className="w-1 h-1 rounded-full bg-slate-600" /> PDF Document
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setFile(null)} className="btn-ghost px-6" disabled={isUploading}>
                Cancel
              </button>
              <button onClick={handleUpload} disabled={isUploading} className="btn-primary px-8 flex items-center gap-2">
                {isUploading ? (
                  <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Uploading...</>
                ) : (
                  <><Sparkles className="w-4.5 h-4.5" /> Generate Course</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
