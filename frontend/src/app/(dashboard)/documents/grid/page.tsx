"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  List, 
  Grid, 
  FolderPlus, 
  Upload,
  X,
  MoreVertical,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge, StatusVariant } from "@/components/ui/StatusBadge";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function DocumentGridPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function loadDocs() {
      try {
        setIsLoading(true);
        const data = await DocumentService.listDocuments();
        setDocuments(data.items);
        setTotal(data.total);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load documents.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDocs();
  }, []);
  // Grid view is fixed for this route, but we still keep state for the toggle UI
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  
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

  return (
    <div className="h-full flex flex-col gap-[24px]">
      {/* Repository Toolbar */}
      <div className="card-level-1 rounded-lg p-[16px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px]">
        <div className="flex items-center gap-[16px] w-full sm:w-auto">
          {/* Section Search */}
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-[8px] top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              type="text"
              placeholder="Search current view..."
              className="h-[36px] w-full pl-[36px] pr-[8px] bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-0 rounded text-body-sm text-on-surface placeholder:text-on-surface-variant transition-all focus:shadow-[0_0_0_2px_rgba(15,23,42,0.1)] outline-none"
            />
          </div>
          
          {/* Advanced Filters Toggle */}
          <Button variant="outline" className="h-[36px] gap-[8px]">
            <Filter size={18} />
            Filters
            <span className="bg-surface-variant text-on-surface-variant px-[4px] rounded text-label-caps ml-[4px]">3</span>
          </Button>
        </div>

        <div className="flex items-center gap-[16px] w-full sm:w-auto justify-between sm:justify-end">
          {/* View Toggle */}
          <div className="flex bg-surface-container-low rounded border border-outline-variant p-[2px]">
            <Link
              href="/documents"
              className={`p-[8px] rounded flex items-center justify-center transition-colors ${
                viewMode === "list" 
                  ? "bg-surface-container-lowest shadow-sm text-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <List size={18} />
            </Link>
            <Link
              href="/documents/grid"
              className={`p-[8px] rounded flex items-center justify-center transition-colors ${
                viewMode === "grid" 
                  ? "bg-surface-container-lowest shadow-sm text-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Grid size={18} />
            </Link>
          </div>

          <div className="flex items-center gap-[8px]">
            <Button variant="outline" className="h-[36px] gap-[8px]">
              <FolderPlus size={18} />
              New Folder
            </Button>
            <Button className="h-[36px] gap-[8px]">
              <Upload size={18} />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Row */}
      <div className="flex items-center gap-[8px] flex-wrap">
        <span className="text-body-sm text-on-surface-variant">Active Filters:</span>
        <div className="flex items-center gap-[4px] px-[8px] py-[2px] bg-surface-container-high rounded-full border border-outline-variant text-body-sm">
          <span className="text-on-surface">Type:</span> 
          <span className="font-medium text-on-surface">SOP, Protocol</span>
          <button className="hover:text-error transition-colors flex items-center"><X size={14} /></button>
        </div>
        <div className="flex items-center gap-[4px] px-[8px] py-[2px] bg-surface-container-high rounded-full border border-outline-variant text-body-sm">
          <span className="text-on-surface">Status:</span> 
          <span className="font-medium text-on-surface">Effective, Under Review</span>
          <button className="hover:text-error transition-colors flex items-center"><X size={14} /></button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="card-level-1 rounded-lg flex-1 overflow-hidden flex flex-col p-4 bg-surface-container-lowest relative">
        
        {isLoading && (
          <div className="absolute inset-0 bg-surface-container-lowest/50 flex items-center justify-center z-50">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-4 bg-error-container text-on-error-container text-center rounded m-4">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-[16px] overflow-y-auto">
            {documents.map((doc) => (
              <Link href={`/documents/${doc.id}`} key={doc.id} className="card-level-1 rounded-lg flex flex-col hover:shadow-md transition-shadow cursor-pointer group">
                {/* Card Header (Thumbnail placeholder) */}
                <div className="h-[140px] bg-surface-container-low border-b border-outline-variant rounded-t-lg flex items-center justify-center text-outline-variant relative">
                  <FileText size={48} />
                  <div className="absolute top-2 right-2">
                    <button className="p-1 rounded-full bg-surface-container-lowest/80 text-on-surface-variant hover:bg-surface-container-lowest opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.preventDefault()}>
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-[16px] flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-[8px]">
                    <StatusBadge variant={getStatusVariant(doc.status)}>
                      {doc.status}
                    </StatusBadge>
                    <span className="text-code-data text-on-surface-variant">v{doc.current_version?.version_number || '1.0'}</span>
                  </div>
                  
                  <h3 className="text-body-md font-medium text-on-surface line-clamp-2 mb-[4px]">
                    {doc.title}
                  </h3>
                  <p className="text-code-data text-outline mb-[12px]">{doc.document_number}</p>
                
                  <div className="mt-auto pt-[12px] border-t border-outline-variant flex justify-between items-center text-label-caps text-on-surface-variant">
                    <span>{doc.department?.name || 'N/A'}</span>
                    <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="border-t border-outline-variant p-[16px] flex items-center justify-between bg-surface-container-lowest mt-auto">
          <div className="text-body-sm text-on-surface-variant">
            Showing <span className="font-medium text-on-surface">{documents.length > 0 ? 1 : 0}</span> to <span className="font-medium text-on-surface">{documents.length}</span> of <span className="font-medium text-on-surface">{total}</span> documents
          </div>
        </div>
      </div>
    </div>
  );
}
