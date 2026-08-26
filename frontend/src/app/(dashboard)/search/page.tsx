"use client";

import { useEffect, useState } from "react";
import { 
  Filter, 
  SortDesc, 
  FileText, 
  File as FileIcon,
  Search as SearchIcon,
  Building2,
  Tags,
  Hash,
  Calendar
} from "lucide-react";
import { DocumentService, DocumentResponse } from "@/services/documentService";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const response = await DocumentService.searchDocuments({ q, page: 1, page_size: 50 });
        setSearchResults(response.items);
        setTotal(response.total);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };
    if (q) {
      fetchSearch();
    }
  }, [q]);

  const handleDocClick = (id: string) => {
    router.push(`/documents/${id}/preview`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto p-[40px] flex justify-center">
        <div className="w-full max-w-5xl flex flex-col gap-[24px]">
          
          {/* Search Header Info */}
          <div className="flex justify-between items-end border-b border-outline-variant pb-[8px]">
            <div>
              <h2 className="text-title-sm text-on-surface">Search Results</h2>
              <p className="text-body-sm text-on-surface-variant mt-[4px]">
                {loading && q ? "Searching..." : `Showing ${searchResults.length} results for "${q}"`}
              </p>
            </div>
            <div className="flex gap-[8px]">
              <button className="flex items-center gap-[4px] px-[8px] py-[4px] border border-outline-variant rounded bg-surface text-on-surface-variant hover:bg-surface-container-low text-label-caps transition-colors">
                <Filter size={16} /> Filter
              </button>
              <button className="flex items-center gap-[4px] px-[8px] py-[4px] border border-outline-variant rounded bg-surface text-on-surface-variant hover:bg-surface-container-low text-label-caps transition-colors">
                <SortDesc size={16} /> Relevance
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="flex flex-col gap-[16px]">
            {!loading && searchResults.length === 0 && (
              <div className="p-8 text-center text-on-surface-variant">
                No documents found for &quot;{q}&quot;.
              </div>
            )}
            
            {searchResults.map((doc, idx) => (
              <div 
                key={doc.id} 
                onClick={() => handleDocClick(doc.id)}
                className="bg-surface-container-lowest border border-outline-variant rounded-lg p-[16px] hover:border-primary transition-colors cursor-pointer relative overflow-hidden group shadow-sm"
              >
                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${idx === 0 ? 'bg-secondary-container group-hover:bg-primary' : 'bg-transparent group-hover:bg-primary'}`}></div>
                
                <div className="flex justify-between items-start mb-[8px] ml-[4px]">
                  <div className="flex items-center gap-[8px]">
                    <FileText className="text-on-surface-variant" size={20} />
                    <span className="font-code-data text-on-surface-variant">{doc.document_number}</span>
                    <h3 className="text-title-sm text-primary">{doc.title}</h3>
                  </div>
                  <span className={`px-[4px] py-[2px] text-label-caps rounded-r ${
                    doc.status === "EFFECTIVE" || doc.status === "APPROVED" ? "bg-emerald-50 border-l-2 border-emerald-500 text-emerald-800" :
                    doc.status === "UNDER_REVIEW" || doc.status === "PENDING" ? "bg-blue-50 border-l-2 border-blue-500 text-blue-800" :
                    "bg-surface-container border-l-2 border-outline text-on-surface-variant"
                  }`}>{doc.status?.toUpperCase() || 'DRAFT'}</span>
                </div>
                
                <div className="ml-[40px] pl-[4px] mb-[16px]">
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    {doc.description || "No description provided."}
                  </p>
                </div>
                
                <div className="ml-[40px] pl-[4px] flex flex-wrap items-center gap-[24px] text-body-sm text-on-surface-variant border-t border-outline-variant pt-[8px]">
                  <span className="flex items-center gap-[4px]"><Calendar size={16} /> {new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
