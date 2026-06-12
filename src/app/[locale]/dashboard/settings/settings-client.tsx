"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { User, Mail, Shield, Trash2, Palette, Globe, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/hooks/useAuth";

const Modal = dynamic(() => import("@/components/ui/Modal"), { ssr: false });

type SettingsClientProps = {
  displayName: string;
  email: string;
  memberSince: string;
  locale: string;
  userId: string;
};

export default function SettingsClient({
  displayName: initialDisplayName,
  email,
  memberSince,
  locale,
  userId,
}: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const { signOut } = useAuth();

  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  async function handleSaveProfile() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", userId);

    if (error) {
      showToast("error", "Failed to update profile");
    } else {
      showToast("success", "Profile updated successfully");
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/auth/reset-password`,
    });

    if (error) {
      showToast("error", "Failed to send reset email");
    } else {
      setPasswordSent(true);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);

    const { error: deleteError } = await supabase.rpc("delete_user");

    if (deleteError) {
      showToast("error", "Failed to delete account");
      setDeleting(false);
      return;
    }

    await signOut();
    showToast("info", "Your account has been deleted");
    router.push("/");
  }

  return (
    <div className="space-y-10">
      {/* Section 1: Profile */}
      <section>
        <h2 className="mb-4 text-headline-md text-primary">Profile</h2>
        <Card padding="md">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-headline-md font-bold text-on-primary">
                {(displayName || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-label-md font-semibold text-on-surface">{displayName || "User"}</p>
                <p className="text-label-sm text-on-surface-variant">{email}</p>
              </div>
            </div>
            <Input
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              icon={<User size={18} />}
            />
            <div className="text-label-sm text-on-surface-variant">
              <Mail size={14} className="mr-1 inline" />
              {email} (read-only)
            </div>
            <Button onClick={handleSaveProfile} loading={saving}>
              Update Profile
            </Button>
          </div>
        </Card>
      </section>

      {/* Section 2: Account */}
      <section>
        <h2 className="mb-4 text-headline-md text-primary">Account</h2>
        <Card padding="md">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-label-md font-semibold text-on-surface">Change Password</p>
                <p className="text-label-sm text-on-surface-variant">
                  A reset link will be sent to your email
                </p>
              </div>
              <div>
                {passwordSent ? (
                  <p className="text-label-md font-medium text-secondary">
                    A password reset link has been sent to {email}
                  </p>
                ) : (
                  <Button variant="secondary" onClick={handleChangePassword}>
                    Send Reset Link
                  </Button>
                )}
              </div>
            </div>
            <hr className="border-outline-variant" />
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-label-md font-semibold text-error">Delete Account</p>
                <p className="text-label-sm text-on-surface-variant">
                  Permanently delete your account and all progress
                </p>
              </div>
              <Button variant="danger" icon={<Trash2 size={18} />} onClick={() => setShowDeleteModal(true)}>
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Section 3: Preferences */}
      <section>
        <h2 className="mb-4 text-headline-md text-primary">Preferences</h2>
        <Card padding="md">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-label-md font-semibold text-on-surface">Theme</p>
              <div className="flex flex-wrap gap-3">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <Button
                    key={theme}
                    variant="secondary"
                    size="sm"
                    icon={<Palette size={16} />}
                    onClick={() => {
                      document.documentElement.setAttribute("data-theme", theme === "system" ? "" : theme);
                      localStorage.setItem("hmc-theme", theme);
                    }}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <hr className="border-outline-variant" />
            <div>
              <p className="mb-3 text-label-md font-semibold text-on-surface">Language</p>
              <div className="flex flex-wrap gap-3">
                {["en", "es"].map((lang) => (
                  <Button
                    key={lang}
                    variant={locale === lang ? "primary" : "secondary"}
                    size="sm"
                    icon={<Globe size={16} />}
                    onClick={() => {
                      const path = window.location.pathname.replace(/^\/(en|es)/, `/${lang}`);
                      window.location.href = path;
                    }}
                  >
                    {lang === "en" ? "English" : "Español"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Section 4: Privacy */}
      <section>
        <h2 className="mb-4 text-headline-md text-primary">Privacy</h2>
        <Card padding="md">
          <div className="space-y-4">
            <p className="text-label-sm text-on-surface-variant">
              We store your lesson progress, quiz scores, and achievements. We do not sell your data.
            </p>
            <p className="text-label-sm text-on-surface-variant">
              To request a copy of your data, contact us at privacy@healthmadeclear.com
            </p>
            <a
              href={`/${locale}/privacy`}
              className="inline-flex items-center gap-1 text-label-md font-semibold text-primary underline-offset-2 hover:underline"
            >
              <Shield size={16} />
              Read our Privacy Policy
            </a>
          </div>
        </Card>
      </section>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirm("");
        }}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-error-container p-4 text-label-md text-on-error-container">
            This will permanently delete your account and all your progress. This cannot be undone.
          </div>
          <p className="text-label-sm text-on-surface-variant">
            Type <strong>DELETE</strong> to confirm:
          </p>
          <Input
            label="Confirmation"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE"
          />
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "DELETE"}
              loading={deleting}
              fullWidth
            >
              Permanently Delete My Account
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirm("");
              }}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
