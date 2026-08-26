"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit, Filter, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { AdminService, User } from "@/services/adminService";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", position: "", departmentId: ""
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      alert("User invited successfully! (Mock)");
      setIsModalOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", position: "", departmentId: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background p-[24px] sm:p-[40px]">
      <div className="max-w-[1440px] mx-auto space-y-[24px]">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-[16px]">
          <div>
            <h2 className="text-display-lg text-on-surface">User Management</h2>
            <p className="text-body-md text-on-surface-variant mt-[8px]">Manage system access, roles, and department assignments for Aureon personnel.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="h-9 px-[16px] bg-primary text-on-primary rounded text-title-sm flex items-center gap-[8px] hover:bg-primary/90 transition-colors">
            <UserPlus size={18} />
            Add User
          </button>
        </div>
        
        {/* Controls & Filters */}
        <div className="flex flex-col sm:flex-row gap-[16px] items-center justify-between bg-surface-container-lowest p-[16px] border border-outline-variant rounded-lg shadow-sm">
          <div className="flex items-center gap-[16px] w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80 flex items-center">
              <Search className="absolute left-[8px] text-on-surface-variant" style={{fontSize: 20}} />
              <input 
                type="text" 
                placeholder="Search by name, ID, or email..." 
                className="w-full h-9 pl-[36px] pr-[8px] bg-surface text-on-surface border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 text-body-sm transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-[8px] w-full sm:w-auto">
            <select className="h-9 px-[8px] bg-surface border border-outline-variant rounded text-body-sm text-on-surface focus:outline-none focus:border-primary">
              <option>All Departments</option>
              <option>Quality Assurance</option>
              <option>Production</option>
              <option>IT</option>
            </select>
            <select className="h-9 px-[8px] bg-surface border border-outline-variant rounded text-body-sm text-on-surface focus:outline-none focus:border-primary">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="h-9 px-[8px] border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center justify-center bg-surface-container-lowest">
              <Filter size={20} />
            </button>
          </div>
        </div>
        
        {/* Enterprise Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low sticky top-0 z-10 border-b border-outline-variant">
              <tr>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Name</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Employee ID</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Department</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Position</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">DMS Role</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Status</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant whitespace-nowrap">Email</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-[16px] text-center text-on-surface-variant">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-[16px] text-center text-on-surface-variant">No users found.</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-surface transition-colors group">
                  <td className="py-[12px] px-[16px]">
                    <Link href={`/admin/users/${user.id}`} className="flex items-center gap-[8px] group-hover:text-primary transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-title-sm ${
                        user.is_active 
                          ? "bg-secondary-container text-on-secondary-container" 
                          : "bg-surface-variant text-on-surface-variant opacity-60"
                      }`}>
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <div className={`text-title-sm text-on-surface transition-all ${
                        user.is_active ? "group-hover:text-primary" : "opacity-60 group-hover:text-primary group-hover:opacity-100"
                      }`}>
                        {user.first_name} {user.last_name}
                      </div>
                    </Link>
                  </td>
                  <td className={`py-[12px] px-[16px] font-code-data text-on-surface-variant ${!user.is_active && "opacity-60"}`}>
                    {user.id.substring(0,8)}
                  </td>
                  <td className={`py-[12px] px-[16px] text-body-sm text-on-surface ${!user.is_active && "opacity-60"}`}>
                    {user.department?.name || 'None'}
                  </td>
                  <td className={`py-[12px] px-[16px] text-body-sm text-on-surface ${!user.is_active && "opacity-60"}`}>
                    {user.position}
                  </td>
                  <td className={`py-[12px] px-[16px] text-body-sm text-on-surface ${!user.is_active && "opacity-60"}`}>
                    {user.roles.length > 0 ? user.roles[0].name : 'None'}
                  </td>
                  <td className="py-[12px] px-[16px]">
                    {user.is_active ? (
                      <span className="inline-flex items-center px-[8px] py-[2px] rounded-sm text-label-caps bg-primary/10 text-primary border-l-2 border-primary">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-[8px] py-[2px] rounded-sm text-label-caps bg-outline-variant/20 text-on-surface-variant border-l-2 border-outline-variant">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className={`py-[12px] px-[16px] text-body-sm text-on-surface-variant ${!user.is_active && "opacity-60"}`}>
                    {user.email}
                  </td>
                  <td className={`py-[12px] px-[16px] text-right transition-opacity ${!user.is_active && "opacity-60 group-hover:opacity-100"}`}>
                    <button className="p-[4px] text-on-surface-variant hover:text-primary transition-colors">
                      <Edit size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              
            </tbody>
          </table>
          
          {/* Table Footer / Pagination */}
          <div className="p-[8px] border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
            <span className="text-body-sm text-on-surface-variant ml-[8px]">Showing {users.length} users</span>
            <div className="flex items-center gap-[4px]">
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary text-body-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50" disabled>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest rounded-lg shadow-lg w-full max-w-md flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-lg font-semibold text-on-surface">Add User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col p-6 gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-label-caps text-on-surface-variant mb-1">First Name *</label>
                  <input required type="text" className="w-full h-10 px-3 rounded border border-outline-variant bg-surface" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="block text-label-caps text-on-surface-variant mb-1">Last Name *</label>
                  <input required type="text" className="w-full h-10 px-3 rounded border border-outline-variant bg-surface" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-1">Email *</label>
                <input required type="email" className="w-full h-10 px-3 rounded border border-outline-variant bg-surface" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded text-body-sm text-on-surface hover:bg-surface-container-low transition-colors border border-outline-variant">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded text-body-sm text-on-primary bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isSubmitting ? "Inviting..." : "Invite User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
