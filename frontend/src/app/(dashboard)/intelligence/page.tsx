"use client";

import { ArrowUp, Bot, Check, Copy, FileSearch, FileText, Info, MessageSquare, Save, ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";

export default function DocumentIntelligencePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background h-full">
      <main className="flex-1 p-[24px] overflow-hidden flex flex-col gap-[24px] max-w-[1440px] mx-auto w-full h-full">
        
        {/* Header Section */}
        <div className="flex flex-col gap-[4px] flex-shrink-0">
          <h1 className="text-headline-md text-on-surface">Document Intelligence</h1>
          <p className="text-body-sm text-on-surface-variant">AI-powered analysis, extraction, and insights for standard operating procedures.</p>
        </div>
        
        {/* Feature Selector (Bento-style row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] flex-shrink-0">
          {/* Feature 1 */}
          <button className="flex items-start gap-[8px] p-[16px] rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-primary/50 transition-colors text-left">
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
              <FileText fontSize="small" />
            </div>
            <div>
              <div className="text-title-sm text-on-surface mb-1">Summarize document</div>
              <div className="text-body-sm text-on-surface-variant">Generate concise overviews of lengthy compliance texts.</div>
            </div>
          </button>
          
          {/* Feature 2 */}
          <button className="flex items-start gap-[8px] p-[16px] rounded-lg border border-outline-variant bg-surface-container-lowest hover:border-primary/50 transition-colors text-left">
            <div className="w-8 h-8 rounded bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
              <Save fontSize="small" />
            </div>
            <div>
              <div className="text-title-sm text-on-surface mb-1">Extract key information</div>
              <div className="text-body-sm text-on-surface-variant">Automatically pull parameters, limits, and roles.</div>
            </div>
          </button>
          
          {/* Feature 3 (Active) */}
          <button className="flex items-start gap-[8px] p-[16px] rounded-lg border-2 border-primary bg-surface-container-lowest text-left relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <MessageSquare fontSize="small" />
            </div>
            <div>
              <div className="text-title-sm text-primary mb-1">Ask Your Documents</div>
              <div className="text-body-sm text-on-surface-variant">Query documents in natural language with precise citations.</div>
            </div>
          </button>
        </div>
        
        {/* Workspace Area (Split Pane) */}
        <div className="flex-1 flex gap-[24px] min-h-0">
          
          {/* Chat / AI Interaction Panel (Left) */}
          <div className="flex-1 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            
            {/* Context Header */}
            <div className="px-[16px] py-[8px] border-b border-outline-variant bg-surface-container-low flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-[8px] text-on-surface-variant">
                <FileText fontSize="small" />
                <span className="font-code-data">SOP-QA-014: Cleanroom Sanitation Protocols</span>
              </div>
              <div className="text-label-caps px-2 py-0.5 rounded bg-secondary/10 text-secondary border-l-2 border-secondary">
                V 2.4 APPROVED
              </div>
            </div>
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-[24px] flex flex-col gap-[24px] bg-background">
              
              {/* AI Greeting */}
              <div className="flex items-start gap-[16px] max-w-[85%]">
                <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot fontSize="small" />
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg rounded-tl-none p-[16px] text-on-surface text-body-sm shadow-sm">
                  I am ready to answer questions regarding <strong>SOP-QA-014</strong>. What specific information are you looking for?
                </div>
              </div>
              
              {/* User Message */}
              <div className="flex items-start gap-[16px] self-end max-w-[85%] flex-row-reverse">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant flex-shrink-0 mt-1 bg-surface-container-high flex items-center justify-center">
                  <span className="text-xs font-medium">ME</span>
                </div>
                <div className="bg-surface-container-high border border-outline-variant rounded-lg rounded-tr-none p-[16px] text-on-surface text-body-sm shadow-sm">
                  What are the cleaning requirements in SOP-QA-014?
                </div>
              </div>
              
              {/* AI Response */}
              <div className="flex items-start gap-[16px] max-w-[90%]">
                <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot fontSize="small" />
                </div>
                
                {/* AI Card Container */}
                <div className="flex-1 border border-outline-variant rounded-lg rounded-tl-none bg-surface-container-lowest overflow-hidden shadow-sm">
                  {/* Subtle Gradient Header */}
                  <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary"></div>
                  
                  <div className="p-[16px] text-body-sm text-on-surface space-y-[16px]">
                    <p>Based on <span className="font-code-data bg-surface-container px-1 py-0.5 rounded">SOP-QA-014</span>, the general cleaning requirements for the ISO Class 5 area dictate a multi-step process using approved agents. Key requirements include:</p>
                    
                    <ul className="list-disc pl-[24px] space-y-[8px] text-on-surface-variant">
                      <li>
                        <strong>Daily Surface Disinfection:</strong> All horizontal surfaces and high-touch areas must be wiped down with 70% IPA at the beginning and end of each shift. 
                        <span className="inline-flex items-center gap-[4px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code-data text-xs border border-secondary-fixed-dim hover:bg-secondary-fixed cursor-pointer transition-colors ml-2">
                          <FileSearch size={14} /> pg. 4, §3.1
                        </span>
                      </li>
                      <li>
                        <strong>Weekly Deep Cleaning:</strong> A sporicidal agent (Agent B-4) must be applied to walls, ceilings, and floors every 7 days. Minimum contact time is 10 minutes.
                        <span className="inline-flex items-center gap-[4px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code-data text-xs border border-secondary-fixed-dim hover:bg-secondary-fixed cursor-pointer transition-colors ml-2">
                          <FileSearch size={14} /> pg. 7, §4.2.1
                        </span>
                      </li>
                      <li>
                        <strong>Material Transfer:</strong> Items entering the critical zone must be sprayed and wiped continuously passing through the material airlock.
                        <span className="inline-flex items-center gap-[4px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-code-data text-xs border border-secondary-fixed-dim hover:bg-secondary-fixed cursor-pointer transition-colors ml-2">
                          <FileSearch size={14} /> pg. 12, §6.0
                        </span>
                      </li>
                    </ul>
                    
                    <div className="mt-[16px] pt-[8px] border-t border-outline-variant/50 flex items-center justify-between text-on-surface-variant text-label-caps">
                      <div className="flex items-center gap-[4px]">
                        <Check className="text-secondary" size={14} />
                        Sources verified across 3 distinct sections.
                      </div>
                      <div className="flex gap-[8px]">
                        <button className="hover:text-primary flex items-center gap-[4px]"><Copy size={14} /> Copy</button>
                        <button className="hover:text-primary flex items-center gap-[4px]"><ThumbsUp size={14} /></button>
                        <button className="hover:text-primary flex items-center gap-[4px]"><ThumbsDown size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
            
            {/* Input Area */}
            <div className="p-[16px] bg-surface-container-lowest border-t border-outline-variant flex-shrink-0">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Ask a question about this document..." 
                  className="w-full h-[36px] pl-[16px] pr-[40px] py-[8px] bg-background border border-outline-variant rounded text-body-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
                />
                <button className="absolute right-[8px] w-7 h-7 flex items-center justify-center rounded bg-primary text-on-primary hover:bg-primary/90 transition-colors">
                  <ArrowUp fontSize="small" />
                </button>
              </div>
              <div className="mt-[8px] text-center text-label-caps text-outline">
                AI can make mistakes. Verify critical compliance data.
              </div>
            </div>
            
          </div>
          
          {/* Document Metadata / Mini Preview Panel (Right) */}
          <div className="hidden xl:flex w-[320px] flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-shrink-0">
            <div className="px-[16px] py-[8px] border-b border-outline-variant bg-surface-container-low flex items-center gap-[8px]">
              <Info className="text-primary" fontSize="small" />
              <span className="text-title-sm text-on-surface">Document Details</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-[16px] space-y-[16px]">
              
              {/* Key Metadata */}
              <div className="border border-outline-variant rounded overflow-hidden">
                <table className="w-full text-left text-body-sm">
                  <tbody className="divide-y divide-outline-variant">
                    <tr>
                      <th className="px-[8px] py-[12px] bg-surface-container-low font-medium text-on-surface-variant w-1/3">Doc ID</th>
                      <td className="px-[8px] py-[12px] font-code-data text-on-surface">SOP-QA-014</td>
                    </tr>
                    <tr>
                      <th className="px-[8px] py-[12px] bg-surface-container-low font-medium text-on-surface-variant">Type</th>
                      <td className="px-[8px] py-[12px] text-on-surface">Standard Operating Procedure</td>
                    </tr>
                    <tr>
                      <th className="px-[8px] py-[12px] bg-surface-container-low font-medium text-on-surface-variant">Department</th>
                      <td className="px-[8px] py-[12px] text-on-surface">Quality Assurance</td>
                    </tr>
                    <tr>
                      <th className="px-[8px] py-[12px] bg-surface-container-low font-medium text-on-surface-variant">Effective</th>
                      <td className="px-[8px] py-[12px] font-code-data text-on-surface">2023-10-15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Extracted Entities Mini-view */}
              <div>
                <div className="text-label-caps text-on-surface-variant mb-[8px]">Auto-Extracted Entities</div>
                <div className="flex flex-wrap gap-[4px]">
                  <span className="px-2 py-1 bg-surface-container-low border border-outline-variant rounded text-[11px] font-medium text-on-surface">70% IPA</span>
                  <span className="px-2 py-1 bg-surface-container-low border border-outline-variant rounded text-[11px] font-medium text-on-surface">Agent B-4</span>
                  <span className="px-2 py-1 bg-surface-container-low border border-outline-variant rounded text-[11px] font-medium text-on-surface">ISO Class 5</span>
                  <span className="px-2 py-1 bg-surface-container-low border border-outline-variant rounded text-[11px] font-medium text-on-surface">10 Min Contact</span>
                </div>
              </div>
              
              {/* Lifecycle Workflow (Timeline) Mini */}
              <div>
                <div className="text-label-caps text-on-surface-variant mb-[16px]">Document Status</div>
                <div className="flex flex-col gap-[24px] relative">
                  {/* Line behind steps */}
                  <div className="absolute left-[9px] top-2 bottom-2 w-px bg-outline-variant"></div>
                  
                  {/* Step 1: Completed */}
                  <div className="flex items-start gap-[16px] relative z-10">
                    <div className="w-[20px] h-[20px] rounded-full bg-emerald-500 border-2 border-surface-container-lowest flex items-center justify-center mt-0.5">
                      <Check className="text-white" style={{fontSize: 12, fontWeight: 'bold'}} />
                    </div>
                    <div>
                      <div className="text-body-sm font-medium text-on-surface">Drafted</div>
                      <div className="font-code-data text-on-surface-variant text-[10px]">Oct 01, J. Smith</div>
                    </div>
                  </div>
                  
                  {/* Step 2: Current */}
                  <div className="flex items-start gap-[16px] relative z-10">
                    <div className="w-[20px] h-[20px] rounded-full border-2 border-primary bg-surface-container-lowest flex items-center justify-center mt-0.5 relative">
                      <div className="absolute w-full h-full rounded-full border-2 border-primary animate-ping opacity-20"></div>
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <div className="text-body-sm font-medium text-primary">Approved</div>
                      <div className="font-code-data text-on-surface-variant text-[10px]">Oct 15, System</div>
                    </div>
                  </div>
                  
                  {/* Step 3: Future */}
                  <div className="flex items-start gap-[16px] relative z-10">
                    <div className="w-[20px] h-[20px] rounded-full border-2 border-dashed border-outline bg-surface-container-lowest mt-0.5"></div>
                    <div>
                      <div className="text-body-sm text-on-surface-variant">Next Review</div>
                      <div className="font-code-data text-outline text-[10px]">Oct 2024</div>
                    </div>
                  </div>
                  
                </div>
              </div>
              
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
