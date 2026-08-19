"use client";

import { useEffect, useState } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Check, 
  BrainCircuit,
  MessageSquare,
  X,
  CheckCircle2
} from "lucide-react";
import { DocumentService, DocumentResponse, WorkflowInstance } from "@/services/documentService";
import { notFound, useRouter } from "next/navigation";

export default function ApprovalReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInstance | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docData = await DocumentService.getDocument(params.id);
        setDoc(docData);
        
        try {
          const wfData = await DocumentService.getWorkflow(params.id);
          setWorkflow(wfData);
        } catch (e) {
          // No active workflow
        }

        try {
          const urlData = await DocumentService.getPreviewUrl(params.id);
          setPreviewUrl(urlData.url);
        } catch (e) {
          // No preview url (e.g. no version uploaded)
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!doc) return notFound();

  const activeStep = workflow?.steps?.find(s => s.status === 'PENDING');

  const handleReviewAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!activeStep) return;
    setSubmitting(true);
    try {
      await DocumentService.submitReview(activeStep.id, action, comments);
      router.push(`/documents/${doc.id}/workflow`);
    } catch (e) {
      console.error(e);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-background h-full w-full">
      
      {/* Left Pane: Document Preview */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-outline-variant bg-surface-container-lowest">
        
        {/* Toolbar */}
        <div className="h-12 border-b border-outline-variant bg-surface flex items-center justify-between px-[16px] shrink-0">
          <div className="flex items-center gap-[8px]">
            <span className="font-code-data text-on-surface-variant bg-surface-container px-2 py-1 rounded">{doc.document_number}</span>
            <span className="text-body-sm text-on-surface font-semibold truncate">{doc.title}</span>
          </div>
          <div className="flex items-center gap-[4px]">
            <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Zoom Out">
              <ZoomOut size={20} />
            </button>
            <span className="text-body-sm text-on-surface-variant w-12 text-center">100%</span>
            <button className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Zoom In">
              <ZoomIn size={20} />
            </button>
            <div className="w-px h-4 bg-outline-variant mx-1"></div>
            <a 
              href={previewUrl || '#'} 
              download 
              className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors inline-block" 
              title="Download"
            >
              <Download size={20} />
            </a>
          </div>
        </div>

        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-y-auto p-[24px] bg-surface-container-low flex justify-center">
          {previewUrl ? (
            <iframe 
              src={previewUrl} 
              className="w-full h-full max-w-5xl bg-white shadow-md border border-outline-variant rounded"
              title="Document Preview"
            />
          ) : (
            <div className="w-full max-w-[800px] bg-surface-container-lowest shadow-sm border border-outline-variant rounded p-[40px] mb-[24px] text-center text-on-surface-variant">
              No document version uploaded yet.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Metadata & Approval Panel */}
      <div className="w-full lg:w-[360px] flex flex-col bg-surface-container-lowest shrink-0 overflow-hidden shadow-[-4px_0_12px_rgba(15,23,42,0.02)] z-10 border-l border-outline-variant">
        
        {/* Panel Header */}
        <div className="p-[16px] border-b border-outline-variant bg-surface shrink-0">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="text-label-caps text-primary bg-primary/10 px-2 py-1 rounded border-l-2 border-primary uppercase">
              {activeStep ? activeStep.step_name : 'Review'}
            </span>
            <span className="font-code-data text-on-surface-variant">
              {activeStep?.due_date ? `Due: ${new Date(activeStep.due_date).toLocaleDateString()}` : 'No due date'}
            </span>
          </div>
          <h2 className="text-title-sm text-on-surface font-semibold">
            {activeStep ? 'Approval Required' : (workflow?.status === 'COMPLETED' ? 'Workflow Completed' : 'Workflow Not Active')}
          </h2>
        </div>
        
        {/* Scrollable Panel Content */}
        <div className="flex-1 overflow-y-auto p-[16px] space-y-[24px]">
          
          {/* Metadata Summary */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded p-[16px]">
            <h3 className="text-label-caps text-on-surface-variant mb-[16px] tracking-wider">Document Details</h3>
            <div className="space-y-[8px]">
              <div className="flex justify-between">
                <span className="text-body-sm text-on-surface-variant">Document ID</span>
                <span className="font-code-data text-on-surface">{doc.document_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm text-on-surface-variant">Version</span>
                <span className="font-code-data text-on-surface">{doc.current_version?.version_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm text-on-surface-variant">Author</span>
                <span className="text-body-sm text-on-surface">{doc.owner?.first_name} {doc.owner?.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm text-on-surface-variant">Department</span>
                <span className="text-body-sm text-on-surface">{doc.department?.name}</span>
              </div>
            </div>
          </div>
          
          {/* AI Summary Card */}
          <div className="bg-[#F0FDFA] border border-secondary/20 rounded p-[16px] shadow-sm">
            <div className="flex items-center gap-[4px] mb-[8px] text-secondary">
              <BrainCircuit size={16} />
              <h3 className="text-label-caps font-semibold">AI Change Summary</h3>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              Automated insight generation is enabled. Please ensure you manually verify all technical specifications.
            </p>
          </div>
          
          {/* Workflow Stage */}
          {workflow && (
            <div>
              <h3 className="text-label-caps text-on-surface-variant mb-[16px] tracking-wider">Approval Journey</h3>
              <div className="relative pl-6 space-y-[16px] before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-outline-variant before:z-0">
                
                {workflow.steps.map((step, idx) => (
                  <div key={step.id} className="relative z-10 flex items-start gap-[16px]">
                    <div className={`w-6 h-6 rounded-full ${step.status === 'APPROVED' ? 'bg-[#10B981]' : (step.status === 'PENDING' ? 'bg-surface-container-lowest border-primary border-2' : 'bg-surface-container-lowest border-outline-variant border-2 border-dashed')} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                      {step.status === 'APPROVED' && <Check size={14} className="text-white" strokeWidth={3} />}
                      {step.status === 'PENDING' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>}
                    </div>
                    <div className="w-full">
                      <div className={`text-body-sm font-semibold ${step.status === 'PENDING' ? 'text-primary' : 'text-on-surface'}`}>{step.step_name}</div>
                      <div className="text-body-sm text-on-surface-variant mb-[4px]">
                        {step.status === 'APPROVED' && step.completed_at ? new Date(step.completed_at).toLocaleDateString() : (step.status === 'PENDING' ? 'Pending approval' : 'Not started')}
                      </div>
                      {step.comments && (
                        <div className="bg-surface border border-outline-variant rounded p-[8px] relative mt-[8px]">
                          <div className="absolute -left-[5px] top-2 w-[8px] h-[8px] bg-surface border-l border-t border-outline-variant rotate-[-45deg]"></div>
                          <p className="text-body-sm text-on-surface-variant italic">"{step.comments}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
              </div>
            </div>
          )}
          
          {/* Add Comment Area */}
          {activeStep && (
            <div>
              <label className="block text-label-caps text-on-surface-variant mb-[4px]" htmlFor="review-comment">Review Comments (Optional)</label>
              <textarea 
                id="review-comment"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full h-[72px] bg-surface border border-outline-variant rounded p-[8px] text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none" 
                placeholder="Add observations or rationale..." 
                rows={3}
              ></textarea>
            </div>
          )}
          
        </div>
        
        {/* Footer Actions */}
        {activeStep && (
          <div className="p-[16px] border-t border-outline-variant bg-surface shrink-0 flex flex-col gap-[8px]">
            <div className="flex gap-[8px]">
              <button 
                onClick={() => handleReviewAction('REJECT')}
                disabled={submitting}
                className="flex-1 py-2 px-4 rounded border border-error text-error hover:bg-error-container hover:text-on-error-container text-body-sm font-semibold transition-colors flex items-center justify-center gap-[4px]"
              >
                <X size={18} /> {submitting ? "..." : "Reject"}
              </button>
            </div>
            <button 
              onClick={() => handleReviewAction('APPROVE')}
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded bg-primary text-on-primary hover:bg-primary/90 text-body-md font-bold transition-colors flex items-center justify-center gap-[8px] shadow-sm"
            >
              <CheckCircle2 size={20} /> {submitting ? "Processing..." : "Approve Document"}
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
