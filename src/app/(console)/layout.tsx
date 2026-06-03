import { ConsoleSidebar } from "@/components/console-sidebar";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <ConsoleSidebar />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
