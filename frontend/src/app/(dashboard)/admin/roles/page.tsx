"use client";

import { Check, Download, Info, Minus, Plus, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AdminService } from "@/services/adminService";

export default function RolesPermissionsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [roles, setRoles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rolesData, permsData] = await Promise.all([
          AdminService.getRoles(),
          AdminService.getPermissions()
        ]);
        setRoles(rolesData);
        setPermissions(permsData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const togglePermission = (roleId: string, permId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const hasPerm = role.permissions.includes(permId);
        return {
          ...role,
          permissions: hasPerm 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? role.permissions.filter((p: any) => p !== permId)
            : [...role.permissions, permId]
        };
      }
      return role;
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categories = Array.from(new Set(permissions.map((p: any) => p.category)));
  return (
    <div className="flex-1 overflow-y-auto p-[24px] lg:p-[40px]">
      <div className="max-w-[1440px] mx-auto space-y-[24px]">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] pb-[16px] border-b border-outline-variant">
          <div>
            <h2 className="text-display-lg text-on-surface">Roles & Permissions</h2>
            <p className="text-body-md text-on-surface-variant mt-[4px]">Manage access control matrix across the organization.</p>
          </div>
          <div className="flex items-center gap-[8px]">
            <button className="h-[36px] px-[16px] flex items-center gap-[8px] bg-surface-container-lowest border border-outline-variant text-on-surface rounded hover:bg-surface-container-low transition-colors text-body-sm font-semibold">
              <Download size={18} /> Export Matrix
            </button>
            <button className="h-[36px] px-[16px] flex items-center gap-[8px] bg-primary text-on-primary rounded hover:bg-primary/90 transition-colors text-body-sm font-semibold shadow-sm">
              <Plus size={18} /> New Role
            </button>
          </div>
        </div>
        
        {/* Matrix Table Container */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center text-on-surface-variant">Loading matrix...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-[16px] px-[24px] text-label-caps text-on-surface-variant uppercase tracking-wider sticky left-0 bg-surface-container-low z-10 w-1/4 min-w-[200px]">
                      Permission / Resource
                    </th>
                    {roles.map(role => (
                      <th key={role.id} className="py-[16px] px-[16px] text-title-sm text-center border-l border-outline-variant bg-surface-container-low">
                        <div className="flex flex-col items-center gap-[4px]">
                          <ShieldCheck className="text-on-surface-variant" />
                          <span>{role.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-sm">
                  {categories.map(category => (
                    <React.Fragment key={category}>
                      <tr className="bg-surface-bright">
                        <td className="py-[8px] px-[24px] text-label-caps text-on-surface-variant bg-surface-container-lowest sticky left-0 z-10 uppercase tracking-wider text-primary border-l-4 border-primary" colSpan={roles.length + 1}>
                          {category}
                        </td>
                      </tr>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {permissions.filter((p: any) => p.category === category).map(perm => (
                        <tr key={perm.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="py-[8px] px-[24px] text-body-md text-on-surface font-medium sticky left-0 bg-surface-container-lowest z-10 pl-[32px]">
                            {perm.name}
                            <div className="text-body-sm text-on-surface-variant font-normal">{perm.description}</div>
                          </td>
                          {roles.map(role => {
                            const hasPerm = role.permissions.includes(perm.id);
                            return (
                              <td 
                                key={role.id} 
                                className="py-[8px] px-[16px] text-center border-l border-outline-variant cursor-pointer hover:bg-surface-container-low transition-colors"
                                onClick={() => togglePermission(role.id, perm.id)}
                              >
                                {hasPerm ? (
                                  <Check className="text-primary mx-auto" />
                                ) : (
                                  <Minus className="text-on-surface-variant opacity-30 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="bg-surface-container-low p-[8px] px-[24px] border-t border-outline-variant flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Showing {permissions.length} permissions across {roles.length} roles.</span>
            <div className="flex items-center gap-[4px]">
              <Info size={16} />
              <span>Changes to matrix require secondary electronic signature.</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
