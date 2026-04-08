"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Image from "next/image";
import {
  User,
  Bell,
  CreditCard,
  Shield,
  LogOut,
  BadgeCheck,
  Lock,
  CheckCircle,
  ChevronDown,
  Camera,
  Trash2,
  GraduationCap,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type NotificationSettings = {
  email_notifications: boolean;
  gig_updates: boolean;
  message_notifications: boolean;
  marketing_emails: boolean;
};

type PrivacySettings = {
  profile_visibility: boolean;
  show_email: boolean;
};

type PaymentItem = {
  id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
  completed_at?: string | null;
  booking_id: string;
};

const AVATARS_BUCKET = "Avatars";

export default function Settings() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [storedFileName, setStoredFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [campusEmail, setCampusEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    gig_updates: true,
    message_notifications: true,
    marketing_emails: false,
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: true,
    show_email: false,
  });
  const [activeTab, setActiveTab] = useState("account");
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const institutions = [
    "University of Nairobi (UoN)",
    "Mount Kenya University",
    "Pwani University",
    "Kenyatta University",
    "Strathmore University",
    "Jomo Kenyatta University",
    "Technical University of Kenya",
    "Maseno University",
    "Egerton University",
    "Moi University",
  ];

  const getAvatarUrl = (filePath: string | null): string | null => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${AVATARS_BUCKET}/${filePath}`;
  };

  // Load user data via API
  useEffect(() => {
    async function loadUserData() {
      if (!user?.id) return;

      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to load profile");

        const data = await res.json();
        console.log("Loaded profile:", data);

        setDisplayName(data.name || "");
        setEmail(data.email || "");
        setInstitution(data.institution || "");
        setStoredFileName(data.profile_pic);
        setProfilePic(getAvatarUrl(data.profile_pic));
        setCampusEmail(data.campus_email || "");
        setIsVerified(data.campus_verified || false);
        if (data.notification_settings) {
          setNotifications(data.notification_settings);
        }
        if (data.privacy_settings) {
          setPrivacy(data.privacy_settings);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        showMessage("error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user?.id]);

  useEffect(() => {
    async function loadPayments() {
      if (!user?.id) return;

      try {
        const res = await fetch("/api/payments");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load payments");
        setPayments(data.payments || []);
      } catch (error) {
        console.error("Payment history load failed:", error);
      }
    }

    loadPayments();
  }, [user?.id]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
  };

  // Upload via API route
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please select an image file");
      return;
    }
    if (file.size > 800 * 1024) {
      showMessage("error", "File size must be less than 800KB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      console.log("Upload success:", data);

      setStoredFileName(data.filePath);
      setProfilePic(data.publicUrl);
      showMessage("success", "Profile picture updated successfully");
    } catch (error: unknown) {
      console.error("Upload error:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setUploading(false);
    }
  };

  // Remove avatar
  const removeProfilePic = async () => {
    if (!user?.id || !storedFileName) return;

    try {
      // Delete via storage API
      const { error: deleteError } = await supabase.storage
        .from(AVATARS_BUCKET)
        .remove([storedFileName]);

      if (deleteError) console.error("Delete error:", deleteError);

      // Update via profile API
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_pic: null }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setStoredFileName(null);
      setProfilePic(null);
      showMessage("success", "Profile picture removed");
    } catch (error: unknown) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to remove image",
      );
    }
  };

  // Save profile changes via API
  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    console.log("Saving via API:", { name: displayName, institution });

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName, institution }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      console.log("Update success:", data);

      setUser({ ...user, name: displayName });
      showMessage("success", "Profile updated successfully");
    } catch (error: unknown) {
      console.error("Save failed:", error);
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  // Update password (still client-side, uses Supabase Auth)
  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showMessage("error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "Password updated successfully");
    } catch (error: unknown) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to update password",
      );
    } finally {
      setSaving(false);
    }
  };

  // Campus verification
  const handleSendVerification = async () => {
    if (!campusEmail.includes(".edu") && !campusEmail.includes(".ac.ke")) {
      showMessage("error", "Please use a valid campus email (.edu or .ac.ke)");
      return;
    }

    if (!user?.id) return;

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campus_email: campusEmail,
          campus_verified: true,
          verified_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Verification failed");

      setIsVerified(true);
      showMessage("success", "Campus email verified successfully!");
    } catch (error: unknown) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Verification failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(newSettings);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_settings: newSettings }),
      });

      if (!res.ok) throw new Error("Failed to save notification settings");
      showMessage("success", "Notification preferences updated");
    } catch {
      showMessage("error", "Failed to save notification preferences");
    }
  };

  const handlePrivacyChange = async (key: keyof PrivacySettings) => {
    const next = { ...privacy, [key]: !privacy[key] };
    setPrivacy(next);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy_settings: next }),
      });

      if (!res.ok) throw new Error("Failed to save privacy settings");
      showMessage("success", "Privacy settings updated");
    } catch {
      showMessage("error", "Failed to save privacy settings");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="w-full h-[85vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-light" />
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col gap-8 overflow-y-scroll h-[85vh] bg-background-light p-4 pl-6 text-slate-900">
      {/* Alert Messages */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="text-sm font-medium">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-2 hover:opacity-70"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account preferences and security.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="flex sticky top-0 h-fit w-full shrink-0 flex-col gap-1 md:w-64">
          <nav className="flex flex-col gap-1">
            {[
              { id: "account", icon: User, label: "Account" },
              { id: "notifications", icon: Bell, label: "Notifications" },
              { id: "payments", icon: CreditCard, label: "Payments" },
              { id: "privacy", icon: Shield, label: "Privacy" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "border-l-4 border-primary-light bg-white text-primary-light shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}

            <div className="mt-4 flex flex-col gap-1 border-t border-slate-200 pt-4">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-500 transition-all hover:bg-red-50"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col gap-6">
          {/* ACCOUNT TAB */}
          {activeTab === "account" && (
            <>
              {/* General Information Section */}
              <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <form onSubmit={handleSaveChanges}>
                  <div className="flex flex-col gap-6 p-6 sm:p-8">
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                      <BadgeCheck size={24} className="text-primary-link" />
                      General Information
                    </h2>

                    <div className="flex flex-col gap-6">
                      {/* Avatar Section */}
                      <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
                        <div className="relative h-20 w-20">
                          {profilePic ? (
                            <Image
                              alt="Profile"
                              src={profilePic}
                              fill
                              className="rounded-full object-cover ring-4 ring-slate-50"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-linear-to-br from-primary-light to-primary-dark flex items-center justify-center text-white text-2xl font-bold ring-4 ring-slate-50">
                              {displayName[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          {uploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <Loader2
                                className="animate-spin text-white"
                                size={20}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="flex items-center gap-2 rounded-lg bg-primary-light px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                              <Camera size={16} />
                              {uploading ? "Uploading..." : "Change photo"}
                            </button>
                            {profilePic && (
                              <button
                                type="button"
                                onClick={removeProfilePic}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold transition-all hover:bg-slate-50"
                              >
                                <Trash2 size={16} />
                                Remove
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            JPG, PNG or GIF. Max size of 800K
                          </p>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-primary-light focus:ring-primary-light focus:outline-none"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-400">
                            Email cannot be changed
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Institution
                          </label>
                          <div className="relative">
                            <select
                              value={institution}
                              onChange={(e) => setInstitution(e.target.value)}
                              className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-primary-light focus:ring-primary-light focus:outline-none"
                            >
                              <option value="">Select your institution</option>
                              {institutions.map((inst) => (
                                <option key={inst} value={inst}>
                                  {inst}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={16}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-primary-light px-6 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Loader2 className="animate-spin" size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </section>

              {/* Security Section */}
              <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <form onSubmit={handleUpdatePassword}>
                  <div className="flex flex-col gap-6 p-6 sm:p-8">
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                      <Lock size={24} className="text-primary-light" />
                      Security
                    </h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-primary-light focus:ring-primary-light focus:outline-none"
                          minLength={6}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-primary-light focus:ring-primary-light focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                      type="submit"
                      disabled={saving || !newPassword || !confirmPassword}
                      className="rounded-lg bg-primary-light px-6 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Loader2 className="animate-spin" size={16} />}
                      Update Password
                    </button>
                  </div>
                </form>
              </section>

              {/* University Verification Section */}
              <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-6 p-6 sm:p-8">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <GraduationCap size={24} className="text-primary-light" />
                    University Verification
                  </h2>
                  <p className="text-sm text-slate-500">
                    Verify your student status to access campus-exclusive gigs
                    and build trust with clients.
                  </p>

                  {isVerified ? (
                    <div className="flex items-start gap-4 rounded-xl border border-green-100 bg-green-50 p-4">
                      <div className="rounded-full bg-green-100 p-2 text-green-600">
                        <CheckCircle size={20} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold text-green-800">
                          Account Verified
                        </h4>
                        <p className="text-xs text-green-700">
                          Linked to{" "}
                          <span className="font-semibold">{institution}</span>
                          {campusEmail && ` via ${campusEmail}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4 rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                        <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                          <AlertCircle size={20} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-bold text-yellow-800">
                            Verification Required
                          </h4>
                          <p className="text-xs text-yellow-700">
                            Verify your student email to unlock all features and
                            get a verified badge.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Campus Email Address
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="email"
                            value={campusEmail}
                            onChange={(e) => setCampusEmail(e.target.value)}
                            placeholder="your.name@university.ac.ke"
                            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-primary-light focus:ring-primary-light focus:outline-none"
                          />
                          <button
                            onClick={handleSendVerification}
                            disabled={saving || !campusEmail}
                            className="rounded-lg bg-primary-light px-4 py-2 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
                          >
                            {saving ? "Verifying..." : "Verify"}
                          </button>
                        </div>
                        <p className="text-xs text-slate-400">
                          Use your official .edu or .ac.ke email address
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-6 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Bell size={24} className="text-primary-light" />
                  Notification Preferences
                </h2>

                <div className="flex flex-col gap-4">
                  {[
                    {
                      key: "email_notifications",
                      label: "Email Notifications",
                      desc: "Receive updates via email",
                    },
                    {
                      key: "gig_updates",
                      label: "Gig Updates",
                      desc: "Get notified about new gigs and bookings",
                    },
                    {
                      key: "message_notifications",
                      label: "Message Notifications",
                      desc: "Alerts for new messages",
                    },
                    {
                      key: "marketing_emails",
                      label: "Marketing Emails",
                      desc: "Tips, offers, and platform news",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.label}
                        </p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          handleNotificationChange(
                            item.key as keyof NotificationSettings,
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications[item.key as keyof NotificationSettings]
                            ? "bg-primary-light"
                            : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[
                              item.key as keyof NotificationSettings
                            ]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === "payments" && (
            <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-6 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <CreditCard size={24} className="text-primary-light" />
                  Payment Methods
                </h2>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  ✅ Direct M-Pesa checkout is enabled (0% platform commission).
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Recent Payments</h3>
                  {payments.length === 0 ? (
                    <p className="text-sm text-slate-500">No payments yet.</p>
                  ) : (
                    payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-sm">
                            Booking #{payment.booking_id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(payment.created_at).toLocaleString()} • {" "}
                            {payment.method.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">KES {payment.amount}</p>
                          <p className="text-xs capitalize text-slate-500">
                            {payment.status}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* PRIVACY TAB */}
          {activeTab === "privacy" && (
            <section className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-6 p-6 sm:p-8">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Shield size={24} className="text-primary-light" />
                  Privacy Settings
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Profile Visibility
                      </p>
                      <p className="text-sm text-slate-500">
                        Make your profile visible to other students
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyChange("profile_visibility")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${privacy.profile_visibility ? "bg-primary-light" : "bg-slate-200"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white ${privacy.profile_visibility ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900">Show Email</p>
                      <p className="text-sm text-slate-500">
                        Allow others to see your email address
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrivacyChange("show_email")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${privacy.show_email ? "bg-primary-light" : "bg-slate-200"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white ${privacy.show_email ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
