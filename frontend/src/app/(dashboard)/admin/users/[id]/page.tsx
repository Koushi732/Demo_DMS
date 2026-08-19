"use client";

import { useEffect, useState } from "react";
import { Badge as BadgeIcon, Building, Building2, Check, CheckCircle, ChevronRight, Edit, FileEdit, Filter, History, Key, KeyRound, LayoutGrid, MessageSquare, Shield, Upload, Users, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminService, User } from "@/services/adminService";

export default function AdminUserProfilePage() {
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const users = await AdminService.getUsers();
        const found = users.find(u => u.id === userId);
        if (found) setUser(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (userId) load();
  }, [userId]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="flex-1 overflow-y-auto p-[24px] bg-surface">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-[24px]">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-[8px] border-b border-outline-variant gap-[16px]">
          <div>
            <div className="flex items-center gap-[8px] mb-[4px] flex-wrap">
              <Link href="/admin" className="text-body-sm text-on-surface-variant hover:text-primary">Administration</Link>
              <ChevronRight size={16} className="text-on-surface-variant" />
              <Link href="/admin/users" className="text-body-sm text-on-surface-variant hover:text-primary">Users</Link>
              <ChevronRight size={16} className="text-on-surface-variant" />
              <span className="text-body-sm text-on-surface font-semibold">User Details</span>
            </div>
            <h1 className="text-headline-md text-primary">{user.first_name} {user.last_name}</h1>
          </div>
          <div className="flex gap-[8px]">
            <button className="px-[16px] py-[8px] border border-outline-variant rounded text-body-sm font-semibold text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex items-center gap-[4px]">
              <Edit size={18} /> Edit Profile
            </button>
            <button className="px-[16px] py-[8px] rounded text-body-sm font-semibold text-on-primary bg-primary hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-[4px] shadow-sm">
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
                <div className="w-32 h-32 rounded-full border-4 border-surface shadow-sm bg-secondary-container flex items-center justify-center text-display-lg text-on-secondary-container">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
                {user.is_active && (
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-surface-container-lowest rounded-full flex items-center justify-center" title="Active">
                  </div>
                )}
              </div>
              <h2 className="text-title-sm text-primary mb-[4px]">{user.first_name} {user.last_name}</h2>
              <p className="text-body-sm text-on-surface-variant mb-[16px]">{user.email}</p>
              
              <div className="flex gap-[8px] mb-[24px]">
                {user.is_active ? (
                  <span className="px-[8px] py-[4px] bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 text-label-caps flex items-center gap-[4px]">
                    <CheckCircle size={14} /> ACTIVE
                  </span>
                ) : (
                  <span className="px-[8px] py-[4px] bg-surface-container-low text-on-surface-variant border-l-2 border-outline-variant text-label-caps flex items-center gap-[4px]">
                    <X size={14} /> INACTIVE
                  </span>
                )}
                <span className="px-[8px] py-[4px] bg-surface-container-low text-on-surface-variant border-l-2 border-outline-variant text-label-caps flex items-center gap-[4px]">
                  <BadgeIcon style={{fontSize: 14}} /> {user.id.substring(0,8)}
                </span>
              </div>
              
              <div className="w-full text-left space-y-[16px]">
                <div>
                  <div className="text-label-caps text-on-surface-variant mb-[4px]">Department</div>
                  <div className="text-body-md text-on-surface flex items-center gap-[4px]">
                    <Building2 size={18} className="text-primary-container" /> {user.department?.name || 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-label-caps text-on-surface-variant mb-[4px]">Position</div>
                  <div className="text-body-md text-on-surface">{user.position}</div>
                </div>
                <div>
                  <div className="text-label-caps text-on-surface-variant mb-[4px]">DMS Role</div>
                  <div className="text-body-md text-on-surface font-semibold">{user.roles.length > 0 ? user.roles[0].name : 'None'}</div>
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
                  <Shield className="text-primary-container" /> System Permissions
                </h3>
                <button className="text-body-sm text-primary font-semibold hover:underline">Manage Roles</button>
              </div>
              <div className="p-[16px] overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-bright">
                      <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant">Module</th>
                      <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant text-center">View</th>
                      <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant text-center">Create</th>
                      <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant text-center">Approve</th>
                      <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant text-center">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm text-on-surface">
                    <tr className="border-b border-surface-variant">
                      <td className="py-[8px] px-[16px] font-semibold">Standard Operating Procedures (SOPs)</td>
                      <td className="py-[8px] px-[16px] text-center"><Check className="text-emerald-600" /></td>
                      <td className="py-[8px] px-[16px] text-center"><Check className="text-emerald-600" /></td>
                      <td className="py-[8px] px-[16px] text-center"><Check className="text-emerald-600" /></td>
                      <td className="py-[8px] px-[16px] text-center"><X className="text-outline-variant" /></td>
                    </tr>
                    <tr>
                      <td className="py-[8px] px-[16px] font-semibold">System Administration</td>
                      <td className="py-[8px] px-[16px] text-center"><X className="text-outline-variant" /></td>
                      <td className="py-[8px] px-[16px] text-center"><X className="text-outline-variant" /></td>
                      <td className="py-[8px] px-[16px] text-center"><X className="text-outline-variant" /></td>
                      <td className="py-[8px] px-[16px] text-center"><X className="text-outline-variant" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}
