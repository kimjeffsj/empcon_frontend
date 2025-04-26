import { useAppSelector } from "@/store";
import {
  Briefcase,
  CalendarDays,
  Clock,
  DollarSign,
  FileText,
  Home,
  Users,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "../ui/sheet";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const navigationItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/dashboard",
      access: ["ADMIN", "MANAGER", "EMPLOYEE"],
    },
    {
      title: "Employees",
      icon: <Users className="h-5 w-5" />,
      path: "/employees",
      access: ["ADMIN", "MANAGER"],
    },
    {
      title: "Schedules",
      icon: <CalendarDays className="h-5 w-5" />,
      path: "/schedules",
      access: ["ADMIN", "MANAGER", "EMPLOYEE"],
    },
    {
      title: "Time Clocks",
      icon: <Clock className="h-5 w-5" />,
      path: "/timeclocks",
      access: ["ADMIN", "MANAGER", "EMPLOYEE"],
    },
    {
      title: "Leaves",
      icon: <Briefcase className="h-5 w-5" />,
      path: "/leaves",
      access: ["ADMIN", "MANAGER", "EMPLOYEE"],
    },
    {
      title: "Payroll",
      icon: <DollarSign className="h-5 w-5" />,
      path: "/payroll",
      access: ["ADMIN", "MANAGER"],
    },
    {
      title: "Reports",
      icon: <FileText className="h-5 w-5" />,
      path: "/reports",
      access: ["ADMIN", "MANAGER"],
    },
  ];

  const filteredItems = navigationItems.filter((item) =>
    item.access.includes(user?.role || "")
  );

  const sidebarContent = (
    <div className="flex h-full flex-col gap-2 py-4">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-lg font-semibold tracking-tight">Menu</h2>
      </div>
      <div className="flex-1">
        <nav className="grid gap-1 px-2">
          {filteredItems.map((item) => (
            <Button
              key={item.path}
              variant={
                location.pathname.startsWith(item.path) ? "secondary" : "ghost"
              }
              className={cn(
                "flex justify-start gap-3",
                location.pathname.startsWith(item.path) && "font-medium"
              )}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
            >
              {item.icon}
              {item.title}
            </Button>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t px-3 py-2">
        <div className="flex flex-col">
          <p className="text-sm font-medium">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "border-r bg-background hidden md:block",
          isOpen ? "w-64" : "w-0"
        )}
      >
        {isOpen && sidebarContent}
      </aside>

      {/* Mobile */}
      <Sheet open={isOpen && window.innerWidth < 768} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
