"use client";

import { useEffect, useState } from "react";
import { Shield, Mail, Building2, Briefcase, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push("/login");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to load profile data");
        }

        const data = await res.json();
        setProfile(data.data); // data is { status: "success", data: user }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  if (loading) {
    return <div className="p-[24px] text-body-md text-on-surface-variant">Loading profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="p-[24px] text-body-md text-error bg-error-container border border-error rounded-[8px] m-[24px]">
        {error || "Failed to load profile"}
      </div>
    );
  }

  // Use JWT claims or API response depending on what's available
  const email = profile.email || "No email";
  const firstName = profile.user_metadata?.first_name || "User";
  const lastName = profile.user_metadata?.last_name || "";
  const initial = firstName.charAt(0);

  return (
    <div className="space-y-[24px]">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-[16px]">
        <div>
          <h1 className="text-display-lg text-on-surface">Your Profile</h1>
          <p className="text-body-md text-on-surface-variant mt-[4px]">
            Manage your personal information and application preferences.
          </p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {/* Left Column: Avatar & Summary */}
        <div className="col-span-1 space-y-[24px]">
          <div className="card-level-1 p-[24px] flex flex-col items-center text-center rounded-[8px]">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-display-lg text-on-primary font-bold mb-[16px]">
              {initial}
            </div>
            <h2 className="text-headline-md text-on-surface">{firstName} {lastName}</h2>
            <p className="text-body-md text-on-surface-variant mb-[16px]">
              {profile.position || "Position Unassigned"}
            </p>
            <div className="w-full flex items-center gap-[8px] bg-surface-container-low p-[12px] rounded-[4px] text-left">
              <Shield size={20} className="text-primary shrink-0" />
              <div>
                <p className="text-label-caps text-on-surface-variant">DMS ROLE</p>
                <p className="text-body-sm text-on-surface font-medium">Assigned by Organization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="col-span-1 lg:col-span-2 space-y-[24px]">
          
          {/* Personal Information */}
          <div className="card-level-1 rounded-[8px] overflow-hidden">
            <div className="px-[24px] py-[16px] border-b border-outline-variant bg-surface-bright">
              <h3 className="text-title-sm text-on-surface">Personal Information</h3>
            </div>
            <div className="p-[24px] grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              <FormField label="FIRST NAME" defaultValue={firstName} />
              <FormField label="LAST NAME" defaultValue={lastName} />
              <div className="md:col-span-2">
                <FormField 
                  label="EMAIL ADDRESS" 
                  type="email" 
                  defaultValue={email} 
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Organizational Info */}
          <div className="card-level-1 rounded-[8px] overflow-hidden">
            <div className="px-[24px] py-[16px] border-b border-outline-variant bg-surface-bright">
              <h3 className="text-title-sm text-on-surface">Organization</h3>
            </div>
            <div className="p-[24px] grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              <div className="flex flex-col gap-[8px]">
                <label className="text-label-caps text-on-surface-variant">DEPARTMENT</label>
                <div className="flex items-center gap-[12px] h-[36px] px-[12px] bg-surface-container-low border border-outline-variant rounded-[4px]">
                  <Building2 size={16} className="text-on-surface-variant" />
                  <span className="text-body-sm text-on-surface">Quality Assurance (QA)</span>
                </div>
              </div>
              <div className="flex flex-col gap-[8px]">
                <label className="text-label-caps text-on-surface-variant">POSITION</label>
                <div className="flex items-center gap-[12px] h-[36px] px-[12px] bg-surface-container-low border border-outline-variant rounded-[4px]">
                  <Briefcase size={16} className="text-on-surface-variant" />
                  <span className="text-body-sm text-on-surface">QA Manager</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Preferences */}
          <div className="card-level-1 rounded-[8px] overflow-hidden">
            <div className="px-[24px] py-[16px] border-b border-outline-variant bg-surface-bright">
              <h3 className="text-title-sm text-on-surface">Security & Preferences</h3>
            </div>
            <div className="p-[24px] space-y-[24px]">
              <div className="flex items-center justify-between py-[12px] border-b border-outline-variant">
                <div className="flex items-center gap-[12px]">
                  <Lock size={20} className="text-on-surface-variant" />
                  <div>
                    <p className="text-body-md font-medium text-on-surface">Password</p>
                    <p className="text-body-sm text-on-surface-variant">Last changed 45 days ago</p>
                  </div>
                </div>
                <Button variant="outline">Update</Button>
              </div>
              <div className="flex items-center justify-between py-[12px]">
                <div className="flex items-center gap-[12px]">
                  <Bell size={20} className="text-on-surface-variant" />
                  <div>
                    <p className="text-body-md font-medium text-on-surface">Email Notifications</p>
                    <p className="text-body-sm text-on-surface-variant">Workflow assignments and periodic reviews</p>
                  </div>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
