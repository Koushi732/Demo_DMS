"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  History, 
  Flag, 
  User, 
  Eye, 
  Download, 
  ArrowLeftRight,
  GitCompare
} from "lucide-react";
import { DocumentService, DocumentResponse, DocumentVersion } from "@/services/documentService";
import { notFound } from "next/navigation";

export default function VersionHistoryPage({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docData = await DocumentService.getDocument(params.id);
        setDoc(docData);
        const versionsData = await DocumentService.getVersions(params.id);
        // Ensure versions are sorted descending (latest first)
        setVersions(versionsData.sort((a, b) => b.version_number - a.version_number));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading versions...</div>;
  if (!doc) return notFound();

  return (
    <div className="flex-1 overflow-y-auto p-[24px]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header Section */}
        <div className="mb-[40px] flex flex-col md:flex-row md:items-start justify-between gap-[16px]">
          <div>
            <div className="flex items-center gap-[8px] mb-[4px]">
              <span className="text-label-caps text-on-surface-variant">{doc.document_number}</span>
              <span className="px-[4px] py-1 rounded bg-surface-container-high text-on-surface text-[10px] font-semibold uppercase tracking-wider">
                {doc.document_type?.name}
              </span>
            </div>
            <h2 className="text-display-lg text-on-surface">{doc.title}</h2>
          </div>
          <div className="flex gap-[8px]">
            <button className="px-[16px] py-[8px] border border-outline-variant rounded text-on-surface text-body-sm hover:bg-surface-container-lowest transition-colors flex items-center gap-[4px]">
              <ArrowLeftRight size={18} />
              Compare Versions
            </button>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-[24px] max-w-4xl shadow-sm">
          <h3 className="text-title-sm text-on-surface mb-[24px] pb-[8px] border-b border-outline-variant">
            Version History
          </h3>
          
          <div className="relative pl-[4px]">
            
            {versions.map((version, index) => {
              const isCurrent = index === 0;
              const isObsolete = index === versions.length - 1 && versions.length > 1;

              return (
                <div key={version.id} className="relative mb-[40px] group last:mb-0">
                  <div className="absolute left-[23px] top-[48px] bottom-[-40px] w-[2px] bg-outline-variant group-last:hidden"></div>
                  <div className="flex gap-[24px]">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isCurrent ? 'bg-surface-container-lowest border-2 border-primary' : 'bg-surface-container-highest border border-outline-variant'}`}>
                      {isCurrent ? (
                        <>
                          <CheckCircle2 className="text-primary" size={24} />
                          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20"></div>
                        </>
                      ) : isObsolete ? (
                         <Flag className="text-on-surface-variant" size={24} />
                      ) : (
                         <History className="text-on-surface-variant" size={24} />
                      )}
                    </div>
                    
                    <div className={`flex-1 bg-surface-container-low rounded-lg p-[16px] ${isCurrent ? 'border-t-2 border-primary' : 'border border-outline-variant'}`}>
                      <div className="flex justify-between items-start mb-[8px]">
                        <div className="flex items-center gap-[16px]">
                          <h4 className={`text-title-sm ${isCurrent ? 'text-on-surface' : 'text-on-surface-variant'}`}>Version {version.version_number}</h4>
                          {isCurrent ? (
                            <span className="px-[8px] py-[4px] rounded bg-primary/10 text-primary border-l-2 border-primary text-label-caps">
                              CURRENT • {doc.status.toUpperCase()}
                            </span>
                          ) : isObsolete ? (
                            <span className="px-[8px] py-[4px] rounded bg-surface-variant text-on-surface-variant text-label-caps border-l-2 border-outline-variant">
                              OBSOLETE
                            </span>
                          ) : (
                            <span className="px-[8px] py-[4px] rounded bg-surface-variant text-on-surface-variant text-label-caps border-l-2 border-outline-variant">
                              SUPERSEDED
                            </span>
                          )}
                        </div>
                        <span className="font-code-data text-on-surface-variant">{version.created_at ? new Date(version.created_at).toLocaleDateString() : ''}</span>
                      </div>
                      
                      <p className={`text-body-md mb-[16px] ${isCurrent ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {version.change_reason || (isCurrent ? doc.description : 'Routine update')}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-[8px] border-t border-outline-variant">
                        <div className="flex items-center gap-[8px]">
                          <User size={16} className={isCurrent ? "text-on-surface-variant" : "text-outline-variant"} />
                          <span className="text-body-sm text-on-surface-variant">{doc.owner?.first_name} {doc.owner?.last_name}</span>
                        </div>
                        <div className="flex gap-[8px]">
                          <button className="p-[4px] text-primary hover:bg-primary/10 rounded flex items-center justify-center" title="View">
                            <Eye size={18} />
                          </button>
                          <button className="p-[4px] text-on-surface-variant hover:bg-surface-container-highest rounded flex items-center justify-center" title="Download PDF">
                            <Download size={18} />
                          </button>
                          {!isCurrent && (
                            <button className="p-[4px] text-on-surface-variant hover:bg-surface-container-low rounded flex items-center justify-center" title="Compare to Current">
                              <GitCompare size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {versions.length === 0 && (
               <div className="text-on-surface-variant text-body-md py-8">
                 No versions recorded yet.
               </div>
            )}

          </div>
        </div>
        
      </div>
    </div>
  );
}
