import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useErp } from "@/lib/erp-store";
import { CURRENT_FACULTY_ID } from "@/data/erp";

export const Route = createFileRoute("/faculty/courses")({
  head: () => ({
    meta: [
      { title: "My Courses | Aurora ERP" },
      { name: "description", content: "Courses taught by the signed-in demo faculty member." },
      { property: "og:title", content: "My Courses | Aurora ERP" },
      { property: "og:description", content: "Courses taught by the signed-in demo faculty member." },
    ],
  }),
  component: FacultyCourses,
});

function FacultyCourses() {
  const { faculty, sections, courses, students, grades } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));
  const [query, setQuery] = React.useState("");

  const rows = mySections
    .map((section) => {
      const course = courses.find((c) => c.id === section.courseId)!;
      const roster = students.filter((s) => s.sectionId === section.id);
      const marks = grades.filter(
        (g) => g.courseId === course.id && roster.some((s) => s.id === g.studentId),
      );
      const avg = marks.length
        ? Math.round(marks.reduce((t, g) => t + g.internal + g.external, 0) / marks.length)
        : null;
      return { section, course, roster, avg };
    })
    .filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        r.course.code.toLowerCase().includes(q) ||
        r.course.title.toLowerCase().includes(q) ||
        r.section.label.toLowerCase().includes(q)
      );
    });

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title="My courses"
        description="Only courses linked to the sections allocated to you are listed."
      />

      <Input
        className="mb-4"
        placeholder="Search course or section…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(({ section, course, roster, avg }) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{course.title}</CardTitle>
                  <CardDescription>
                    {course.code} · {section.label} · {course.type}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {course.credits} credits
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                Schedule: <span className="font-medium text-foreground">{section.slot} · {section.room}</span>
              </p>
              <p>
                Class strength: <span className="font-medium text-foreground">{roster.length} students</span>
              </p>
              <p>
                Average total: <span className="font-medium text-foreground">{avg === null ? "—" : `${avg}/100`}</span>
              </p>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">No courses match your search.</p>}
      </div>

      <DemoNotice className="mt-6">
        Faculty screens are scoped to assigned mock sections; the wider catalogue stays with administration.
      </DemoNotice>
    </RoleWorkspace>
  );
}
