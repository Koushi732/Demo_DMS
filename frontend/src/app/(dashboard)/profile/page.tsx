"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Badge, Building, Building2, Check, CheckCircle, ChevronRight, Edit, FileEdit, Filter, FolderOpen, History, Key, KeyRound, LayoutGrid, MessageSquare, Shield, Upload, X } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export default function CurrentUserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch from public.users
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (data) {
          setProfile(data as UserProfile);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-error">Failed to load profile. Please sign in again.</div>;
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;

  return (
    <div className="flex-1 overflow-y-auto p-[24px] bg-surface">
      <div className="max-w-container-max mx-auto flex flex-col gap-[24px]">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-[16px] border-b border-outline-variant gap-[16px]">
          <div>
            <div className="flex items-center gap-[8px] mb-[4px]">
              <span className="text-body-sm text-on-surface font-semibold">User Details</span>
            </div>
            <h1 className="text-headline-md text-primary">{fullName}</h1>
          </div>
          <div className="flex gap-[8px]">
            <button onClick={() => {
              setFirstName(profile.first_name);
              setLastName(profile.last_name);
              setPosition(profile.position || "");
              setIsEditingProfile(true);
            }} className="px-[16px] py-[8px] border border-outline-variant rounded text-body-sm font-semibold text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex items-center gap-[4px] shadow-sm">
              <Edit size={18} /> Edit Profile
            </button>
            <button onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setIsChangingPassword(true);
            }} className="px-[16px] py-[8px] rounded text-body-sm font-semibold text-on-primary bg-primary hover:bg-primary/90 transition-colors flex items-center gap-[4px] shadow-sm">
              <KeyRound size={18} /> Reset Password
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-[24px]">
          
          {/* Left Column: Identity & Primary Info */}
          <div className="xl:col-span-1 flex flex-col gap-[24px]">
            
            {/* Identity Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-[24px] flex flex-col items-center text-center shadow-sm">
              <div className="relative mb-[16px]">
                <div className="w-32 h-32 rounded-full border-4 border-surface bg-primary-container text-on-primary-container flex items-center justify-center text-display-md shadow-sm">
                  {profile.first_name[0]}{profile.last_name[0]}
                </div>
                {profile.is_active && (
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-surface-container-lowest rounded-full flex items-center justify-center" title="Active"></div>
                )}
              </div>
              <h2 className="text-title-sm text-primary mb-[4px]">{fullName}</h2>
              <p className="text-body-sm text-on-surface-variant mb-[16px]">{profile.email}</p>
              
              <div className="flex gap-[8px] mb-[24px]">
                {profile.is_active ? (
                  <span className="px-[8px] py-[4px] bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 text-label-caps flex items-center gap-[4px] rounded-r">
                    <CheckCircle size={14} /> ACTIVE
                  </span>
                ) : (
                  <span className="px-[8px] py-[4px] bg-error-container text-error border-l-2 border-error text-label-caps flex items-center gap-[4px] rounded-r">
                    <X size={14} /> INACTIVE
                  </span>
                )}
              </div>
              
              <div className="w-full text-left space-y-[16px]">
                <div>
                  <div className="text-label-caps text-on-surface-variant mb-[4px]">Department</div>
                  <div className="text-body-md text-on-surface flex items-center gap-[4px]">
                    <Building2 size={18} className="text-primary" /> Information Technology
                  </div>
                </div>
                <div>
                  <div className="text-label-caps text-on-surface-variant mb-[4px]">Position</div>
                  <div className="text-body-md text-on-surface">{profile.position || 'Not specified'}</div>
                </div>
              </div>
            </div>
            
            {/* System Meta */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-[24px] shadow-sm">
              <h3 className="text-title-sm text-primary mb-[16px] border-b border-outline-variant pb-[8px]">Account Information</h3>
              <div className="space-y-[8px]">
                <div className="flex justify-between items-center py-[4px] border-b border-surface-variant border-dashed last:border-0">
                  <span className="text-body-sm text-on-surface-variant">Last Login</span>
                  <span className="font-code-data text-on-surface">
                    {profile.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-[4px] border-b border-surface-variant border-dashed last:border-0">
                  <span className="text-body-sm text-on-surface-variant">Account Created</span>
                  <span className="font-code-data text-on-surface">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-[4px] border-b border-surface-variant border-dashed last:border-0">
                  <span className="text-body-sm text-on-surface-variant">Auth Method</span>
                  <span className="text-body-sm text-on-surface flex items-center gap-[4px]"><Key size={16} /> Supabase Auth</span>
                </div>
              </div>
            </div>
            
          </div>
          
          {/* Right Column: Permissions, Scope & Activity */}
          <div className="xl:col-span-2 flex flex-col gap-[24px]">
            
            {/* System Permissions Matrix */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col shadow-sm">
              <div className="p-[16px] border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h3 className="text-title-sm text-primary flex items-center gap-[8px]">
                  <Shield className="text-primary" /> System Permissions
                </h3>
              </div>
              <div className="p-[16px] text-body-sm text-on-surface-variant">
                Permissions are fully controlled by Role-Based Access Control (RBAC). 
                As a Master Administrator, all permissions are granted.
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-scrim/50 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-md border border-outline-variant flex flex-col">
            <div className="p-[16px] border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl">
              <h3 className="text-title-md text-on-surface">Edit Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-[24px] space-y-[16px]">
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">First Name</label>
                <input type="text" className="w-full px-[12px] py-[8px] border border-outline-variant rounded bg-surface text-on-surface focus:outline-primary" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">Last Name</label>
                <input type="text" className="w-full px-[12px] py-[8px] border border-outline-variant rounded bg-surface text-on-surface focus:outline-primary" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">Position</label>
                <input type="text" className="w-full px-[12px] py-[8px] border border-outline-variant rounded bg-surface text-on-surface focus:outline-primary" value={position} onChange={e => setPosition(e.target.value)} />
              </div>
            </div>
            <div className="p-[16px] border-t border-outline-variant flex justify-end gap-[8px]">
              <button onClick={() => setIsEditingProfile(false)} className="px-[16px] py-[8px] rounded border border-outline-variant bg-surface text-on-surface font-medium hover:bg-surface-container-lowest">Cancel</button>
              <button onClick={async () => {
                try {
                  await apiClient.put('/auth/profile', { first_name: firstName, last_name: lastName, position: position });
                  alert('Profile updated! Refresh to see changes.');
                  setIsEditingProfile(false);
                } catch(e) { console.error(e); alert('Error updating profile'); }
              }} className="px-[16px] py-[8px] rounded bg-primary text-on-primary font-medium hover:bg-primary/90">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-scrim/50 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-md border border-outline-variant flex flex-col">
            <div className="p-[16px] border-b border-outline-variant flex justify-between items-center bg-surface-container-low rounded-t-xl">
              <h3 className="text-title-md text-on-surface">Change Password</h3>
              <button onClick={() => setIsChangingPassword(false)} className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-[24px] space-y-[16px]">
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">Current Password</label>
                <input type="password" className="w-full px-[12px] py-[8px] border border-outline-variant rounded bg-surface text-on-surface focus:outline-primary" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">New Password</label>
                <input type="password" className="w-full px-[12px] py-[8px] border border-outline-variant rounded bg-surface text-on-surface focus:outline-primary" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[4px]">Confirm New Password</label>
                <input type="password" className="w-full px-[12px] py-[8px] border border-outline-variant rounded bg-surface text-on-surface focus:outline-primary" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <div className="p-[16px] border-t border-outline-variant flex justify-end gap-[8px]">
              <button onClick={() => setIsChangingPassword(false)} className="px-[16px] py-[8px] rounded border border-outline-variant bg-surface text-on-surface font-medium hover:bg-surface-container-lowest">Cancel</button>
              <button onClick={async () => {
                if (newPassword !== confirmPassword) return alert("Passwords don't match");
                try {
                  await apiClient.post('/auth/password', { current_password: currentPassword, new_password: newPassword });
                  alert('Password successfully updated!');
                  setIsChangingPassword(false);
                } catch(e) { console.error(e); alert('Error updating password'); }
              }} className="px-[16px] py-[8px] rounded bg-primary text-on-primary font-medium hover:bg-primary/90">Update Password</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
