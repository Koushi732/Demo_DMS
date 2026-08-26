"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Download, 
  Edit, 
  Plus, 
  Tag, 
  History, 
  Building2,
  BrainCircuit,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge, StatusVariant } from "@/components/ui/StatusBadge";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function DocumentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.id;
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoc() {
      try {
        setIsLoading(true);
        const data = await DocumentService.getDocument(documentId);
        setDoc(data);
      } catch (err: unknown) {
        console.error(err);
        setError("Document not found or error loading document.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDoc();
  }, [documentId]);

  const getStatusVariant = (status: string): StatusVariant => {
    switch (status) {
      case "EFFECTIVE": return "effective";
      case "APPROVED": return "approved";
      case "UNDER_REVIEW": return "pending";
      case "OBSOLETE": return "obsolete";
      case "ARCHIVED": return "archived";
      case "SUPERSEDED": return "superseded";
      case "DRAFT": 
      default: return "draft";
    }
  };
  const [activeTab, setActiveTab] = useState("Preview");
  const tabs = ["Overview", "Preview", "Metadata", "Versions", "Workflow", "Approvals"];

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
        <h2 className="text-headline-md text-on-surface mb-2">Document Not Found</h2>
        <p className="text-body-md text-on-surface-variant mb-6">{error || "The document you are looking for does not exist."}</p>
        <Link href="/documents">
          <Button>Return to Repository</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-[24px] overflow-y-auto">
      {/* Breadcrumbs & Actions */}
      <div className="flex justify-between items-center mb-[24px]">
        <div className="flex items-center gap-[8px] text-on-surface-variant text-body-sm">
          <Link href="/documents" className="hover:text-primary transition-colors">Documents</Link>
          <ChevronRight size={16} />
          <span>{doc.document_number}</span>
        </div>
      </div>

      {/* Document Header Area */}
      <div className="bg-surface-container-lowest border-b border-outline-variant px-[24px] py-[16px] flex-shrink-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between max-w-[1440px] mx-auto w-full gap-[16px]">
          <div className="flex flex-col gap-[4px]">
            <div className="flex items-center gap-[16px] mt-[8px]">
              <h2 className="text-display-lg text-on-surface line-clamp-1">{doc.title}</h2>
              <StatusBadge variant={getStatusVariant(doc.status)}>{doc.status.toUpperCase()}</StatusBadge>
            </div>
            
            <div className="flex flex-wrap items-center gap-[24px] mt-[4px] text-on-surface-variant text-code-data">
              <div className="flex items-center gap-[4px]">
                <Tag size={16} />
                {doc.document_number}
              </div>
              <div className="flex items-center gap-[4px]">
                <History size={16} />
                Version {doc.current_version?.version_number || 1}
              </div>
              <div className="flex items-center gap-[4px]">
                <Building2 size={16} />
                {doc.department?.name}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-[8px]">
            <Button variant="outline" className="h-9 gap-[4px]">
              <Download size={18} /> Download
            </Button>
            <Button variant="outline" className="h-9 gap-[4px]">
              <Edit size={18} /> Edit
            </Button>
            <Button className="h-9 gap-[4px]">
              <Plus size={18} /> Create Revision
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-[1440px] mx-auto w-full mt-[24px]">
          <nav className="flex gap-[24px] border-b border-outline-variant">
            {tabs.map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-[8px] text-title-sm transition-colors ${
                  activeTab === tab 
                    ? "text-primary border-b-2 border-primary font-semibold" 
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Split Pane Layout for Preview */}
      <div className="flex-1 flex min-h-0 bg-surface">
        {/* Left: Document Rendering Canvas */}
        <div className="flex-1 overflow-y-auto p-[24px] bg-surface-container-lowest">
          <div className="max-w-4xl mx-auto bg-surface-container-lowest border border-outline-variant shadow-sm min-h-[1056px] p-[96px]">
            <div className="text-center mb-[40px] border-b border-outline-variant pb-[16px]">
              <h1 className="text-headline-md font-bold text-on-surface uppercase mb-[8px]">
                {doc.document_type?.name}
              </h1>
              <h2 className="text-title-sm text-on-surface-variant">
                {doc.title}
              </h2>
            </div>
            
            <div className="mb-[24px] text-body-md text-on-surface-variant flex flex-col gap-[8px]">
              <p><strong>Document ID:</strong> {doc.document_number}</p>
              <p><strong>Effective Date:</strong> {doc.effective_date ? new Date(doc.effective_date).toLocaleDateString() : 'Pending'}</p>
            </div>
            
            <div className="space-y-[24px] text-body-md text-on-surface">
              <section className="bg-[#F0FDFA] p-[16px] rounded border border-teal-100">
                <h3 className="text-title-sm font-bold mb-[8px] text-teal-900 flex items-center gap-[4px]">
                  <BrainCircuit size={18} /> AI Insight: Compliance Check
                </h3>
                <p className="text-teal-800 text-sm">
                  Section 3 (Responsibilities) lacks explicit mention of the Quality Assurance department&apos;s final sign-off authority, which was flagged in the previous audit.
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* Right: Metadata Panel */}
        <aside className="w-[320px] bg-surface-container-lowest border-l border-outline-variant flex-shrink-0 flex-col hidden xl:flex">
          <div className="p-[16px] border-b border-outline-variant">
            <h3 className="text-title-sm font-semibold text-on-surface">Metadata</h3>
          </div>
          <div className="p-[16px] flex-1 overflow-y-auto space-y-[16px]">
            <div className="flex flex-col gap-1">
                <span className="text-label-caps text-on-surface-variant">Document Type</span>
                <span className="text-body-md text-on-surface">{doc.document_type?.name || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-caps text-on-surface-variant">Department</span>
                <span className="text-body-md text-on-surface">{doc.department?.name || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-caps text-on-surface-variant">Owner</span>
                <div className="flex items-center gap-[8px]">
                  <div className="w-6 h-6 rounded-full border border-outline-variant bg-surface-container flex items-center justify-center text-[10px] font-medium text-on-surface-variant">
                    {doc.owner?.first_name.substring(0,2).toUpperCase() || 'NA'}
                  </div>
                  <span className="text-body-md text-on-surface">{doc.owner?.first_name} {doc.owner?.last_name}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-caps text-on-surface-variant">Classification</span>
                <span className="text-body-md text-on-surface">{doc.classification || 'Internal Public'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-caps text-on-surface-variant">Effective Date</span>
                <span className="text-body-md text-on-surface">{doc.effective_date ? new Date(doc.effective_date).toLocaleDateString() : 'Pending'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-caps text-on-surface-variant">Next Review</span>
                <span className="text-body-md text-on-surface">{doc.next_review_date ? new Date(doc.next_review_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            
            <div className="mt-[24px] pt-[16px] border-t border-outline-variant">
              <span className="text-label-caps text-on-surface-variant block mb-2">Tags</span>
              <div className="flex flex-wrap gap-[8px]">
                {doc.tags?.map((tag: string) => (
                  <span key={tag} className="px-[8px] py-[2px] bg-surface-container text-body-sm text-on-surface rounded border border-outline-variant">
                    {tag}
                  </span>
                )) || <span className="text-body-sm text-on-surface-variant">No tags</span>}
              </div>
            </div>
            
            <div className="pt-[16px] border-t border-outline-variant">
              <span className="text-label-caps text-on-surface-variant block mb-[16px]">Lifecycle State</span>
              <div className="flex items-center gap-[8px]">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="h-0.5 flex-1 bg-outline-variant"></div>
                <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="h-0.5 flex-1 bg-outline-variant border-dashed"></div>
                <div className="w-3 h-3 rounded-full border-2 border-outline-variant border-dashed"></div>
              </div>
              <div className="flex justify-between mt-[4px] text-label-caps text-on-surface-variant">
                <span>Draft</span>
                <span className="text-primary font-bold">Effective</span>
                <span>Retired</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
