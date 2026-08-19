"use client";

import { useEffect, useState } from "react";
import { Ban, ChevronRight, Copy, Link as LinkIcon, Link2Off, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DocumentService, DocumentResponse } from "@/services/documentService";

export default function SecureSharingPage() {
  const params = useParams();
  const documentId = params?.id as string;
  
  const [doc, setDoc] = useState<DocumentResponse | null>(null);
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [docData, sharesData] = await Promise.all([
          DocumentService.getDocument(documentId),
          DocumentService.getShares(documentId).catch(() => []) // Fallback to empty if endpoint not implemented
        ]);
        setDoc(docData);
        setShares(sharesData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (documentId) load();
  }, [documentId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!doc) return <div className="p-8">Document not found</div>;

  return (
    <div className="flex-1 p-[24px] max-w-[1440px] mx-auto w-full bg-background">
      
      <div className="mb-[24px]">
        <nav className="flex items-center text-on-surface-variant font-body-sm text-body-sm mb-[4px]">
          <Link href="/documents" className="hover:text-primary transition-colors">Documents</Link>
          <ChevronRight size={16} className="mx-[4px]" />
          <Link href={`/documents/${doc.id}`} className="hover:text-primary transition-colors">{doc.document_number}</Link>
          <ChevronRight size={16} className="mx-[4px]" />
          <span className="text-on-surface">Share</span>
        </nav>
        <h1 className="text-headline-md text-on-surface">Secure Document Sharing</h1>
        <p className="text-body-md text-on-surface-variant mt-[4px]">Manage access and distribute secure links for {doc.document_number}.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
        
        {/* Sharing Options Panel */}
        <div className="lg:col-span-5 flex flex-col gap-[16px]">
          
          {/* Share with Internal */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-[24px] shadow-sm">
            <h2 className="text-title-sm text-on-surface mb-[16px]">Share Internally</h2>
            <div className="space-y-[16px]">
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">SHARE WITH USER</label>
                <div className="relative flex items-center">
                  <Search className="absolute left-[12px] text-on-surface-variant" style={{fontSize: 20}} />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full h-[36px] pl-[40px] pr-[12px] border border-outline-variant rounded text-body-md bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-[16px] py-[8px]">
                <div className="flex-1 h-[1px] bg-outline-variant"></div>
                <span className="text-label-caps text-on-surface-variant">OR</span>
                <div className="flex-1 h-[1px] bg-outline-variant"></div>
              </div>
              
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">SHARE WITH DEPARTMENT</label>
                <select className="w-full h-[36px] px-[12px] border border-outline-variant rounded text-body-md bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                  <option disabled value="" defaultValue="">Select department...</option>
                  <option value="qc">Quality Control</option>
                  <option value="qa">Quality Assurance</option>
                  <option value="mfg">Manufacturing</option>
                  <option value="reg">Regulatory Affairs</option>
                </select>
              </div>
              
              <div className="pt-[8px]">
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">ACCESS LEVEL</label>
                <div className="flex gap-[16px]">
                  <label className="flex items-center gap-[8px] cursor-pointer">
                    <input type="radio" name="internal_access" value="view" defaultChecked className="text-primary focus:ring-primary border-outline-variant" />
                    <span className="text-body-md">View Only</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer">
                    <input type="radio" name="internal_access" value="edit" className="text-primary focus:ring-primary border-outline-variant" />
                    <span className="text-body-md">Comment</span>
                  </label>
                </div>
              </div>
              
              <button className="w-full h-[36px] bg-primary text-on-primary rounded text-body-md font-semibold hover:bg-on-surface transition-colors mt-[8px]">
                Share Securely
              </button>
            </div>
          </div>
          
          {/* Generate Link */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-[24px] shadow-sm">
            <div className="flex items-center gap-[8px] mb-[16px]">
              <LinkIcon className="text-primary" />
              <h2 className="text-title-sm text-on-surface">Generate Secure Link</h2>
            </div>
            
            <div className="space-y-[16px]">
              
              <div className="flex items-center justify-between p-[8px] bg-surface-container-low border border-outline-variant rounded">
                <div>
                  <span className="block text-label-caps text-on-surface-variant">LINK TYPE</span>
                  <span className="text-body-md text-on-surface">External Access</span>
                </div>
                <div className="relative inline-block w-[40px] align-middle select-none transition duration-200 ease-in mr-[8px]">
                  <input type="checkbox" name="toggle" id="toggle" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-outline-variant outline-none" style={{ right: 0, borderColor: '#000000', transition: 'all 0.3s' }} />
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-primary cursor-pointer" style={{ transition: 'all 0.3s' }}></label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">PERMISSIONS</label>
                  <select className="w-full h-[36px] px-[12px] border border-outline-variant rounded text-body-md bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option value="view">View Only</option>
                    <option value="download">View &amp; Download</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[4px]">EXPIRATION</label>
                  <select className="w-full h-[36px] px-[12px] border border-outline-variant rounded text-body-md bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="custom">Custom Date</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-[8px] cursor-pointer mb-[4px]">
                  <input type="checkbox" defaultChecked className="text-primary focus:ring-primary border-outline-variant rounded" />
                  <span className="text-body-md text-on-surface">Require Password</span>
                </label>
                <div className="relative flex items-center">
                  <input 
                    type="password" 
                    readOnly 
                    value="auto-generated-pw-123" 
                    className="w-full h-[36px] px-[12px] pr-[32px] border border-outline-variant rounded font-code-data text-code-data bg-surface-bright focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                  <button className="absolute right-[8px] text-on-surface-variant hover:text-primary flex items-center justify-center">
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
              
              <div className="pt-[8px] border-t border-outline-variant">
                <div className="flex gap-[8px]">
                  <input 
                    type="text" 
                    readOnly 
                    value="https://aureon.app/share/s8f92k3"
                    className="flex-1 h-[36px] px-[12px] border border-outline-variant rounded text-body-sm bg-surface-container-low text-on-surface-variant outline-none"
                  />
                  <button className="h-[36px] px-[16px] bg-surface-container-highest border border-outline-variant rounded text-body-md font-semibold text-on-surface hover:bg-surface-dim transition-colors flex items-center gap-[8px]">
                    <Copy size={18} />
                    Copy
                  </button>
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
        
        {/* Active Shares Table */}
        <div className="lg:col-span-7 flex flex-col min-h-0">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
            <div className="p-[16px] border-b border-outline-variant bg-surface-bright flex justify-between items-center">
              <h2 className="text-title-sm text-on-surface">Active Shares</h2>
              <span className="text-body-sm text-on-surface-variant">{shares.length} Active Links</span>
            </div>
            
            <div className="overflow-x-auto flex-1 bg-surface-container-lowest">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F1F5F9] border-b border-outline-variant text-label-caps text-on-surface-variant sticky top-0 z-10">
                  <tr>
                    <th className="py-[12px] px-[16px] font-semibold w-1/3">RECIPIENT / TARGET</th>
                    <th className="py-[12px] px-[16px] font-semibold w-1/4">TYPE</th>
                    <th className="py-[12px] px-[16px] font-semibold w-1/4">EXPIRES</th>
                    <th className="py-[12px] px-[16px] font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant">
                  {shares.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-[16px] text-center text-on-surface-variant">No active shares.</td>
                    </tr>
                  ) : (
                    shares.map((share, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-[12px] px-[16px]">
                          <div className="flex items-center gap-[12px]">
                            <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-[10px]">QC</div>
                            <span className="font-semibold">{share.recipient}</span>
                          </div>
                        </td>
                        <td className="py-[12px] px-[16px]">
                          <span className="inline-flex items-center px-[8px] py-[2px] rounded text-[11px] font-semibold bg-surface-container-high text-on-surface-variant border-l-2 border-primary">
                            {share.type}
                          </span>
                        </td>
                        <td className="py-[12px] px-[16px] text-on-surface-variant">{share.expires}</td>
                        <td className="py-[12px] px-[16px] text-right">
                          <button className="text-error hover:text-on-error-container transition-colors" title="Revoke Access">
                            <Ban size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-[8px] border-t border-outline-variant bg-surface-bright flex justify-end">
              <button className="px-[16px] py-[6px] border border-outline-variant rounded text-body-md font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
                View Audit Log
              </button>
            </div>
            
          </div>
        </div>
        
      </div>
      
    </div>
  );
}
