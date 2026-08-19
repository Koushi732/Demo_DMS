"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadCloud, X, File, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DocumentService, DocumentType } from "@/services/documentService";

export default function DocumentUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState("");
  const [department, setDepartment] = useState("");
  const [classification, setClassification] = useState("Internal Public");
  const [tagsInput, setTagsInput] = useState("");
  
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTypes() {
      try {
        const types = await DocumentService.getDocumentTypes();
        setDocumentTypes(types);
        if (types.length > 0) {
          setDocumentTypeId(types[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load document types:", err);
      }
    }
    loadTypes();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      handleFileSelection(selectedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    // Check file size (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit.");
      return;
    }
    setError(null);
    setFile(selectedFile);
    // Auto-fill title from filename if empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!title || !documentTypeId) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Parse tags
      const tags = tagsInput
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // 1. Create Document Record
      const doc = await DocumentService.createDocument({
        title,
        description: description || undefined,
        document_type_id: documentTypeId,
        classification,
        tags: tags.length > 0 ? tags : undefined
        // Note: department_id would be mapped here if we loaded departments, using string for now or skipping
      });

      // 2. Upload File to create Version 1
      await DocumentService.uploadVersion(doc.id, file, "Initial upload");

      // 3. Navigate to processing/details
      router.push(`/documents/${doc.id}/processing`);
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-[24px] overflow-y-auto max-w-[1000px] mx-auto w-full">
      <div className="flex items-center gap-[8px] text-on-surface-variant text-body-sm mb-[24px]">
        <Link href="/documents" className="hover:text-primary transition-colors">Documents</Link>
        <ChevronRight size={16} />
        <span>Upload Document</span>
      </div>

      <div className="mb-[32px]">
        <h1 className="text-display-lg text-on-surface">Upload Document</h1>
        <p className="text-body-md text-on-surface-variant mt-[4px]">
          Add a new controlled document to the repository.
        </p>
      </div>

      {error && (
        <div className="mb-[24px] p-[16px] bg-error-container text-on-error-container rounded-lg border border-error flex items-start gap-[12px]">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="text-body-md">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-[32px]">
        
        {/* File Dropzone */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-[32px]">
          <h2 className="text-title-sm text-on-surface mb-[16px]">1. Select File</h2>
          
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-[48px] flex flex-col items-center justify-center transition-colors text-center
                ${isDragging ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/50"}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.tiff"
              />
              <UploadCloud size={48} className="text-primary mb-[16px]" />
              <p className="text-title-sm text-on-surface mb-[8px]">Click to upload or drag and drop</p>
              <p className="text-body-sm text-on-surface-variant max-w-md mx-auto">
                PDF, Word, Excel, PowerPoint, Text, or Images allowed. Maximum file size 100MB.
              </p>
            </div>
          ) : (
            <div className="border border-outline-variant rounded-lg p-[24px] flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-[16px]">
                <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded flex items-center justify-center shrink-0">
                  <File size={24} />
                </div>
                <div>
                  <p className="text-body-md font-medium text-on-surface">{file.name}</p>
                  <p className="text-body-sm text-on-surface-variant">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setFile(null)}
                className="p-[8px] text-on-surface-variant hover:text-error hover:bg-error-container/50 rounded transition-colors"
                title="Remove file"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </section>

        {/* Basic Metadata */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-[32px] opacity-100 transition-opacity" style={{ opacity: file ? 1 : 0.6, pointerEvents: file ? 'auto' : 'none' }}>
          <h2 className="text-title-sm text-on-surface mb-[24px]">2. Document Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {/* Title - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-label-caps text-on-surface-variant mb-[4px]">Document Title *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Standard Operating Procedure for Batch Record Review"
                className="w-full h-[40px] px-[12px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface input-focus-ring" 
                required
              />
            </div>
            
            {/* Description - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-label-caps text-on-surface-variant mb-[4px]">Description (Optional)</label>
              <textarea 
                rows={3} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the purpose of this document..."
                className="w-full p-[12px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface resize-none input-focus-ring" 
              />
            </div>
            
            {/* Type */}
            <div>
              <label className="block text-label-caps text-on-surface-variant mb-[4px]">Document Type *</label>
              <select 
                value={documentTypeId}
                onChange={(e) => setDocumentTypeId(e.target.value)}
                className="w-full h-[40px] px-[12px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface input-focus-ring"
                required
              >
                <option value="" disabled>Select a type...</option>
                {documentTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.prefix})</option>
                ))}
              </select>
            </div>
            
            {/* Classification */}
            <div>
              <label className="block text-label-caps text-on-surface-variant mb-[4px]">Data Classification</label>
              <select 
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full h-[40px] px-[12px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface input-focus-ring"
              >
                <option>Internal Public</option>
                <option>Confidential</option>
                <option>Strictly Confidential</option>
              </select>
            </div>

            {/* Tags - Full Width */}
            <div className="md:col-span-2">
              <label className="block text-label-caps text-on-surface-variant mb-[4px]">Tags (Comma separated)</label>
              <input 
                type="text" 
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Quality, SOP, Lab"
                className="w-full h-[40px] px-[12px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface input-focus-ring" 
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-[12px] pt-[16px]">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!file || !title || !documentTypeId || isSubmitting} className="gap-[8px]">
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Upload & Process
              </>
            )}
          </Button>
        </div>
        
      </form>
    </div>
  );
}
