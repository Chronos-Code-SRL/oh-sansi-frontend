import { SidebarProvider } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import { Outlet } from "react-router";

const PublicLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <AppHeader hideToggleButton />
        <main className="flex-1">
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PublicLayout;
