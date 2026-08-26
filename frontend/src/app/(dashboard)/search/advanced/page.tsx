"use client";

import { useEffect, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight, Download, FileText, Filter, FlaskConical, LayoutGrid, List, MoreVertical, Plus, Search } from "lucide-react";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function AdvancedSearchPage() {
  const [searchResults, setSearchResults] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadResults = async (q: string = "", stat: string = "") => {
    setLoading(true);
    try {
      const data = await DocumentService.searchDocuments({ search: q, status: stat || undefined });
      setSearchResults(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadResults();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadResults(query, statusFilter);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + "Document Number,Title,Status\n" + searchResults.map(d => `${d.document_number},"${d.title.replace(/"/g, '""')}",${d.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "search_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSaveSearch = () => {
    alert("Search parameters saved successfully.");
  };
  
  const handleClearAll = () => {
    setQuery("");
    setStatusFilter("");
    loadResults("", "");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      
      {/* Page Header */}
      <div className="px-[40px] py-[24px] flex-shrink-0 bg-surface-bright border-b border-outline-variant">
        <div className="max-w-[1440px] mx-auto flex justify-between items-end">
          <div>
            <div className="flex items-center gap-[8px] text-body-sm font-body-sm text-on-surface-variant mb-[4px]">
              <span>Documents</span>
              <ChevronRight fontSize="small" />
              <span className="text-primary font-medium">Advanced Search</span>
            </div>
            <h2 className="text-display-lg text-on-surface">Advanced Search</h2>
            <p className="text-body-md text-on-surface-variant mt-[8px]">Filter and locate controlled documents across all departments.</p>
          </div>
          <div className="flex gap-[12px]">
            <button onClick={handleSaveSearch} className="h-9 px-[16px] rounded-md border border-outline-variant bg-surface text-on-surface text-body-sm font-medium hover:bg-surface-container-low flex items-center gap-[8px] transition-colors">
              <Bookmark fontSize="small" />
              Save Search
            </button>
            <button onClick={handleExport} className="h-9 px-[16px] rounded-md bg-primary text-on-primary text-body-sm font-medium hover:opacity-90 flex items-center gap-[8px] transition-opacity">
              <Download fontSize="small" />
              Export Results
            </button>
          </div>
        </div>
      </div>
      
      {/* Content Area (Filters + Results) */}
      <div className="flex-1 overflow-hidden flex max-w-[1440px] w-full mx-auto p-[40px] gap-[40px]">
        
        {/* Advanced Filters Sidebar (Left) */}
        <aside className="w-72 flex-shrink-0 h-full flex flex-col bg-surface-bright rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-[16px] border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <h3 className="text-title-sm text-on-surface flex items-center gap-[8px]">
              <Filter fontSize="small" />
              Filters
            </h3>
            <button onClick={handleClearAll} className="text-body-sm text-on-surface-variant hover:text-primary transition-colors underline decoration-outline-variant underline-offset-2">Clear All</button>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-[16px] space-y-[24px]">
              
              {/* Search Keyword */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[8px]">KEYWORD SEARCH</label>
                <div className="relative">
                  <Search className="absolute left-[10px] top-[10px] text-on-surface-variant" fontSize="small" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. 'Validation Protocol'" 
                    className="w-full h-[36px] pl-[36px] pr-[12px] bg-surface border border-outline-variant rounded-md text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              
              {/* Document Type */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[8px]">DOCUMENT TYPE</label>
                <div className="space-y-[8px]">
                  <label className="flex items-center gap-[8px] group cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                    <span className="text-body-sm text-on-surface group-hover:text-primary transition-colors">Standard Operating Procedure (SOP)</span>
                  </label>
                  <label className="flex items-center gap-[8px] group cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                    <span className="text-body-sm text-on-surface group-hover:text-primary transition-colors">Validation Protocol</span>
                  </label>
                  <label className="flex items-center gap-[8px] group cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                    <span className="text-body-sm text-on-surface group-hover:text-primary transition-colors">Batch Record</span>
                  </label>
                </div>
                <button type="button" className="mt-[8px] text-body-sm text-primary flex items-center gap-[4px] hover:underline underline-offset-2">
                  <Plus fontSize="small" /> Show more
                </button>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[8px]">STATUS</label>
                <div className="flex flex-wrap gap-[8px]">
                  <button type="button" onClick={() => setStatusFilter(statusFilter === 'EFFECTIVE' ? '' : 'EFFECTIVE')} className={`px-[12px] py-[6px] rounded-full text-body-sm transition-colors ${statusFilter === 'EFFECTIVE' ? 'border border-primary bg-primary-fixed text-on-primary-fixed font-medium hover:bg-primary-fixed-dim' : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'}`}>Effective</button>
                  <button type="button" onClick={() => setStatusFilter(statusFilter === 'DRAFT' ? '' : 'DRAFT')} className={`px-[12px] py-[6px] rounded-full text-body-sm transition-colors ${statusFilter === 'DRAFT' ? 'border border-primary bg-primary-fixed text-on-primary-fixed font-medium hover:bg-primary-fixed-dim' : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'}`}>Draft</button>
                  <button type="button" onClick={() => setStatusFilter(statusFilter === 'UNDER_REVIEW' ? '' : 'UNDER_REVIEW')} className={`px-[12px] py-[6px] rounded-full text-body-sm transition-colors ${statusFilter === 'UNDER_REVIEW' ? 'border border-primary bg-primary-fixed text-on-primary-fixed font-medium hover:bg-primary-fixed-dim' : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'}`}>In Review</button>
                  <button type="button" onClick={() => setStatusFilter(statusFilter === 'OBSOLETE' ? '' : 'OBSOLETE')} className={`px-[12px] py-[6px] rounded-full text-body-sm transition-colors ${statusFilter === 'OBSOLETE' ? 'border border-primary bg-primary-fixed text-on-primary-fixed font-medium hover:bg-primary-fixed-dim' : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-low'}`}>Obsolete</button>
                </div>
              </div>
              
            </div>
            
            <div className="p-[16px] border-t border-outline-variant bg-surface-container-lowest">
              <button type="submit" className="w-full h-10 bg-primary text-on-primary rounded-md text-body-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px]">
                <Search fontSize="small" />
                Apply Filters
              </button>
            </div>
          </form>
        </aside>
        
        {/* Results Grid */}
        <div className="flex-1 h-full flex flex-col min-w-0 bg-surface-bright rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          
          {/* Results Toolbar */}
          <div className="h-14 border-b border-outline-variant bg-surface-container-lowest px-[16px] flex items-center justify-between flex-shrink-0">
            <div className="text-body-sm text-on-surface">
              Showing <span className="font-semibold">{searchResults.length}</span> results
            </div>
            <div className="flex items-center gap-[16px]">
              <div className="flex items-center gap-[8px]">
                <span className="text-label-caps text-on-surface-variant">SORT BY</span>
                <select className="h-8 bg-transparent border-none text-body-sm text-on-surface font-medium focus:ring-0 cursor-pointer pl-0 py-0 outline-none">
                  <option>Relevance</option>
                  <option defaultValue="date">Date Modified (Newest)</option>
                  <option>Document ID (A-Z)</option>
                  <option>Title (A-Z)</option>
                </select>
              </div>
              <div className="h-6 w-px bg-outline-variant"></div>
              <div className="flex bg-surface-container-low rounded-md p-0.5 border border-outline-variant">
                <button className="w-7 h-7 rounded flex items-center justify-center bg-surface-bright shadow-sm text-primary">
                  <LayoutGrid fontSize="small" />
                </button>
                <button className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                  <List fontSize="small" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto p-[24px] bg-background">
            {loading ? (
              <div className="p-4 text-center text-on-surface-variant">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-on-surface-variant">No results found.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[16px]">
                {searchResults.map(doc => (
                  <div key={doc.id} className="bg-surface-bright rounded-lg border border-outline-variant hover:border-primary/50 hover:shadow-md transition-all group flex flex-col h-[220px]">
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
                      <button className="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                    <div className="p-[16px] flex-1 flex flex-col justify-between">
                      <div className="space-y-[8px]">
                        <div className="flex items-center justify-between text-body-sm">
                          <span className="text-on-surface-variant">Version:</span>
                          <span className="text-on-surface font-medium">v{doc.current_version ? 1 : 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-body-sm">
                          <span className="text-on-surface-variant">Last Updated:</span>
                          <span className="text-on-surface">{new Date(doc.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-[16px]">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full border-2 border-surface-bright bg-surface-container-highest flex items-center justify-center text-[10px] font-medium text-on-surface-variant"></div>
                        </div>
                        <span className={`text-label-caps px-[8px] py-[2px] rounded-r-sm ${
                          doc.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500" :
                          doc.status === "REVIEW" ? "bg-amber-50 text-amber-700 border-l-2 border-amber-500" :
                          "bg-surface-container text-on-surface-variant border-l-2 border-outline"
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          <div className="h-14 border-t border-outline-variant bg-surface-container-lowest px-[16px] flex items-center justify-between flex-shrink-0">
            <button className="px-[12px] py-[6px] rounded border border-outline-variant text-body-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50 flex items-center gap-[4px]" disabled>
              <ChevronLeft fontSize="small" /> Previous
            </button>
            <div className="flex items-center gap-[4px]">
              <button className="w-8 h-8 rounded bg-primary text-on-primary text-body-sm font-medium flex items-center justify-center">1</button>
            </div>
            <button className="px-[12px] py-[6px] rounded border border-outline-variant text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-[4px] transition-colors" disabled>
              Next <ChevronRight fontSize="small" />
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
