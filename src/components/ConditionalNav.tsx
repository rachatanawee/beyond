"use client";

import { usePathname } from "next/navigation";
// import AuthButton from "@/components/AuthButton";

export default function ConditionalNav() {
  const pathname = usePathname();

  // Don't show navigation on dashboard pages (they have their own nav)
  const isDashboardPage =
    pathname.includes("/dashboard") || pathname.includes("/profile");

  if (isDashboardPage) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {/* <AuthButton /> */}
      {/* <LanguageSwitcher /> */}
    </div>
  );
}
