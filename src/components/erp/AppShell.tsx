import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  ShieldCheck,
  Users,
  UserSquare2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useErp } from "@/lib/erp-store";
import { CURRENT_ADMIN, CURRENT_FACULTY_ID, CURRENT_STUDENT_ID, type Role } from "@/data/erp";

type NavItem = { to: string; label: string; icon: React.ElementType };

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/hierarchy", label: "Hierarchy Explorer", icon: Network },
    { to: "/admin/students", label: "Students", icon: Users },
    { to: "/admin/faculty", label: "Faculty", icon: UserSquare2 },
    { to: "/admin/courses", label: "Courses & Sections", icon: BookOpen },
    { to: "/admin/announcements", label: "Announcements", icon: ClipboardList },
    { to: "/admin/security", label: "Security & Permissions", icon: ShieldCheck },
  ],
  faculty: [
    { to: "/faculty", label: "Overview", icon: LayoutDashboard },
    { to: "/faculty/sections", label: "My Sections", icon: BookOpen },
    { to: "/faculty/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/faculty/grades", label: "Marks Entry", icon: ClipboardList },
  ],
  student: [
    { to: "/student", label: "Overview", icon: LayoutDashboard },
    { to: "/student/courses", label: "My Courses", icon: BookOpen },
    { to: "/student/attendance", label: "My Attendance", icon: CalendarCheck },
    { to: "/student/grades", label: "My Marks", icon: GraduationCap },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  admin: "Administration",
  faculty: "Faculty",
  student: "Student",
};

export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  const { setRole, students, faculty } = useErp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const identity = React.useMemo(() => {
    if (role === "admin") return { name: CURRENT_ADMIN.name, sub: CURRENT_ADMIN.title };
    if (role === "faculty") {
      const f = faculty.find((x) => x.id === CURRENT_FACULTY_ID);
      return { name: f?.name ?? "Faculty", sub: `${f?.designation ?? ""} · ${f?.department ?? ""}` };
    }
    const s = students.find((x) => x.id === CURRENT_STUDENT_ID);
    return { name: s?.name ?? "Student", sub: `${s?.rollNo ?? ""} · Sem ${s?.semester ?? ""}` };
  }, [role, faculty, students]);

  const switchRole = (next: Role) => {
    setRole(next);
    navigate({ to: next === "admin" ? "/admin" : next === "faculty" ? "/faculty" : "/student" });
  };

  const nav = NAV[role];

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-base leading-tight font-semibold text-sidebar-foreground">
              Aurora ERP
            </p>
            <p className="truncate text-xs text-muted-foreground">Institute Management</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-4">
          <Badge variant="secondary" className="rounded-full">
            {ROLE_LABEL[role]} workspace
          </Badge>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.to === `/${role}` ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <p className="px-2 pb-2 text-[11px] leading-relaxed text-muted-foreground">
            Prototype only — role access is demonstrative, with no real authentication or security.
          </p>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { setRole(null); navigate({ to: "/" }); }}>
            <LogOut className="h-4 w-4" /> Exit workspace
          </Button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm text-muted-foreground">
              Academic Year 2026–27 · Odd Semester
            </p>
          </div>
          <div className="lg:hidden" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-auto shrink-0 gap-3 py-1.5 text-left">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {identity.name.split(" ").slice(-1)[0]!.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-sm font-medium">{identity.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{identity.sub}</span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch demo role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["admin", "faculty", "student"] as Role[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => switchRole(r)} disabled={r === role}>
                  {ROLE_LABEL[r]}
                  {r === role && <span className="ml-auto text-xs text-muted-foreground">current</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setRole(null); navigate({ to: "/" }); }}>
                Back to role selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
