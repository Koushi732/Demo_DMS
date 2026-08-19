export interface DemoSystemSettings {
  companyName: string;
  systemUrl: string;
  supportEmail: string;
  defaultTimezone: string;
  sessionTimeoutMinutes: number;
  require2FA: boolean;
  passwordExpiryDays: number;
  auditRetentionYears: number;
  watermarkEnabled: boolean;
  watermarkText: string;
}

export const DEMO_SYSTEM_SETTINGS: DemoSystemSettings = {
  companyName: "Aureon Pharmaceuticals",
  systemUrl: "https://dms.aureonpharma.com",
  supportEmail: "support@aureonpharma.com",
  defaultTimezone: "UTC",
  sessionTimeoutMinutes: 30,
  require2FA: true,
  passwordExpiryDays: 90,
  auditRetentionYears: 10,
  watermarkEnabled: true,
  watermarkText: "CONFIDENTIAL - AUREON PHARMA",
};
