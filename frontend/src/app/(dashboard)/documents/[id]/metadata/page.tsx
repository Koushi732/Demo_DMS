"use client";

import Link from "next/link";
import { 
  ChevronRight, 
  History, 
  Save, 
  FlaskConical, 
  Users, 
  User,
  X,
  Edit,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { DocumentService } from "@/services/documentService";
import { Button } from "@/components/ui/Button";

export default function DocumentMetadataPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;
  const [doc, setDoc] = useState<any>(null);
  const [metadata, setMetadata] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [fetchedDoc, fetchedMetadata] = await Promise.all([
          DocumentService.getDocument(documentId),
          DocumentService.getMetadata(documentId)
        ]);
        setDoc(fetchedDoc);
        setMetadata(fetchedMetadata);
      } catch (err) {
        setError("Failed to load document metadata.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [documentId]);

  useEffect(() => {
    const vals: Record<string, string> = {};
    metadata.forEach(m => {
      vals[m.key] = m.value || '';
    });
    setFormValues(vals);
  }, [metadata]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const entriesToUpdate = Object.keys(formValues).map(key => ({
        key,
        value: formValues[key],
        is_ai_generated: false
      }));
      
      const newMetadata = await DocumentService.updateMetadata(documentId, entriesToUpdate);
      setMetadata(newMetadata);
      setSuccess(true);
      setEditMode(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Failed to save metadata.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !doc) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-headline-md text-on-surface mb-2">Error</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{error}</p>
        <Link href="/documents">
          <Button>Return to Repository</Button>
        </Link>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="flex-1 overflow-y-auto p-[24px]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Breadcrumb & Context */}
        <div className="flex items-center gap-[8px] text-on-surface-variant text-body-sm mb-[24px]">
          <Link href="/documents" className="hover:text-primary transition-colors">Documents</Link>
          <ChevronRight size={16} />
          <Link href={`/documents/${resolvedParams.id}`} className="hover:text-primary transition-colors">QA Document Control</Link>
          <ChevronRight size={16} />
          <span>Metadata</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-[16px] mb-[40px]">
          <div>
            <div className="flex items-center gap-[8px] mb-[8px]">
              <span className="font-code-data text-on-surface-variant bg-surface-container px-[8px] py-[4px] rounded border border-outline-variant">
                {doc.documentNumber}
              </span>
              <span className={`px-[8px] py-[4px] border-l-2 text-label-caps rounded-r ${
                doc.status === "Effective" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-500" 
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant"
              }`}>
                {doc.status.toUpperCase()}
              </span>
              <span className="text-label-caps text-on-surface-variant px-[8px] py-[4px] bg-surface-container-low rounded">
                V. {doc.current_version?.version_number || 1}
              </span>
            </div>
            <h1 className="text-display-lg text-on-surface mb-[4px]">{doc.title}</h1>
            <p className="text-body-md text-on-surface-variant max-w-3xl">
              {doc.description}
            </p>
          </div>
          
          <div className="flex items-center gap-[8px]">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)} disabled={isSaving}>Cancel</Button>
                <Button className="gap-[8px]" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button className="gap-[8px]" onClick={() => setEditMode(true)}>
                <Edit size={18} /> Edit Metadata
              </Button>
            )}
          </div>
        </div>
        
        {success && (
          <div className="mb-[24px] p-[16px] bg-emerald-50 text-emerald-800 rounded flex items-center gap-[12px] border border-emerald-200">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span>Metadata saved successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
          
          {/* Left Column: System Info & Specifics */}
          <div className="lg:col-span-4 flex flex-col gap-[24px]">
            
            {/* System Information (Non-editable) */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-[16px]">
              <h2 className="text-title-sm text-on-surface mb-[16px] border-b border-outline-variant pb-[4px]">System Information</h2>
              <dl className="flex flex-col gap-[8px]">
                <div className="grid grid-cols-2 gap-[8px] py-[4px] border-b border-surface-variant">
                  <dt className="text-body-sm text-on-surface-variant">Document Number</dt>
                  <dd className="font-code-data text-on-surface text-right">{doc.documentNumber}</dd>
                </div>
                <div className="grid grid-cols-2 gap-[8px] py-[4px] border-b border-surface-variant">
                  <dt className="text-body-sm text-on-surface-variant">Status</dt>
                  <dd className="text-body-sm text-on-surface text-right flex items-center justify-end gap-[4px]">
                    <span className={`w-2 h-2 rounded-full ${doc.status === "Effective" ? "bg-emerald-500" : "bg-outline-variant"}`}></span> {doc.status}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-[8px] py-[4px] border-b border-surface-variant">
                  <dt className="text-body-sm text-on-surface-variant">Version</dt>
                  <dd className="text-body-sm text-on-surface text-right">{doc.current_version?.version_number || 1}</dd>
                </div>
                <div className="grid grid-cols-2 gap-[8px] py-[4px] border-b border-surface-variant">
                  <dt className="text-body-sm text-on-surface-variant">Effective Date</dt>
                  <dd className="text-body-sm text-on-surface text-right">{doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString() : 'N/A'}</dd>
                </div>
                <div className="grid grid-cols-2 gap-[8px] py-[4px]">
                  <dt className="text-body-sm text-on-surface-variant">Next Review Date</dt>
                  <dd className="text-body-sm text-error text-right">{doc.nextReviewDate ? new Date(doc.nextReviewDate).toLocaleDateString() : 'N/A'}</dd>
                </div>
              </dl>
            </div>
            
            {/* SOP-Specific Fields */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-[16px] bg-gradient-to-b from-surface-container-lowest to-surface-container-low/30">
              <h2 className="text-title-sm text-on-surface mb-[16px] border-b border-outline-variant pb-[4px] flex items-center gap-[4px]">
                <FlaskConical size={18} className="text-primary" /> SOP Configuration
              </h2>
              <div className="flex flex-col gap-[16px]">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Process Area</label>
                  <select disabled={!editMode} className="w-full h-9 px-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface disabled:opacity-60">
                    <option>Quality Assurance (QA)</option>
                    <option>Quality Control (QC)</option>
                    <option>Manufacturing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Training Required</label>
                  <div className="flex items-center gap-[8px]">
                    <input type="checkbox" disabled={!editMode} defaultChecked className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary disabled:opacity-60" />
                    <span className="text-body-sm text-on-surface">Yes, mandatory for role</span>
                  </div>
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Review Period</label>
                  <select className="w-full h-9 px-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface">
                    <option>Annual (1 Year)</option>
                    <option>Bi-Annual (2 Years)</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Designated Approver Group</label>
                  <div className="flex items-center gap-[8px] p-[8px] border border-outline-variant rounded bg-surface-container">
                    <Users size={16} className="text-on-surface-variant" />
                    <span className="text-body-sm text-on-surface">QA Management Team</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Right Column: Editable Metadata */}
          <div className="lg:col-span-8">
            <div className="bg-surface-container-lowest border border-outline-variant rounded border-t-2 border-t-primary shadow-sm p-[24px]">
              <h2 className="text-title-sm text-on-surface mb-[24px]">Document Metadata</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                
                {/* Title - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Document Title</label>
                  <input type="text" defaultValue={doc.title} className="w-full h-9 px-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface transition-shadow" />
                </div>
                
                {/* Description - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Description</label>
                  <textarea rows={3} defaultValue={doc.description} className="w-full p-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface transition-shadow resize-none" />
                </div>
                
                {/* Type */}
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Document Type</label>
                  <select className="w-full h-9 px-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface">
                    <option>Standard Operating Procedure (SOP)</option>
                    <option>Work Instruction (WI)</option>
                    <option>Policy</option>
                    <option>Form</option>
                  </select>
                </div>
                
                {/* Department */}
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Department</label>
                  <select defaultValue={doc.department} className="w-full h-9 px-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface">
                    <option>Quality Assurance</option>
                    <option>Quality Control</option>
                    <option>Regulatory Affairs</option>
                    <option>Manufacturing</option>
                    <option>Information Technology</option>
                  </select>
                </div>
                
                {/* Owner */}
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Document Owner</label>
                  <div className="relative">
                    <User size={16} className="absolute left-[8px] top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input type="text" defaultValue={doc.owner} className="w-full h-9 pl-[32px] pr-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface" />
                  </div>
                </div>
                
                {/* Classification */}
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Data Classification</label>
                  <select defaultValue="Confidential" className="w-full h-9 px-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-sm text-on-surface">
                    <option>Internal Public</option>
                    <option>Confidential</option>
                    <option>Strictly Confidential</option>
                  </select>
                </div>
                
                {/* Supersedes */}
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Supersedes</label>
                  <input type="text" defaultValue="SOP-QA-014 v2.0" className="w-full h-9 px-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-code-data text-on-surface" />
                </div>
                
                {/* Related Docs */}
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Related Documents</label>
                  <input type="text" defaultValue="FRM-QA-102, WI-QA-045" className="w-full h-9 px-[8px] border border-outline-variant rounded bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-code-data text-on-surface" />
                </div>
                
                {/* Tags - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">Tags</label>
                  <div className="flex flex-wrap gap-[8px] p-[8px] border border-outline-variant rounded bg-surface-container-lowest min-h-[36px] items-center">
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-surface-container-high rounded text-on-surface text-body-sm">
                      Calibration <button type="button" className="hover:text-error transition-colors"><X size={14} /></button>
                    </span>
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-surface-container-high rounded text-on-surface text-body-sm">
                      Equipment <button type="button" className="hover:text-error transition-colors"><X size={14} /></button>
                    </span>
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-surface-container-high rounded text-on-surface text-body-sm">
                      Lab <button type="button" className="hover:text-error transition-colors"><X size={14} /></button>
                    </span>
                    <input type="text" placeholder="Add tag..." className="flex-1 min-w-[100px] border-none bg-transparent focus:ring-0 p-0 text-body-sm text-on-surface h-6 outline-none" />
                  </div>
                </div>
                
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
