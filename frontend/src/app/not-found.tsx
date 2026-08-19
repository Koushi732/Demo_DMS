"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-[24px]">
      <div className="max-w-[480px] w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-[40px] text-center shadow-sm">
        
        {/* Error Icon */}
        <div className="w-20 h-20 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-[24px]">
          <AlertTriangle size={40} />
        </div>
        
        {/* Error Text */}
        <h1 className="text-display-lg text-on-surface mb-[16px]">Page Not Found</h1>
        <p className="text-body-md text-on-surface-variant mb-[32px]">
          The resource you are looking for has been removed, had its name changed, or is temporarily unavailable. 
        </p>
        
        {/* Meta Info */}
        <div className="bg-surface-container-low border border-outline-variant rounded-[8px] p-[16px] mb-[32px] text-left">
          <div className="flex items-center justify-between border-b border-outline-variant pb-[8px] mb-[8px]">
            <span className="text-label-caps text-on-surface-variant">Error Code</span>
            <span className="font-code-data text-error font-semibold">404_RESOURCE_NOT_FOUND</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant">System Status</span>
            <span className="text-body-sm text-emerald-600 flex items-center gap-[4px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-[16px] justify-center">
          <button 
            onClick={() => window.history.back()}
            className="h-[40px] px-[24px] rounded border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-caps flex items-center justify-center gap-[8px] transition-colors shadow-sm"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link 
            href="/dashboard"
            className="h-[40px] px-[24px] rounded bg-primary text-on-primary text-label-caps flex items-center justify-center gap-[8px] hover:bg-primary/90 transition-opacity shadow-sm"
          >
            <Home size={18} /> Dashboard
          </Link>
        </div>
      </div>
      
      {/* Footer Support */}
      <div className="mt-[32px] text-body-sm text-on-surface-variant">
        Need assistance? <Link href="#" className="text-primary hover:underline font-semibold">Contact IT Support</Link>
      </div>
    </div>
  );
}
