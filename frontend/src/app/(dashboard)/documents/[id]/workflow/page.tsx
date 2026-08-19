"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Check, CheckCircle2, FileCheck, Hourglass, Info, Send, Play } from "lucide-react";
import { DocumentService, DocumentResponse, WorkflowInstance, WorkflowStepInstance } from "@/services/documentService";
import { notFound, useRouter } from "next/navigation";

export default function DocumentWorkflowPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const docData = await DocumentService.getDocument(params.id);
      setDoc(docData);
      
      try {
        const wfData = await DocumentService.getWorkflow(params.id);
        setWorkflow(wfData);
      } catch (err) {
        // 404 is expected if workflow hasn't started
        setWorkflow(null);
      }
    } catch (error) {
      console.error("Error fetching document or workflow", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-on-surface">Loading workflow data...</div>;
  }

  if (!doc) {
    return <div className="p-8 text-on-surface">Document not found.</div>;
  }

  const handleStartWorkflow = async () => {
    setStarting(true);
    try {
      await DocumentService.startWorkflow(doc.id);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("Failed to start workflow.");
    } finally {
      setStarting(false);
    }
  };

  const handleTakeAction = () => {
    router.push(`/documents/${doc.id}/review`);
  };

  const renderTimelineIcon = (status: string, isPast: boolean) => {
    if (status === 'APPROVED' || isPast) {
      return (
        <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white z-10 mb-[8px] shadow-sm relative">
          <Check size={24} strokeWidth={3} />
        </div>
      );
    }
    if (status === 'PENDING') {
      return (
        <div className="relative w-12 h-12 mb-[8px] flex items-center justify-center z-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20"></div>
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary z-10">
            <Hourglass size={20} />
          </div>
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-outline-variant bg-surface flex items-center justify-center text-on-surface-variant z-10 mb-[8px] relative">
        <FileCheck size={20} />
      </div>
    );
  };

  const renderTimelineConnectingLine = (status: string, isPast: boolean) => {
    if (status === 'APPROVED' || isPast) {
      return <div className="absolute top-[24px] left-[-50%] right-[50%] h-[2px] bg-primary z-0"></div>;
    }
    return <div className="absolute top-[24px] left-[-50%] right-[50%] h-[2px] bg-outline-variant z-0"></div>;
  };

  const activeStep = workflow?.steps?.find(s => s.status === 'PENDING');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-[24px]">
        <div className="max-w-[1440px] mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[24px] gap-[16px]">
            <div>
              <div className="flex items-center gap-[8px] mb-[4px]">
                <span className="font-label-caps text-label-caps bg-surface-variant text-on-surface-variant px-2 py-1 rounded-sm">
                  {doc.document_type?.name || 'Document'}
                </span>
                <span className="font-code-data text-code-data text-on-surface-variant">
                  {doc.document_number}
                </span>
              </div>
              <h2 className="text-display-lg text-on-surface">{doc.title}</h2>
            </div>
            <div className="flex gap-[8px]">
              <button 
                onClick={() => router.push(`/documents/${doc.id}/preview`)}
                className="px-[16px] py-[8px] border border-outline-variant rounded-lg text-on-surface text-title-sm hover:bg-surface-container-low transition-colors"
              >
                View Document
              </button>
              
              {!workflow && doc.status === 'DRAFT' && (
                 <button 
                  onClick={handleStartWorkflow}
                  disabled={starting}
                  className="px-[16px] py-[8px] bg-primary text-on-primary rounded-lg text-title-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Play size={16} /> {starting ? "Starting..." : "Start Workflow"}
                </button>
              )}

              {workflow && workflow.status === 'IN_PROGRESS' && activeStep && (
                <button 
                  onClick={handleTakeAction}
                  className="px-[16px] py-[8px] bg-primary text-on-primary rounded-lg text-title-sm hover:opacity-90 transition-opacity"
                >
                  Review Step
                </button>
              )}
            </div>
          </div>

          {/* Workflow Visualizer */}
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-[40px] mb-[24px] relative overflow-hidden shadow-sm">
            <h3 className="text-title-sm text-on-surface mb-[40px]">Lifecycle Workflow</h3>
            <div className="flex justify-between items-start relative z-10 w-full overflow-x-auto pb-[24px]">
              
              {/* Step 1: Draft */}
              <div className="flex flex-col items-center flex-1 relative min-w-[120px]">
                <div className="absolute top-[24px] left-[50%] right-[-50%] h-[2px] bg-primary z-0"></div>
                <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center text-white z-10 mb-[8px] shadow-sm relative">
                  <Check size={24} strokeWidth={3} />
                </div>
                <div className="text-center mt-[4px]">
                  <p className="text-title-sm text-on-surface">Draft</p>
                  <p className="text-body-sm text-on-surface-variant mt-[4px]">Completed</p>
                  <p className="font-code-data text-code-data text-on-surface-variant mt-[4px]">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {workflow?.steps.map((step, index) => {
                const isPast = step.status === 'APPROVED';
                const isNextPast = workflow.steps[index + 1]?.status === 'APPROVED';
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1 relative min-w-[120px]">
                    {renderTimelineConnectingLine(step.status, isPast)}
                    {/* Line to next */}
                    <div className={`absolute top-[24px] left-[50%] right-[-50%] h-[2px] ${isPast ? 'bg-primary' : 'bg-outline-variant'} z-0`}></div>
                    
                    {renderTimelineIcon(step.status, isPast)}
                    
                    <div className="text-center mt-[4px]">
                      <p className={`text-title-sm ${step.status === 'PENDING' ? 'text-on-surface font-bold' : 'text-on-surface opacity-60'}`}>
                        {step.step_name}
                      </p>
                      {step.status === 'APPROVED' && (
                        <>
                          <p className="text-body-sm text-on-surface-variant mt-[4px]">Completed</p>
                          {step.completed_at && (
                             <p className="font-code-data text-code-data text-on-surface-variant mt-[4px]">
                               {new Date(step.completed_at).toLocaleDateString()}
                             </p>
                          )}
                        </>
                      )}
                      {step.status === 'PENDING' && (
                        <span className="inline-block mt-[4px] font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-2 py-1 rounded border-l-2 border-primary">
                          PENDING
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Step: Effective (Future) */}
              <div className="flex flex-col items-center flex-1 relative min-w-[120px]">
                <div className={`absolute top-[24px] left-[-50%] right-[50%] h-[2px] ${workflow?.status === 'COMPLETED' ? 'bg-primary' : 'bg-outline-variant'} z-0`}></div>
                <div className={`w-12 h-12 rounded-full border-2 ${workflow?.status === 'COMPLETED' ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-dashed border-outline-variant bg-surface text-on-surface-variant'} flex items-center justify-center z-10 mb-[8px] relative`}>
                  <CheckCircle2 size={20} />
                </div>
                <div className="text-center opacity-60 mt-[4px]">
                  <p className="text-title-sm text-on-surface">Effective</p>
                </div>
              </div>

            </div>
          </div>

          {/* Bento Grid Layout for Details & Comments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
            
            {/* Active Task Details */}
            <div className="lg:col-span-2 flex flex-col gap-[24px]">
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-[24px] shadow-sm flex-1">
                <div className="flex justify-between items-center mb-[16px] border-b border-surface-variant pb-[8px]">
                  <h3 className="text-title-sm text-on-surface">
                    {activeStep ? `Current Stage: ${activeStep.step_name}` : (workflow?.status === 'COMPLETED' ? 'Workflow Completed' : 'Workflow Not Started')}
                  </h3>
                </div>
                
                <div className="flex items-start gap-[16px] mb-[24px] p-[16px] bg-[#F0FDFA] rounded-lg border border-teal-100">
                  <Info className="text-teal-800 shrink-0" size={24} />
                  <div>
                    <p className="text-body-sm text-teal-900">
                      <strong>AI Insight:</strong> Please review all changes carefully to ensure they meet quality control standards before proceeding to the next step.
                    </p>
                  </div>
                </div>
                
                {activeStep && (
                  <div className="grid grid-cols-2 gap-[16px] mb-[24px]">
                    <div className="p-[8px] border border-outline-variant rounded bg-surface">
                      <p className="text-label-caps text-on-surface-variant mb-[4px]">Assigned To</p>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-body-md text-on-surface font-semibold">
                          {activeStep.assigned_to_id ? "Assigned" : "Unassigned (Open to Dept)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-surface-variant pt-[16px]">
                  <h4 className="text-title-sm text-on-surface mb-[16px]">Stage Comments</h4>
                  <div className="space-y-[16px]">
                    
                    {workflow?.steps.filter(s => s.comments).map(s => (
                       <div key={s.id} className="flex gap-[16px]">
                         <div className="w-8 h-8 rounded-full bg-surface-variant flex-shrink-0 flex items-center justify-center text-on-surface-variant font-bold text-xs">R</div>
                         <div className="bg-surface p-[16px] rounded-lg rounded-tl-none border border-outline-variant flex-1">
                           <div className="flex justify-between items-center mb-[4px]">
                             <span className="text-body-sm font-semibold text-on-surface">{s.step_name}</span>
                             {s.completed_at && <span className="font-code-data text-on-surface-variant text-[10px]">{new Date(s.completed_at).toLocaleDateString()}</span>}
                           </div>
                           <p className="text-body-sm text-on-surface">{s.comments}</p>
                         </div>
                       </div>
                    ))}
                    
                    {!workflow?.steps.some(s => s.comments) && (
                      <p className="text-body-sm text-on-surface-variant italic">No comments yet.</p>
                    )}
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Metadata / Signatures Sidebar */}
            <div className="flex flex-col gap-[24px]">
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-[16px] shadow-sm">
                <h3 className="text-title-sm text-on-surface mb-[16px] pb-[4px] border-b border-surface-variant">Document Metadata</h3>
                <dl className="space-y-[8px]">
                  <div className="grid grid-cols-3 gap-[8px] items-center py-[4px] border-b border-surface-container-high last:border-0">
                    <dt className="text-label-caps text-on-surface-variant">Type</dt>
                    <dd className="col-span-2 text-body-sm text-on-surface">{doc.document_type?.name}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-[8px] items-center py-[4px] border-b border-surface-container-high last:border-0">
                    <dt className="text-label-caps text-on-surface-variant">Department</dt>
                    <dd className="col-span-2 text-body-sm text-on-surface">{doc.department?.name}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-[8px] items-center py-[4px] border-b border-surface-container-high last:border-0">
                    <dt className="text-label-caps text-on-surface-variant">Status</dt>
                    <dd className="col-span-2 text-body-sm text-on-surface">{doc.status}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-[8px] items-center py-[4px] border-b border-surface-container-high last:border-0">
                    <dt className="text-label-caps text-on-surface-variant">Version</dt>
                    <dd className="col-span-2 text-body-sm text-on-surface">{doc.current_version?.version_number}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-[16px] shadow-sm flex-1">
                <h3 className="text-title-sm text-on-surface mb-[16px] pb-[4px] border-b border-surface-variant">Electronic Signatures</h3>
                <div className="space-y-[8px]">
                  
                  {workflow?.steps.filter(s => s.status === 'APPROVED').map(s => (
                    <div key={s.id} className="p-[8px] border border-outline-variant border-l-2 border-l-[#10b981] rounded bg-surface mb-2">
                      <p className="text-label-caps text-on-surface-variant mb-[4px]">{s.step_name} Approval</p>
                      <p className="font-code-data text-on-surface">Valid</p>
                      <p className="text-body-sm text-on-surface-variant text-[10px] mt-[4px]">
                        Signed {s.completed_at ? new Date(s.completed_at).toLocaleString() : ''}
                      </p>
                    </div>
                  ))}

                  {workflow?.steps.filter(s => s.status === 'PENDING').map(s => (
                    <div key={s.id} className="p-[8px] border border-outline-variant border-dashed rounded bg-surface opacity-60 mb-2">
                      <p className="text-label-caps text-on-surface-variant mb-[4px]">{s.step_name} Approval</p>
                      <p className="text-body-sm text-on-surface italic">Pending Signature</p>
                    </div>
                  ))}
                  
                  {!workflow && (
                    <p className="text-body-sm text-on-surface-variant italic">No signatures yet. Workflow not started.</p>
                  )}
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
