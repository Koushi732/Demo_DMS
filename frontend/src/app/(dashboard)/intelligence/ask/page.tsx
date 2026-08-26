"use client";

import { useState } from "react";
import { BarChart, Brain, FileText, Info, Paperclip, Send, ThumbsUp, ThumbsDown } from "lucide-react";

export default function AskYourDocumentsPage() {
  const [query, setQuery] = useState("");
  const [chat, setChat] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'user', content: "What are the cleaning requirements outlined in SOP-QA-014?" },
    { role: 'ai', content: "Based on the retrieved documents, the cleaning requirements are strictly defined for cross-contamination prevention.\n\nThe procedure requires cleaning verification after each production cycle. Specifically, equipment must undergo a complete CIP (Clean-In-Place) cycle using alkaline detergent followed by purified water rinsing until the TOC (Total Organic Carbon) level is verified to be < 10 ppm." }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!query.trim()) return;
    const userQuery = query;
    setChat(prev => [...prev, { role: 'user', content: userQuery }]);
    setQuery("");
    setLoading(true);
    
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'ai', content: "I am an AI assistant. I have processed your query regarding: " + userQuery + "\n\n(Simulated response from global index)" }]);
      setLoading(false);
    }, 1000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    alert(`Feedback recorded: ${type}`);
  };

  const handleAttachContext = () => {
    alert('Document context attachment dialog would open here.');
  };

  const handleSuggestedQuery = (q: string) => {
    setQuery(q);
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-background">
      
      {/* Page Canvas: AI Chat Interface */}
      <div className="flex-1 flex overflow-hidden bg-background">
        
        {/* Center Canvas: Chat History & Input */}
        <div className="flex-1 flex flex-col h-full max-w-[800px] mx-auto border-x border-outline-variant bg-surface-container-lowest">
          
          {/* Chat Header Area */}
          <div className="px-[40px] py-[24px] border-b border-outline-variant bg-surface-bright flex-shrink-0">
            <h2 className="text-display-lg text-primary mb-[4px]">Ask Your Documents</h2>
            <p className="text-body-md text-on-surface-variant">Query validated SOPs, Batch Records, and Quality Manuals using RAG-enabled intelligence.</p>
            <div className="flex gap-[8px] mt-[16px] overflow-x-auto pb-[4px]">
              <button onClick={() => handleSuggestedQuery("What is the retention period for batch records?")} className="px-[12px] py-[6px] rounded-full border border-outline-variant bg-surface text-body-sm text-on-surface hover:bg-surface-container-low transition-colors whitespace-nowrap">What is the retention period for batch records?</button>
              <button onClick={() => handleSuggestedQuery("Summarize the gowning procedure")} className="px-[12px] py-[6px] rounded-full border border-outline-variant bg-surface text-body-sm text-on-surface hover:bg-surface-container-low transition-colors whitespace-nowrap">Summarize the gowning procedure</button>
              <button onClick={() => handleSuggestedQuery("What are the CAPA workflow steps?")} className="px-[12px] py-[6px] rounded-full border border-outline-variant bg-surface text-body-sm text-on-surface hover:bg-surface-container-low transition-colors whitespace-nowrap">What are the CAPA workflow steps?</button>
            </div>
          </div>
          
          {/* Chat Scroll Area */}
          <div className="flex-1 overflow-y-auto p-[40px] flex flex-col gap-[24px]">
            
            {chat.map((msg, index) => (
              <div key={index} className="flex flex-col gap-[16px]">
                {msg.role === 'user' ? (
                  <div className="self-end bg-surface-container text-on-surface rounded-xl rounded-tr-none px-[16px] py-[8px] max-w-[80%] border border-outline-variant shadow-sm">
                    <p className="text-body-md">{msg.content}</p>
                  </div>
                ) : (
                  <div className="self-start flex gap-[16px] max-w-[90%]">
                    <div className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20">
                      <Brain fontSize="small" />
                    </div>
                    
                    <div className="bg-[#F0FDFA] rounded-xl rounded-tl-none border border-[#0F172A]/10 px-[24px] py-[16px] shadow-sm relative w-full">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#0F172A] to-[#0D9488] rounded-l-xl"></div>
                      
                      <div className="text-on-surface font-body-md text-body-md leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      
                      <div className="mt-[16px] pt-[16px] border-t border-[#0F172A]/10 flex justify-between items-center">
                        <div>
                          <p className="text-label-caps text-on-surface-variant mb-[8px]">VERIFIED SOURCES</p>
                          <div className="flex flex-wrap gap-[8px]">
                            <button className="flex items-center gap-[4px] px-[8px] py-[4px] bg-surface-container-lowest border border-outline-variant rounded hover:border-primary hover:bg-surface-container-low transition-colors text-left group">
                              <FileText className="text-outline group-hover:text-primary transition-colors" size={14} />
                              <span className="font-code-data text-on-surface text-xs">Indexed DB</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-[8px]">
                          <button onClick={() => handleFeedback('up')} className="p-2 rounded text-outline hover:text-primary hover:bg-surface-container-low transition-colors"><ThumbsUp size={16} /></button>
                          <button onClick={() => handleFeedback('down')} className="p-2 rounded text-outline hover:text-error hover:bg-surface-container-low transition-colors"><ThumbsDown size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="self-start flex gap-[16px] max-w-[90%]">
                <div className="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20 animate-pulse">
                  <Brain fontSize="small" />
                </div>
                <div className="bg-[#F0FDFA] rounded-xl rounded-tl-none border border-[#0F172A]/10 px-[24px] py-[16px] shadow-sm relative min-w-[200px] flex items-center">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center mt-[16px]">
              <span className="text-label-caps text-outline-variant">SYSTEM READY FOR NEXT QUERY</span>
            </div>
            
          </div>
          
          {/* Input Area */}
          <div className="p-[24px] bg-surface-bright border-t border-outline-variant flex-shrink-0 z-10 relative shadow-sm">
            <div className="relative bg-surface-container-lowest rounded-lg border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex items-end">
              <textarea 
                className="w-full bg-transparent border-none p-[16px] pr-[80px] text-body-md text-on-surface resize-none focus:outline-none min-h-[56px] max-h-[120px]" 
                placeholder="Enter your query regarding quality documents..." 
                rows={1}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              ></textarea>
              <div className="absolute right-[16px] bottom-[16px] flex items-center gap-[8px]">
                <button onClick={handleAttachContext} className="text-outline hover:text-primary transition-colors p-[4px] rounded hover:bg-surface-container-low" title="Attach Document Context">
                  <Paperclip fontSize="small" />
                </button>
                <button onClick={handleSend} disabled={!query.trim()} className="bg-primary text-on-primary rounded p-[4px] hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50">
                  <Send fontSize="small" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mt-[8px] px-[4px]">
              <span className="text-body-sm text-outline flex items-center gap-[4px]">
                <Info size={14} />
                Responses are generated based solely on indexed regulatory documents.
              </span>
              <span className="text-label-caps text-outline-variant">ENTER TO SUBMIT</span>
            </div>
          </div>
          
        </div>
        
        {/* Right Panel: Contextual Metadata & Filters (Desktop only) */}
        <div className="hidden xl:flex flex-col w-[320px] bg-surface-container-lowest border-l border-outline-variant flex-shrink-0">
          <div className="p-[16px] border-b border-outline-variant bg-surface-bright">
            <h3 className="text-title-sm text-on-surface">Search Scope</h3>
          </div>
          
          <div className="p-[16px] flex-1 overflow-y-auto">
            
            <div className="mb-[24px]">
              <p className="text-label-caps text-on-surface-variant mb-[8px]">ACTIVE COLLECTIONS</p>
              <div className="flex flex-col gap-[4px]">
                <label className="flex items-center gap-[8px] cursor-pointer p-[4px] rounded hover:bg-surface-container-low transition-colors">
                  <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                  <span className="text-body-md text-on-surface">Standard Operating Procedures (SOPs)</span>
                </label>
                <label className="flex items-center gap-[8px] cursor-pointer p-[4px] rounded hover:bg-surface-container-low transition-colors">
                  <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                  <span className="text-body-md text-on-surface">Validation Protocols</span>
                </label>
                <label className="flex items-center gap-[8px] cursor-pointer p-[4px] rounded hover:bg-surface-container-low transition-colors">
                  <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                  <span className="text-body-md text-on-surface">Batch Manufacturing Records</span>
                </label>
              </div>
            </div>
            
            <div className="mb-[24px]">
              <p className="text-label-caps text-on-surface-variant mb-[8px]">SYSTEM STATUS</p>
              <div className="bg-surface-container-low p-[16px] rounded border border-outline-variant">
                <div className="flex justify-between items-center mb-[4px]">
                  <span className="text-body-sm text-on-surface-variant">Index Sync</span>
                  <span className="font-code-data text-on-surface flex items-center gap-[4px]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    Up to date
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-on-surface-variant">Last Indexed</span>
                  <span className="font-code-data text-on-surface">Today, 08:30 AM</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
