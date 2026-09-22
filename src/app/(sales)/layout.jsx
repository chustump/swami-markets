import { SalesProvider } from "@/lib/sales/store";
import { AppShell } from "@/components/app-shell";

export default function SalesLayout({ children }) {
  return (
    <SalesProvider>
      <AppShell>{children}</AppShell>
    </SalesProvider>
  );
}
