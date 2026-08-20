"use client";

import { useEffect, useState } from "react";
import { 
  Check, 
  Loader2, 
  Brain, 
  Database, 
  Search as SearchIcon, 
  CheckCircle2, 
  FileText
} from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function DocumentProcessingPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [processingStatus, setProcessingStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docData, statusData] = await Promise.all([
          DocumentService.getDocument(id),
          DocumentService.getProcessingStatus(id)
        ]);
        setDoc(docData);
        setProcessingStatus(statusData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!doc) {
    return <div className="p-8">Document not found</div>;
  }
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-[24px]">
        <div className="max-w-[1440px] mx-auto space-y-[24px]">
          
          {/* Page Header & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-[40px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-label-caps bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded border-l-2 border-secondary font-semibold">
                  {processingStatus?.status || 'PROCESSING'}
                </span>
                <span className="font-code-data text-on-surface-variant">ID: {doc.document_number}</span>
              </div>
              <h2 className="text-display-lg text-on-surface flex items-center gap-3">
                <FileText size={36} className="text-on-surface-variant" />
                {doc.title}
              </h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                Initiated by System via API • {new Date(doc.updated_at).toUTCString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-outline-variant rounded text-body-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
                Cancel Processing
              </button>
              <button className="px-4 py-2 bg-primary text-on-primary rounded text-body-sm font-semibold hover:bg-primary/90 transition-colors">
                View Results
              </button>
            </div>
          </div>
          
          {/* Main Processing State Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-[24px] shadow-sm">
            <div className="flex justify-between items-center mb-[24px] pb-[16px] border-b border-outline-variant">
              <div>
                <h3 className="text-title-sm text-on-surface">Intelligence Extraction Pipeline</h3>
                <p className="text-body-sm text-on-surface-variant">Pipeline Status: {processingStatus?.status}</p>
              </div>
              <div className="text-right">
                <div className="text-title-sm text-primary">{processingStatus?.overall_progress || 0}% Complete</div>
                <div className="w-48 h-2 bg-surface-container-high rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-in-out" style={{ width: `${processingStatus?.overall_progress || 0}%` }}></div>
                </div>
              </div>
            </div>
            
            {/* Pipeline Layout */}
            <div className="relative pl-6 py-4 space-y-8 before:absolute before:inset-0 before:ml-[31px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-surface-container-high">
              
              {/* Real Processing Steps */}
              {processingStatus?.steps?.map((step: any, index: number) => {
                const stepNum = index + 1;
                const isCompleted = step.status === 'COMPLETED';
                const isInProgress = step.status === 'PROCESSING';
                const isPending = step.status === 'QUEUED' || !step.status;

                return (
                  <div key={stepNum} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isPending ? 'opacity-60' : ''}`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 z-10 -ml-4 md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2 ${
                      isCompleted ? 'border-primary bg-primary text-on-primary' :
                      isInProgress ? 'border-primary bg-surface-container-lowest text-primary shadow-[0_0_0_4px_rgba(15,23,42,0.1)]' :
                      'border-outline-variant border-dashed bg-surface-container-lowest text-outline-variant'
                    }`}>
                      {isCompleted ? <Check size={16} strokeWidth={3} /> :
                       isInProgress ? <Loader2 size={16} className="animate-spin" /> :
                       <Database size={16} />}
                    </div>
                    <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded ml-4 md:ml-0 ${
                      isInProgress ? 'bg-surface border-t-2 border-primary shadow-md' :
                      isCompleted ? 'bg-surface-bright border border-outline-variant' :
                      'bg-transparent'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`text-title-sm ${isInProgress ? 'text-primary' : isPending ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                          {step.name || `Step ${stepNum}`}
                        </h4>
                        <span className={`font-code-data ${isInProgress ? 'text-primary animate-pulse' : isPending ? 'text-outline-variant' : 'text-on-surface-variant'}`}>
                          {isInProgress ? 'Running...' : isPending ? 'Pending' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">{step.progress}% Complete</p>
                    </div>
                  </div>
                );
              })}
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
