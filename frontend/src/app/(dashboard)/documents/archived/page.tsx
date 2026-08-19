"use client";

import { useEffect, useState } from "react";
import { 
  FolderOpen, 
  Filter, 
  Download, 
  Link as LinkIcon,
  MoreVertical
} from "lucide-react";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function ArchivedDocumentsPage() {
  const [archivedDocs, setArchivedDocs] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function load() {
      try {
        const [obsoleteRes, archivedRes] = await Promise.all([
          DocumentService.listDocuments({ status: "OBSOLETE" }),
          DocumentService.listDocuments({ status: "ARCHIVED" })
        ]);
        setArchivedDocs([...obsoleteRes.items, ...archivedRes.items]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface">
      
      {/* Page Header */}
      <div className="px-[40px] py-[24px] border-b border-outline-variant bg-surface-container-lowest flex justify-between items-end flex-shrink-0">
        <div>
          <div className="flex items-center gap-[8px] mb-[8px]">
            <FolderOpen className="text-on-surface-variant" size={16} />
            <span className="text-body-sm text-on-surface-variant uppercase tracking-wider">Controlled Archive</span>
          </div>
          <h2 className="text-display-lg text-on-surface">Superseded &amp; Obsolete Records</h2>
        </div>
        <div className="flex gap-[12px]">
          <button className="h-9 px-[16px] border border-outline-variant rounded text-title-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-[8px]">
            <Filter size={18} />
            Filter
          </button>
          <button className="h-9 px-[16px] bg-primary text-on-primary rounded text-title-sm hover:opacity-90 transition-opacity flex items-center gap-[8px]">
            <Download size={18} />
            Export Log
          </button>
        </div>
      </div>
      
      {/* Content Canvas */}
      <div className="flex-1 overflow-auto p-[40px]">
        <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-[24px]">
          
          {/* Search & Filter Bar within Canvas */}
          <div className="bg-surface-container-lowest p-[16px] border border-outline-variant rounded flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-[16px]">
              <span className="text-label-caps text-on-surface-variant">View:</span>
              <div className="flex gap-[8px]">
                <span className="px-[12px] py-[4px] bg-surface-container-high rounded-full text-body-sm text-on-surface cursor-pointer border border-transparent">All Records</span>
                <span className="px-[12px] py-[4px] bg-transparent rounded-full text-body-sm text-on-surface-variant cursor-pointer border border-outline-variant hover:bg-surface-container-low">Superseded Only</span>
                <span className="px-[12px] py-[4px] bg-transparent rounded-full text-body-sm text-on-surface-variant cursor-pointer border border-outline-variant hover:bg-surface-container-low">Obsolete Only</span>
              </div>
            </div>
            <div className="text-on-surface-variant text-body-sm">
              Showing {archivedDocs.length} records
            </div>
          </div>
          
          {/* Enterprise Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1200px]">
                <thead className="bg-[#F1F5F9] border-b border-outline-variant">
                  <tr>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant w-[140px]">Document Number</th>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant min-w-[250px]">Title</th>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant w-[80px]">Version</th>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant w-[120px]">Status</th>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant w-[160px]">Superseded By</th>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant w-[120px]">Obsolete Date</th>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant w-[200px]">Reason</th>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant w-[150px]">Approved By</th>
                    <th className="py-[12px] px-[16px] text-label-caps text-on-surface-variant w-[60px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-[16px] text-center text-on-surface-variant">Loading records...</td>
                    </tr>
                  ) : archivedDocs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-[16px] text-center text-on-surface-variant">No archived records found.</td>
                    </tr>
                  ) : archivedDocs.map(doc => (
                    <tr key={doc.id} className={`hover:bg-surface-container-low transition-colors group cursor-pointer ${doc.status === 'OBSOLETE' ? 'bg-surface/50' : ''}`}>
                      <td className="py-[12px] px-[16px]">
                        <span className="font-code-data text-on-surface">{doc.document_number}</span>
                      </td>
                      <td className="py-[12px] px-[16px] text-body-sm text-on-surface truncate max-w-[250px]">
                        {doc.title}
                      </td>
                      <td className="py-[12px] px-[16px] font-code-data text-on-surface-variant">
                        v{doc.current_version ? 1 : 0}
                      </td>
                      <td className="py-[12px] px-[16px]">
                        <div className={`inline-flex items-center gap-[6px] px-[8px] py-[2px] rounded-sm border-l-2 text-label-caps ${
                          doc.status === 'ARCHIVED' 
                            ? 'bg-secondary-container/30 border-secondary text-on-secondary-container' 
                            : 'bg-error-container/30 border-error text-on-error-container'
                        }`}>
                          <span>{doc.status}</span>
                        </div>
                      </td>
                      <td className="py-[12px] px-[16px]">
                        {doc.status === 'ARCHIVED' ? (
                          <a href={`/documents/${doc.id}`} className="font-code-data text-secondary hover:underline flex items-center gap-[4px]" onClick={e => e.preventDefault()}>
                            <LinkIcon size={14} />
                            {doc.document_number}-v{2}
                          </a>
                        ) : (
                          <span className="text-body-sm text-on-surface-variant italic">N/A</span>
                        )}
                      </td>
                      <td className="py-[12px] px-[16px] font-code-data text-on-surface-variant">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-[12px] px-[16px] text-body-sm text-on-surface-variant truncate max-w-[200px]">
                        {doc.status === 'ARCHIVED' ? 'Regulatory update' : 'Process integrated into eQMS system'}
                      </td>
                      <td className="py-[12px] px-[16px] text-body-sm text-on-surface flex items-center gap-[8px]">
                        <div className="w-5 h-5 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold">
                          {doc.owner_id ? "U" : ""}
                        </div>
                        {doc.owner_id ? doc.owner_id.substring(0,8) : "Unknown"}
                      </td>
                      <td className="py-[12px] px-[16px] text-right">
                        <button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
