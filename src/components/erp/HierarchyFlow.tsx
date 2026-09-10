import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Building2, Layers, School, UserSquare2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COLLEGE } from "@/data/erp";
import { useErp } from "@/lib/erp-store";

type Step = {
  label: string;
  icon: React.ElementType;
  count: string | number;
  hint: string;
  to?: string;
};

/**
 * Visual College → Departments → Sections → Courses → Students & Faculty ladder.
 * Purely presentational; counts come from the in-session mock store.
 */
export function HierarchyFlow({ compact = false }: { compact?: boolean }) {
  const { departments, sections, courses, students, faculty } = useErp();

  const steps: Step[] = [
    { label: "College", icon: School, count: 1, hint: COLLEGE.name },
    {
      label: "Departments",
      icon: Building2,
      count: departments.length,
      hint: "Academic units",
      to: "/admin/departments",
    },
    {
      label: "Sections",
      icon: Layers,
      count: sections.length,
      hint: "Class groups per department",
      to: "/admin/sections",
    },
    {
      label: "Courses / Papers",
      icon: BookOpen,
      count: courses.length,
      hint: "Taught inside sections",
      to: "/admin/courses",
    },
    {
      label: "Students",
      icon: Users,
      count: students.length,
      hint: "Enrolled in a section",
      to: "/admin/students",
    },
    {
      label: "Faculty",
      icon: UserSquare2,
      count: faculty.length,
      hint: "Assigned to sections",
      to: "/admin/faculty",
    },
  ];

  return (
    <div className={cn("grid gap-3", compact ? "sm:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-[repeat(6,minmax(0,1fr))]")}>
      {steps.map((step, i) => {
        const Icon = step.icon;
        const body = (
          <Card
            className={cn(
              "h-full transition-colors",
              step.to && "hover:border-primary/50 hover:bg-secondary/40",
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
                  Level {i + 1}
                </Badge>
              </div>
              <p className="mt-3 truncate text-sm font-medium">{step.label}</p>
              <p className="font-serif text-2xl leading-none font-semibold">{step.count}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{step.hint}</p>
            </CardContent>
          </Card>
        );

        return (
          <div key={step.label} className="relative">
            {step.to ? (
              <Link to={step.to} className="block h-full">
                {body}
              </Link>
            ) : (
              body
            )}
            {i < steps.length - 1 && (
              <ArrowRight
                className="absolute top-1/2 -right-3 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground lg:block"
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Numbered "what to create next" guide for the admin workflow. */
export function HierarchyWorkflow() {
  const items = [
    { to: "/admin/departments", label: "Add a department", hint: "Name, code and description" },
    { to: "/admin/sections", label: "Add sections", hint: "Inside a department, per academic year" },
    { to: "/admin/courses", label: "Add courses / papers", hint: "Attach to a department and section" },
    { to: "/admin/students", label: "Add students", hint: "Enrol into a section" },
    { to: "/admin/faculty", label: "Add faculty", hint: "Assign sections and papers" },
  ];

  return (
    <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item, i) => (
        <li key={item.to}>
          <Link to={item.to} className="block h-full">
            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-secondary/40">
              <CardContent className="p-4">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm font-medium">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ol>
  );
}
