"use client";

import { useEffect, useState } from "react";
import { AlertCircle as ErrorIcon, AlertTriangle, CalendarDays, CheckCircle, ChevronRight, FileText, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function AIDocumentSummaryPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docData = await DocumentService.getDocument(documentId);
        setDoc(docData);
        
        // Fetch AI insights
        const [sumData, metaData] = await Promise.all([
          DocumentService.getSummary(documentId),
          DocumentService.getExtractedMetadata(documentId)
        ]);
        
        setSummary(sumData);
        setMetadata(metaData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    if (documentId) {
      fetchData();
    }
  }, [documentId]);

  if (loading) {
    return <div className="p-8">Loading AI Analysis...</div>;
  }

  if (!doc) {
    return <div className="p-8">Document not found.</div>;
  }

  return (
    <div className="flex-1 p-[16px] md:p-[40px] flex flex-col max-w-[1440px] mx-auto w-full gap-[40px] bg-background">
      
      {/* Header Section */}
      <div className="flex flex-col gap-[16px]">
        <div className="flex items-center gap-[8px] text-on-surface-variant font-body-sm text-body-sm">
          <Link href="/intelligence" className="hover:text-primary transition-colors">Document Intelligence</Link>
          <ChevronRight fontSize="small" />
          <Link href="#" className="hover:text-primary transition-colors">{doc.document_number}</Link>
          <ChevronRight fontSize="small" />
          <span className="text-primary font-semibold">AI Summary</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[16px]">
          <div>
            <h2 className="text-display-lg text-on-surface flex items-center gap-[16px]">
              {doc.document_number} Analysis
            </h2>
            <p className="text-body-md text-on-surface-variant mt-[4px]">{doc.title}</p>
          </div>
          <div className="flex items-center gap-[8px] bg-[#fffbeb] border border-[#fef3c7] px-[16px] py-[8px] rounded-lg shadow-sm">
            <AlertTriangle className="text-[#d97706]" />
            <div className="flex flex-col">
              <span className="text-label-caps uppercase tracking-wider text-[#92400e]">AI-Generated Summary</span>
              <span className="text-body-sm text-[#b45309]">Review against original source document</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bento Grid Layout for Summary Sections */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[16px] md:gap-[24px]">
        
        {/* Executive Summary (Span 8) */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] relative shadow-sm flex flex-col gap-[16px]">
          <div className="absolute inset-0 rounded-xl p-[1px] pointer-events-none" style={{ background: 'linear-gradient(135deg, #0b1c30, #14b8a6)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}></div>
          
          <div className="flex items-center gap-[8px] border-b border-surface-variant pb-[8px] relative z-10">
            <FileText className="text-primary" />
            <h3 className="text-title-sm text-on-surface">Executive Summary</h3>
          </div>
          <p className="text-body-md text-on-surface leading-relaxed relative z-10">
            {summary?.summary || "No summary generated."}
          </p>
        </div>
        
        {/* Key Points (Span 4) */}
        <div className="col-span-1 md:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] shadow-sm flex flex-col gap-[16px]">
          <div className="flex items-center gap-[8px] border-b border-surface-variant pb-[8px]">
            <Lightbulb className="text-primary" />
            <h3 className="text-title-sm text-on-surface">Key Points</h3>
          </div>
          <ul className="text-body-md text-on-surface space-y-[8px]">
            {summary?.key_points?.map((pt: string, idx: number) => (
              <li key={idx} className="flex items-start gap-[8px]">
                <CheckCircle className="text-primary mt-[4px]" size={18} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Important Dates & Responsibilities (Span 6) */}
        <div className="col-span-1 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] shadow-sm flex flex-col gap-[16px]">
          <div className="flex justify-between items-center border-b border-surface-variant pb-[8px]">
            <div className="flex items-center gap-[8px]">
              <CalendarDays className="text-primary" />
              <h3 className="text-title-sm text-on-surface">Timeline &amp; Classification</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[16px]">
            <div>
              <h4 className="text-label-caps text-on-surface-variant uppercase tracking-wider mb-[8px]">Critical Dates</h4>
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center justify-between p-[8px] bg-surface-container-low rounded">
                  <span className="text-body-sm">Effective Date</span>
                  <span className="font-code-data font-semibold">{doc.effective_date ? new Date(doc.effective_date).toISOString().split('T')[0] : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-[8px] bg-surface-container-low rounded">
                  <span className="text-body-sm">Next Review</span>
                  <span className="font-code-data font-semibold">{doc.next_review_date ? new Date(doc.next_review_date).toISOString().split('T')[0] : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-label-caps text-on-surface-variant uppercase tracking-wider mb-[8px]">AI Classification</h4>
              <div className="flex flex-col gap-[8px]">
                 <div className="flex items-center justify-between p-[8px] bg-surface-container-low rounded">
                  <span className="text-body-sm">Type</span>
                  <span className="font-code-data font-semibold">{metadata?.classification_suggestion || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Entities (Span 6) */}
        <div className="col-span-1 md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] shadow-sm flex flex-col gap-[16px]">
          <div className="flex items-center gap-[8px] border-b border-outline-variant pb-[8px]">
            <h3 className="text-title-sm text-on-surface">Extracted Entities</h3>
          </div>
          <div className="flex flex-col gap-[8px]">
             {metadata?.entities?.map((ent: any, idx: number) => (
                <div key={idx} className="p-[8px] bg-surface-container-low rounded flex gap-[8px] items-center justify-between">
                   <div className="flex gap-[8px] items-center">
                     <span className="px-2 py-1 bg-surface-container-high border border-outline-variant rounded text-[11px] font-medium text-on-surface">{ent.type}</span>
                     <span className="text-body-sm font-semibold text-on-surface">{ent.value}</span>
                   </div>
                   <span className="text-body-sm text-on-surface-variant">{ent.section}</span>
                </div>
             ))}
          </div>
        </div>
        
      </div>
      
    </div>
  );
}
