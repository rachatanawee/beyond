// This file is required for the app directory structure
// The actual routing is handled by middleware
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return children;
}