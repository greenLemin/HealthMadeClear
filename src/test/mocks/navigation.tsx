import { vi } from "vitest";
import React from "react";

/**
 * Shared mock for @/i18n/navigation Link component.
 * Renders an anchor tag with href and optional className.
 */
export const MockLink = ({
  children,
  href,
  className,
  ...props
}: {
  children?: React.ReactNode;
  href?: string;
  className?: string;
  [key: string]: any;
}) => (
  <a href={href} className={className} data-testid="mock-link" {...props}>
    {children}
  </a>
);

/**
 * Factory that creates a vi.mock for @/i18n/navigation.
 * Returns the standard mock with Link, usePathname, useRouter.
 *
 * Usage:
 *   vi.mock("@/i18n/navigation", () => createNavigationMock());
 *
 * Or with custom path:
 *   vi.mock("@/i18n/navigation", () => createNavigationMock("/custom-path"));
 */
export function createNavigationMock(customPathname?: string) {
  return {
    Link: MockLink,
    usePathname: vi.fn(() => customPathname ?? "/test-path"),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
    })),
    redirect: vi.fn(),
  };
}
