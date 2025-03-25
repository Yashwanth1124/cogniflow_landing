import { useLocation, Link } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  LayoutDashboardIcon,
  BarChartIcon,
  BrainCircuitIcon,
  UsersIcon,
  FileTextIcon,
  ShoppingCartIcon,
  PackageIcon,
  SettingsIcon,
  HelpCircleIcon,
  XIcon,
  ArrowLeftRightIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  isCollapsed?: boolean;
  hasChildren?: boolean;
  children?: React.ReactNode;
}

const SidebarItem = ({
  href,
  icon,
  title,
  isActive,
  isCollapsed = false,
  hasChildren = false,
  children,
}: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={toggleOpen}
          className={cn(
            "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
            isActive
              ? "text-white bg-primary"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <span className="mr-2">{icon}</span>
          <span className="flex-1 text-left">{title}</span>
          <ChevronRightIcon
            className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
          />
        </button>
        {isOpen && <div className="pl-6 space-y-1">{children}</div>}
      </div>
    );
  }

  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
          isActive
            ? "text-white bg-primary hover:bg-primary-700"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <span className="mr-2">{icon}</span>
        {!isCollapsed && <span>{title}</span>}
      </a>
    </Link>
  );
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 lg:shadow-none lg:transform-none lg:z-auto lg:relative",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard">
            <a className="flex items-center">
              <Logo className="h-8 w-8 text-primary" />
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                Cogniflow
              </span>
            </a>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar content */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-4rem)]">
          {/* Main Navigation */}
          <div className="space-y-1">
            <SidebarItem
              href="/dashboard/overview"
              icon={<LayoutDashboardIcon className="h-5 w-5" />}
              title="Overview"
              isActive={isActive("/dashboard/overview")}
            />
            <SidebarItem
              href="/dashboard/finance"
              icon={<BarChartIcon className="h-5 w-5" />}
              title="Finance"
              isActive={isActive("/dashboard/finance")}
            />
            <SidebarItem
              href="/dashboard/ai-insights"
              icon={<BrainCircuitIcon className="h-5 w-5" />}
              title="AI Insights"
              isActive={isActive("/dashboard/ai-insights")}
            />
            <SidebarItem
              href="/dashboard/hr"
              icon={<UsersIcon className="h-5 w-5" />}
              title="HR & Compliance"
              isActive={isActive("/dashboard/hr")}
            />
            <SidebarItem
              href="/dashboard/documents"
              icon={<FileTextIcon className="h-5 w-5" />}
              title="Documents"
              isActive={isActive("/dashboard/documents")}
            />
            <SidebarItem
              href="/dashboard/inventory"
              icon={<PackageIcon className="h-5 w-5" />}
              title="Inventory"
              isActive={isActive("/dashboard/inventory")}
            />
            <SidebarItem
              href="/dashboard/procurement"
              icon={<ShoppingCartIcon className="h-5 w-5" />}
              title="Procurement"
              isActive={isActive("/dashboard/procurement")}
            />
            <SidebarItem
              href="/transactions"
              icon={<ArrowLeftRightIcon className="h-5 w-5" />}
              title="Transactions"
              isActive={location === "/transactions"}
            />
          </div>

          {/* Settings and Help */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <SidebarItem
              href="/dashboard/settings"
              icon={<SettingsIcon className="h-5 w-5" />}
              title="Settings"
              isActive={isActive("/dashboard/settings")}
            />
            <SidebarItem
              href="/dashboard/help"
              icon={<HelpCircleIcon className="h-5 w-5" />}
              title="Help & Support"
              isActive={isActive("/dashboard/help")}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
