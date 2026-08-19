"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Save } from "lucide-react";
import { AdminService } from "@/services/adminService";
import { DemoSystemSettings } from "@/data/demo";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<DemoSystemSettings | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await AdminService.getSystemSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await AdminService.updateSystemSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-[24px] lg:p-[40px] bg-background">
      <div className="max-w-container-max mx-auto">
        
        {/* Page Header */}
        <div className="mb-[24px]">
          <h1 className="text-display-lg text-on-surface">System Settings</h1>
          <p className="text-body-md text-on-surface-variant mt-[4px]">Manage global configuration for the Aureon Document Control ecosystem.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-[40px]">
          
          {/* Settings Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[4px] sticky top-[40px] shadow-sm">
              <button className="w-full text-left px-[16px] py-[8px] rounded-lg bg-surface-container-low text-title-sm text-on-surface flex items-center justify-between mb-[4px]">
                <span>General</span>
                <ChevronRight size={18} />
              </button>
              <button className="w-full text-left px-[16px] py-[8px] rounded-lg hover:bg-surface-container-low text-title-sm text-on-surface-variant flex items-center justify-between mb-[4px] transition-colors">
                <span>Security</span>
                <ChevronRight size={18} className="opacity-0 group-hover:opacity-100" />
              </button>
              <button className="w-full text-left px-[16px] py-[8px] rounded-lg hover:bg-surface-container-low text-title-sm text-on-surface-variant flex items-center justify-between mb-[4px] transition-colors">
                <span>Document Defaults</span>
                <ChevronRight size={18} className="opacity-0" />
              </button>
              <button className="w-full text-left px-[16px] py-[8px] rounded-lg hover:bg-surface-container-low text-title-sm text-on-surface-variant flex items-center justify-between transition-colors">
                <span>AI Configuration</span>
                <ChevronRight size={18} className="opacity-0" />
              </button>
            </div>
          </div>
          
          {/* Settings Canvas */}
          <div className="flex-1 space-y-[24px]">
            
            {/* General Settings Panel */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-[24px] shadow-sm">
              <h2 className="text-title-sm text-on-surface border-b border-outline-variant pb-[8px] mb-[24px]">General Configuration</h2>
              
              {isLoading ? (
                <div className="py-8 text-center text-on-surface-variant">Loading settings...</div>
              ) : settings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  
                  {/* Org Name */}
                  <div>
                    <label className="block text-label-caps text-on-surface-variant mb-[4px]">Organization Name</label>
                    <input 
                      className="h-[36px] w-full bg-surface-container-lowest border border-outline-variant rounded px-[16px] text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                      type="text" 
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                    />
                  </div>
                  
                  {/* Environment */}
                  <div>
                    <label className="block text-label-caps text-on-surface-variant mb-[4px]">System URL</label>
                    <input 
                      className="h-[36px] w-full bg-surface-container-lowest border border-outline-variant rounded px-[16px] text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                      type="text" 
                      value={settings.systemUrl}
                      onChange={(e) => setSettings({...settings, systemUrl: e.target.value})}
                    />
                  </div>
                  
                  {/* Support Email */}
                  <div>
                    <label className="block text-label-caps text-on-surface-variant mb-[4px]">Support Email</label>
                    <input 
                      className="h-[36px] w-full bg-surface-container-lowest border border-outline-variant rounded px-[16px] text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                      type="email" 
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                    />
                  </div>

                  {/* Logo */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-label-caps text-on-surface-variant mb-[4px]">System Logo</label>
                    <div className="flex items-center gap-[16px] mt-[8px]">
                      <div className="w-16 h-16 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center overflow-hidden">
                        <span className="text-title-sm text-on-surface-variant">Logo</span>
                      </div>
                      <div className="flex flex-col gap-[8px]">
                        <button className="h-[36px] bg-surface-container-lowest border border-outline-variant text-on-surface px-[24px] rounded text-label-caps hover:bg-surface-container-low transition-colors w-fit text-xs">
                          Upload New
                        </button>
                        <span className="text-body-sm text-on-surface-variant">Recommended size: 256x256px (PNG or SVG)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Maintenance Mode */}
                  <div className="col-span-1 md:col-span-2 border-t border-outline-variant pt-[16px] mt-[8px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-title-sm text-on-surface">Maintenance Mode</h3>
                        <p className="text-body-sm text-on-surface-variant">Restrict access to system administrators only.</p>
                      </div>
                      <button 
                        aria-checked={maintenanceMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${maintenanceMode ? 'bg-primary' : 'bg-outline-variant'}`}
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        role="switch" 
                        type="button"
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-on-primary transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
                      </button>
                    </div>
                  </div>
                  
                </div>
              ) : null}
            </section>
            
            {/* System Information Footer */}
            <section className="bg-surface-container-low border border-outline-variant rounded-xl p-[16px] flex flex-wrap gap-[24px] justify-between items-center shadow-sm">
              <div>
                <span className="block text-label-caps text-on-surface-variant">System Version</span>
                <span className="font-code-data text-on-surface">v2024.1.4-build.889</span>
              </div>
              <div>
                <span className="block text-label-caps text-on-surface-variant">Database Status</span>
                <span className="text-body-sm text-on-surface flex items-center gap-[4px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected
                </span>
              </div>
              <div>
                <span className="block text-label-caps text-on-surface-variant">Last Backup</span>
                <span className="text-body-sm text-on-surface">Today, 03:00 AM UTC</span>
              </div>
              <div className="w-full md:w-auto flex justify-end items-center gap-[16px] pt-[8px] md:pt-0 border-t border-outline-variant md:border-t-0">
                {saveSuccess && (
                  <span className="text-emerald-600 text-body-sm flex items-center gap-1">
                    <Save size={16} /> Saved Successfully
                  </span>
                )}
                <button className="h-[36px] bg-surface-container-lowest border border-outline-variant text-on-surface px-[24px] rounded text-label-caps hover:bg-surface-container-low transition-colors shadow-sm disabled:opacity-50">
                  Discard Changes
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isLoading || isSaving}
                  className="h-[36px] bg-primary text-on-primary px-[24px] rounded text-label-caps hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </section>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
