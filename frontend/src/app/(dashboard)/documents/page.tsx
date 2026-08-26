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
  ArrowDown,
  MoreVertical,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge, StatusVariant } from "@/components/ui/StatusBadge";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function DocumentRepositoryPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
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
            <button
              onClick={() => setViewMode("list")}
              className={`p-[8px] rounded flex items-center justify-center transition-colors ${
                viewMode === "list" 
                  ? "bg-surface-container-lowest shadow-sm text-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-[8px] rounded flex items-center justify-center transition-colors ${
                viewMode === "grid" 
                  ? "bg-surface-container-lowest shadow-sm text-primary" 
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Grid size={18} />
            </button>
          </div>

          <div className="flex items-center gap-[8px]">
            <Button variant="outline" className="h-[36px] gap-[8px]">
              <FolderPlus size={18} />
              New Folder
            </Button>
            <Link href="/documents/upload">
              <Button className="h-[36px] gap-[8px]">
                <Upload size={18} />
                Upload Document
              </Button>
            </Link>
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
        <button className="text-body-sm text-primary hover:underline ml-[8px]">Clear All</button>
      </div>

      {/* Document Content Container */}
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

        {!isLoading && !error && viewMode === "list" ? (
          <div className="overflow-x-auto h-full flex flex-col">
            <table className="w-full text-left border-collapse min-w-[1000px] h-fit">
              <thead className="bg-table-header sticky top-0 z-10 border-b border-outline-variant">
                <tr>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant w-[40px]">
                    <input type="checkbox" className="rounded-[2px] border-outline-variant text-primary focus:ring-primary h-4 w-4" />
                  </th>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap cursor-pointer hover:bg-surface-container-high transition-colors group">
                    <div className="flex items-center gap-[4px]">
                      Doc Number 
                      <ArrowDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </th>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Title</th>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Type</th>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Department</th>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Ver</th>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Status</th>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Owner</th>
                  <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Last Updated</th>
                  <th className="py-[8px] px-[16px] w-[40px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="py-3 px-[16px]">
                      <input type="checkbox" className="rounded-[2px] border-outline-variant text-primary focus:ring-primary h-4 w-4" />
                    </td>
                    <td className="py-3 px-[16px] font-code-data text-on-surface">
                      <Link href={`/documents/${doc.id}`} className="hover:underline">
                        {doc.document_number}
                      </Link>
                    </td>
                    <td className="py-3 px-[16px] text-body-sm font-medium text-on-surface">
                      <Link href={`/documents/${doc.id}`} className="hover:underline">
                        {doc.title}
                      </Link>
                    </td>
                    <td className="py-3 px-[16px] text-body-sm text-on-surface-variant">{doc.document_type?.name || 'N/A'}</td>
                    <td className="py-3 px-[16px] text-body-sm text-on-surface-variant">{doc.department?.name || 'N/A'}</td>
                    <td className="py-3 px-[16px] text-body-sm text-on-surface-variant">{doc.current_version?.version_number || '1.0'}</td>
                    <td className="py-3 px-[16px]">
                      <StatusBadge variant={getStatusVariant(doc.status)}>
                        {doc.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-[16px] text-body-sm text-on-surface-variant">{doc.owner?.first_name} {doc.owner?.last_name}</td>
                    <td className="py-3 px-[16px] text-body-sm text-on-surface-variant">{new Date(doc.updated_at).toLocaleDateString()}</td>
                    <td className="py-3 px-[16px]">
                      <button className="text-on-surface-variant hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !isLoading && !error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-[16px] overflow-y-auto">
            {documents.map(doc => (
              <Link href={`/documents/${doc.id}`} key={doc.id}>
                <div className="bg-surface-bright rounded-lg border border-outline-variant hover:border-primary/50 hover:shadow-md transition-all group flex flex-col h-[220px]">
                  <div className="p-[16px] border-b border-outline-variant flex justify-between items-start">
                    <div className="flex gap-[12px]">
                      <div className="w-10 h-10 rounded-md bg-secondary-container/50 flex items-center justify-center text-on-secondary-container flex-shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-code-data text-on-surface-variant mb-[4px]">{doc.document_number}</div>
                        <h4 className="text-title-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug" title={doc.title}>{doc.title}</h4>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.preventDefault()}>
                      <MoreVertical size={20} />
                    </button>
                  </div>
                  <div className="p-[16px] flex-1 flex flex-col justify-between">
                    <div className="space-y-[8px]">
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Version:</span>
                        <span className="text-on-surface font-medium">v{doc.current_version?.version_number || '1.0'}</span>
                      </div>
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-on-surface-variant">Last Updated:</span>
                        <span className="text-on-surface">{new Date(doc.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-[16px]">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-surface-bright bg-surface-container-highest flex items-center justify-center text-[10px] font-medium text-on-surface-variant">{doc.owner?.first_name.substring(0,2).toUpperCase() || 'NA'}</div>
                      </div>
                      <StatusBadge variant={getStatusVariant(doc.status)}>
                        {doc.status}
                      </StatusBadge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {/* Pagination */}
        <div className="border-t border-outline-variant p-[16px] flex items-center justify-between bg-surface-container-lowest mt-auto">
          <div className="text-body-sm text-on-surface-variant">
            Showing <span className="font-medium text-on-surface">{documents.length > 0 ? 1 : 0}</span> to <span className="font-medium text-on-surface">{documents.length}</span> of <span className="font-medium text-on-surface">{total}</span> documents
          </div>
          <div className="flex items-center gap-[4px]">
            <button className="p-[4px] rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed">
              &lt;
            </button>
            <button className="w-8 h-8 rounded bg-primary text-on-primary text-body-sm font-medium flex items-center justify-center">1</button>
            <button className="p-[4px] rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
