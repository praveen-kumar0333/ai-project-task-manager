import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Database,
  Layers,
  HardDrive
} from 'lucide-react';
import { uploadDocument, getDocuments, deleteDocument } from '../../services/api.js';

/**
 * Format raw byte size into human-readable string.
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DocumentKnowledgeBase({ onDocumentsChanged }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await getDocuments();
      const docs = response?.data || [];
      setDocuments(docs);
      if (onDocumentsChanged) {
        onDocumentsChanged(docs);
      }
    } catch (err) {
      console.error('Failed to fetch knowledge base documents:', err);
      setErrorMessage(err?.message || 'Failed to load documents from knowledge base.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate type
    const validExtensions = ['.pdf', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => lowerName.endsWith(ext));
    const isValidMime = file.type === 'application/pdf' || file.type === 'text/plain';

    if (!isValidExt && !isValidMime) {
      setErrorMessage('Invalid file format. Only PDF (.pdf) and Plain Text (.txt) documents are supported.');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await uploadDocument(file);
      const created = response?.data;
      setSuccessMessage(`"${file.name}" was indexed into ${created?.chunkCount || 1} semantic chunks.`);
      await loadDocuments();
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMessage(err?.message || 'Failed to process and index document into knowledge base.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDelete = async (docId, docName) => {
    if (!window.confirm(`Are you sure you want to delete "${docName}" from your knowledge base? All indexed chunks will be removed.`)) {
      return;
    }

    setDeletingId(docId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await deleteDocument(docId);
      setSuccessMessage(`Document "${docName}" removed from knowledge base.`);
      await loadDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
      setErrorMessage(err?.message || 'Failed to delete document from knowledge base.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalChunks = documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0);
  const totalSize = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);

  return (
    <div id="knowledge-base-container" className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">RAG Document Knowledge Base</h2>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Upload project specifications, architecture notes, or technical documents. The AI automatically chunks, embeds, and retrieves relevant excerpts to ground its answers with source citations.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-center">
            <span className="text-xs text-slate-600 block">Documents</span>
            <span className="text-base font-bold text-slate-900">{documents.length}</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-center">
            <span className="text-xs text-slate-600 block">Indexed Chunks</span>
            <span className="text-base font-bold text-indigo-600">{totalChunks}</span>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-center">
            <span className="text-xs text-slate-600 block">Total Storage</span>
            <span className="text-base font-bold text-slate-700">{formatBytes(totalSize)}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
          <button 
            type="button" 
            onClick={() => setErrorMessage('')}
            className="text-red-500 hover:text-red-700 font-medium text-xs ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">{successMessage}</div>
          <button 
            type="button" 
            onClick={() => setSuccessMessage('')}
            className="text-emerald-600 hover:text-emerald-800 font-medium text-xs ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div 
        id="document-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver 
            ? 'border-indigo-500 bg-indigo-50/50' 
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept=".pdf,.txt,application/pdf,text/plain" 
          className="hidden" 
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            {isUploading ? 'Extracting text and generating vector embeddings...' : 'Click to upload or drag & drop documents'}
          </h3>
          
          <p className="text-xs text-slate-600 mb-2">
            Supports <strong>PDF</strong> and <strong>TXT</strong> files up to 10MB each.
          </p>

          <p className="text-xs text-slate-600">
            Files are automatically parsed, segmented into semantic chunks, and embedded for cosine search.
          </p>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Uploaded Documents</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {documents.length}
            </span>
          </div>

          <button
            type="button"
            onClick={loadDocuments}
            disabled={isLoading}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-600 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span className="text-sm">Loading knowledge base...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-10 text-center">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-slate-700 mb-1">No documents uploaded yet</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Upload PDF or TXT documents to give your AI assistant domain-specific knowledge about your project.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 truncate" title={doc.originalName}>
                        {doc.originalName}
                      </span>
                      <span className="text-2xs uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {doc.mimeType?.includes('pdf') || doc.originalName.endsWith('.pdf') ? 'PDF' : 'TXT'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-slate-600" />
                        {formatBytes(doc.fileSize)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-indigo-600 font-medium">
                        <Layers className="w-3 h-3" />
                        {doc.chunkCount} {doc.chunkCount === 1 ? 'chunk' : 'chunks'} indexed
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(doc.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id, doc.originalName)}
                    disabled={deletingId === doc.id}
                    title="Delete document and vector chunks"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
