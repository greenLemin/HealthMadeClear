const fs = require('fs');

let origCode = fs.readFileSync('/tmp/Header.tsx.orig', 'utf8');

const navItemType = `
type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};
`;

const getNavItemsFunc = `
function getNavItems(t: any): NavItem[] {
  return [
    { href: "/", label: t("home"), icon: <Home size={18} /> },
    { href: "/learn", label: t("learn"), icon: <BookOpen size={18} /> },
    { href: "/articles", label: t("articles"), icon: <BookOpen size={18} /> },
    { href: "/learning-paths", label: t("paths"), icon: <Route size={18} /> },
    { href: "/tools", label: t("tools"), icon: <Wrench size={18} /> },
    { href: "/dashboard", label: t("dashboard"), icon: <LayoutDashboard size={18} /> },
    { href: "/glossary", label: t("glossary"), icon: <Search size={18} /> },
    { href: "/about", label: t("about"), icon: <Info size={18} /> },
  ];
}
`;

origCode = origCode.replace('export default function Header() {', navItemType + '\\n' + getNavItemsFunc + '\\nexport default function Header() {');

const originalNavItems = `  const navItems = [
    { href: "/", label: t("home"), icon: <Home size={18} /> },
    { href: "/learn", label: t("learn"), icon: <BookOpen size={18} /> },
    { href: "/articles", label: t("articles"), icon: <BookOpen size={18} /> },
    { href: "/learning-paths", label: t("paths"), icon: <Route size={18} /> },
    { href: "/tools", label: t("tools"), icon: <Wrench size={18} /> },
    { href: "/dashboard", label: t("dashboard"), icon: <LayoutDashboard size={18} /> },
    { href: "/glossary", label: t("glossary"), icon: <Search size={18} /> },
    { href: "/about", label: t("about"), icon: <Info size={18} /> },
  ];`;

origCode = origCode.replace(originalNavItems, `  const navItems = getNavItems(t);`);


const originalMobileMenuContentStart = `  const mobileMenuContent = (
    <>`;
const originalMobileMenuContentEnd = `    </>
  );`;

// Instead of extracting `mobileMenuContent` which E2E tests hate, I'll extract some of the return JSX of the Header component itself to simple variables inside `Header` to reduce "statements" maybe? Wait, ESLint usually counts statements. Moving JSX out of the main return to a `const` doesn't reduce statements, it might even increase them.

// Let's just leave the Header refactor at the `getNavItems` abstraction, because that actually works and reduces line count slightly. We can also abstract `const renderDesktopNav` inside the file without passing ANY props by making it a component?
// No, the tests passed when I only abstracted `getNavItems`. They failed on E2E ONLY because the main branch fails on E2E regardless!
