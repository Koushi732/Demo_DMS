"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, Download, Maximize, Minus, Plus, Printer, Search, Sparkles, AlertCircle, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function DocumentPreviewPage({ params }: { params: { id: string } }) {
  const documentId = params.id;
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const [docData, previewData] = await Promise.all([
          DocumentService.getDocument(documentId),
          DocumentService.getPreviewUrl(documentId).catch(() => ({ url: null }))
        ]);
        setDoc(docData);
        if (previewData && previewData.url) {
          setPreviewUrl(previewData.url);
        }
      } catch (err) {
        setError("Failed to load document preview.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPreview();
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-headline-md text-on-surface mb-2">Preview Unavailable</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{error}</p>
        <Link href={`/documents/${documentId}`}>
          <Button>Return to Document</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-container-low overflow-hidden -m-[24px]">
      {/* Document Header Actions */}
      <div className="bg-surface-container-lowest border-b border-outline-variant px-[24px] py-[8px] flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-[16px]">
          <Link 
            href={`/documents/${documentId}`}
            className="p-1 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-[8px]">
              <h1 className="text-title-sm font-semibold text-on-surface line-clamp-1">{doc.title}</h1>
            </div>
            <div className="text-label-caps text-on-surface-variant flex items-center gap-[8px]">
              <span>{doc.document_number}</span>
              <span>•</span>
              <span>v{doc.current_version ? 1 : 0}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-[8px]">
          {/* Zoom Controls */}
          <div className="flex items-center border border-outline-variant rounded bg-surface mr-[8px]">
            <button 
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="px-3 py-1 hover:bg-surface-container-low text-on-surface-variant transition-colors border-r border-outline-variant"
            >
              <Minus size={18} />
            </button>
            <span className="text-body-sm px-3 text-on-surface w-16 text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="px-3 py-1 hover:bg-surface-container-low text-on-surface-variant transition-colors border-l border-outline-variant"
            >
              <Plus size={18} />
            </button>
          </div>
          
          {/* Action Buttons */}
          <button className="p-2 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors">
            <Printer size={20} />
          </button>
          <button className="p-2 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors">
            <Download size={20} />
          </button>
          <button className="p-2 rounded hover:bg-surface-container-low text-on-surface-variant transition-colors">
            <Maximize size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* PDF Canvas Area */}
        <div className="flex-1 relative overflow-auto bg-[#E5E7EB] flex justify-center py-[32px]">
          {previewUrl ? (
            <iframe 
              src={previewUrl} 
              className="w-full h-full border-0 bg-white shadow-md max-w-5xl"
              title={doc.title}
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            />
          ) : (
            <div className="w-[816px] h-[1056px] bg-white shadow-md transition-transform origin-top flex items-center justify-center text-on-surface-variant" style={{ transform: `scale(${zoom / 100})` }}>
              <p>No preview available for this document format.</p>
            </div>
          )}
        </div>

        {/* Right Side Metadata Panel */}
        <aside className="hidden xl:flex w-[320px] bg-surface-container-lowest border-l border-outline-variant flex-col h-full overflow-y-auto shrink-0 z-20 shadow-[-4px_0_12px_rgba(15,23,42,0.02)]">
          <div className="p-[16px] border-b border-outline-variant sticky top-0 bg-surface-container-lowest/90 backdrop-blur z-10">
            <h3 className="text-title-sm font-semibold text-on-surface">Document Details</h3>
          </div>
          
          <div className="p-[16px] space-y-6">
            {/* AI Summary Card */}
            <div className="rounded border border-primary/20 bg-[#F0FDFA] p-3 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary"></div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Sparkles size={18} />
                <span className="text-label-caps font-semibold">AI Insight Summary</span>
              </div>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                This document is related to {doc.title}. Key information extracted by AI.
              </p>
              <button className="mt-3 text-primary text-label-caps flex items-center gap-1 hover:underline">
                View citations <ArrowRight size={14} />
              </button>
            </div>
            
            {/* Lifecycle Timeline */}
            <div>
              <h4 className="text-label-caps text-on-surface-variant mb-4 uppercase tracking-wider">Lifecycle Status</h4>
              <div className="relative pl-4 space-y-4">
                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-outline-variant"></div>
                
                <div className="relative z-10 flex items-start gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#10b981] ring-4 ring-surface-container-lowest mt-1"></div>
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Draft Created</p>
                    <p className="font-code-data text-on-surface-variant text-[10px]">{new Date(doc.created_at).toLocaleDateString()} • {doc.owner_id ? "Owner" : ""}</p>
                  </div>
                </div>
                
                <div className="relative z-10 flex items-start gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ring-4 ring-surface-container-lowest mt-1 relative ${doc.status === 'APPROVED' ? 'bg-[#10b981]' : doc.status === 'REVIEW' ? 'bg-primary' : 'border-2 border-dashed border-outline-variant bg-surface-container-lowest'}`}>
                    {doc.status === 'REVIEW' && <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-75"></div>}
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">QA Review</p>
                    <p className="font-code-data text-on-surface-variant text-[10px]">{doc.status === 'REVIEW' ? 'Current Status' : 'Pending'}</p>
                  </div>
                </div>
                
                <div className="relative z-10 flex items-start gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ring-4 ring-surface-container-lowest mt-1 relative ${doc.status === 'APPROVED' ? 'bg-primary' : 'border-2 border-dashed border-outline-variant bg-surface-container-lowest'}`}>
                    {doc.status === 'APPROVED' && <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-75"></div>}
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">Effective</p>
                    <p className="font-code-data text-on-surface-variant text-[10px]">{doc.status === 'APPROVED' ? 'Current Status' : 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Properties Table */}
            <div>
              <h4 className="text-label-caps text-on-surface-variant mb-2 uppercase tracking-wider">Properties</h4>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-2 text-body-sm font-medium text-on-surface-variant w-1/2">Department</th>
                    <td className="py-2 text-body-sm text-on-surface">{doc.department?.name || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-2 text-body-sm font-medium text-on-surface-variant">Document Type</th>
                    <td className="py-2 text-body-sm text-on-surface">{doc.document_type?.name || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </aside>
      </div>
    </div>
  );
}
