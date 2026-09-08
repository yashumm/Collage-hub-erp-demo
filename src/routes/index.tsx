import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Network,
  ShieldCheck,
  UserSquare2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { useErp } from "@/lib/erp-store";
import { CURRENT_ADMIN, type Role } from "@/data/erp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora ERP — Choose a Role | College ERP Prototype" },
      {
        name: "description",
        content:
          "Pick an Admin, Faculty or Student workspace to explore the Aurora College ERP frontend prototype.",
      },
      { property: "og:title", content: "Aurora ERP — Choose a Role" },
      {
        property: "og:description",
        content:
          "Pick an Admin, Faculty or Student workspace to explore the Aurora College ERP frontend prototype.",
      },
    ],
  }),
  component: RoleSelection,
});

const ROLES: {
  role: Role;
  title: string;
  person: string;
  blurb: string;
  points: { icon: React.ElementType; label: string }[];
}[] = [
  {
    role: "admin",
    title: "Administration",
    person: CURRENT_ADMIN.name,
    blurb: "Institute-wide registry, structure and configuration.",
    points: [
      { icon: Network, label: "Hierarchy explorer" },
      { icon: Users, label: "Student & faculty records" },
      { icon: ShieldCheck, label: "Permission matrix" },
    ],
  },
  {
    role: "faculty",
    title: "Faculty",
    person: "Prof. Anand Kulkarni",
    blurb: "Only the sections assigned to this teacher are visible.",
    points: [
      { icon: BookOpen, label: "Assigned sections" },
      { icon: CalendarCheck, label: "Daily attendance" },
      { icon: GraduationCap, label: "Internal marks entry" },
    ],
  },
  {
    role: "student",
    title: "Student",
    person: "Yashaswini M M · ENG24AM0319",
    blurb: "Personal academic record, read-only.",
    points: [
      { icon: BookOpen, label: "Enrolled courses" },
      { icon: CalendarCheck, label: "Attendance summary" },
      { icon: GraduationCap, label: "Marks & grade points" },
    ],
  },
];

function RoleSelection() {
  const { setRole, students, faculty, courses, sections } = useErp();
  const navigate = useNavigate();

  const enter = (role: Role) => {
    setRole(role);
    navigate({ to: role === "admin" ? "/admin" : role === "faculty" ? "/faculty" : "/student" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-serif text-lg leading-tight font-semibold">Aurora Institute of Technology</p>
              <p className="truncate text-xs tracking-wide text-muted-foreground uppercase">
                Enterprise Resource Planning
              </p>
            </div>
          </div>

          <h1 className="mt-8 font-serif text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Choose a workspace to begin
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            A single ERP surface with three tailored experiences. Every record here is sample data
            held in the browser — nothing is saved, sent or protected.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary">{students.length} students</Badge>
            <Badge variant="secondary">{faculty.length} faculty</Badge>
            <Badge variant="secondary">{courses.length} courses</Badge>
            <Badge variant="secondary">{sections.length} sections</Badge>
          </div>
        </header>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {ROLES.map((r) => (
            <Card
              key={r.role}
              className="group flex flex-col border-border transition-shadow hover:shadow-lg"
            >
              <CardContent className="flex flex-1 flex-col p-6">
                <Badge className="w-fit rounded-full bg-brass text-brass-foreground hover:bg-brass">
                  {r.title}
                </Badge>
                <h2 className="mt-4 font-serif text-2xl font-semibold">{r.person}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{r.blurb}</p>

                <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                  {r.points.map((p) => {
                    const Icon = p.icon;
                    return (
                      <li key={p.label} className="flex items-center gap-3 text-sm">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 truncate">{p.label}</span>
                      </li>
                    );
                  })}
                </ul>

                <Button className="mt-6 w-full gap-2" onClick={() => enter(r.role)}>
                  Enter {r.title}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <DemoNotice className="mt-10">
          Role selection in this prototype is <strong className="text-foreground">demonstrative only</strong>.
          There is no login, no server and no real access control — you can switch roles at any time from
          the account menu inside a workspace.
        </DemoNotice>

        <footer className="mt-10 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <UserSquare2 className="h-3.5 w-3.5" />
          Frontend prototype · React + TypeScript + Tailwind · local state only
        </footer>
      </div>
    </div>
  );
}
