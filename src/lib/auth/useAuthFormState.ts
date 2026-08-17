"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AuthFormState {
  error: string;
  loading: boolean;
  fieldErrors: Record<string, string | undefined>;
  setError: (error: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setFieldError: (field: string, error: string | undefined) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
}

export function useAuthFormState(): AuthFormState & { supabase: ReturnType<typeof createClient> } {
  const supabase = useState(() => createClient())[0];
  const [error, setErrorState] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const setError = useCallback((err: string) => {
    setErrorState(err);
  }, []);

  const clearError = useCallback(() => {
    setErrorState("");
  }, []);

  const setFieldError = useCallback((field: string, err: string | undefined) => {
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrorState("");
    setFieldErrors({});
  }, []);

  return {
    error,
    loading,
    fieldErrors,
    setError,
    clearError,
    setLoading,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    supabase,
  };
}
