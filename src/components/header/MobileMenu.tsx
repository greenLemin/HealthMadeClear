"use client";

import { Link } from "@/i18n/navigation";
import { LogOut, User } from "lucide-react";
import ButtonLink from "@/components/ui/ButtonLink";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AccessibilityControls from "@/components/AccessibilityControls";
import Skeleton from "@/components/ui/Skeleton";
import TruncatedText from "@/components/ui/TruncatedText";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";

const SearchDialog = dynamic(() => import("@/components/SearchDialog"), {
  ssr: false,
  loading: () => <Skeleton variant="button" width="44px" />,
});

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const t = useTranslations("nav");
  const authT = useTranslations("auth");
  const { user, loading } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";

  return (
    <>
      <div className="mt-4 rounded-[1.5rem] bg-surface-container-low/70 p-4 shadow-elevation-1 lg:hidden">
        <div className="space-y-3">
          <SearchDialog />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <AccessibilityControls />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-outline-variant pt-4">
        {loading ? (
          <Skeleton variant="button" />
        ) : user ? (
          <div className="space-y-3">
            <div className="surface-card-muted flex items-center gap-3 px-4 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-elevation-1">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <TruncatedText as="p" className="truncate text-label-md font-semibold text-on-surface">
                  {displayName}
                </TruncatedText>
                <p className="text-label-sm text-on-surface-variant">{t("dashboard")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-3 text-label-md font-semibold text-on-surface transition-all duration-300 ease-premium hover:bg-surface"
            >
              <LogOut size={18} />
              {authT("signOut")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ButtonLink href="/auth/login" onClick={onClose} variant="secondary" fullWidth>
              {authT("loginButton")}
            </ButtonLink>
            <ButtonLink href="/auth/signup" onClick={onClose} fullWidth>
              {authT("signupButton")}
            </ButtonLink>
          </div>
        )}
      </div>
    </>
  );
}
