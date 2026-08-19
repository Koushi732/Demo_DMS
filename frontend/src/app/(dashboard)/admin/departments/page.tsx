"use client";

import { useEffect, useState } from "react";
import { Badge as BadgeIcon, Plus } from "lucide-react";
import { AdminService, Department, User } from "@/services/adminService";

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [depts, allUsers] = await Promise.all([
          AdminService.getDepartments(),
          AdminService.getUsers()
        ]);
        setDepartments(depts);
        setUsers(allUsers);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-[24px] bg-surface">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] mb-[24px]">
          <div>
            <h2 className="text-headline-md text-on-surface">Department Management</h2>
            <p className="text-body-sm text-on-surface-variant mt-[4px]">Manage organizational units, oversight assignments, and compliance metrics.</p>
          </div>
          <button className="bg-primary text-on-primary hover:bg-inverse-surface transition-colors flex items-center gap-[4px] px-[16px] py-[10px] rounded text-label-caps shadow-sm shrink-0">
            <Plus size={18} />
            ADD DEPARTMENT
          </button>
        </div>
        
        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          
          {loading ? (
            <div className="p-4 text-on-surface-variant">Loading departments...</div>
          ) : departments.length === 0 ? (
            <div className="p-4 text-on-surface-variant">No departments found.</div>
          ) : departments.map((dept) => {
            const head = users.find(u => u.id === dept.head_user_id);
            return (
              <div key={dept.id} className={`bg-surface-container-lowest border border-outline-variant rounded-lg p-[16px] flex flex-col hover:border-primary transition-colors relative overflow-hidden group shadow-sm`}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-[16px]">
                  <div>
                    <h3 className={`text-title-sm text-primary`}>{dept.name}</h3>
                    <p className="text-body-sm text-on-surface-variant flex items-center gap-[4px] mt-[2px]">
                      <BadgeIcon style={{fontSize: 14}} />
                      {head ? `${head.first_name} ${head.last_name}` : "Unassigned"}
                    </p>
                  </div>
                  <span className="text-label-caps bg-secondary-container text-on-secondary-container px-[8px] py-[2px] rounded border-l-2 border-secondary">ACTIVE</span>
                </div>
                <div className="grid grid-cols-3 gap-[8px] mt-auto pt-[16px] border-t border-surface-variant">
                  <div className="flex flex-col">
                    <span className="text-label-caps text-on-surface-variant uppercase tracking-wider">Users</span>
                    <span className={`font-code-data mt-[2px] text-on-surface`}>{users.filter(u => u.department?.id === dept.id).length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-label-caps text-on-surface-variant uppercase tracking-wider">Docs</span>
                    <span className={`font-code-data mt-[2px] text-on-surface`}>-</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-label-caps text-on-surface-variant uppercase tracking-wider">Pending</span>
                    <span className={`font-code-data mt-[2px] text-on-surface`}>0</span>
                  </div>
                </div>
              </div>
            );
          })}
          
        </div>
      </div>
    </div>
  );
}
