import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useErp } from "@/lib/erp-store";
import { CURRENT_STUDENT_ID, gradeFor } from "@/data/erp";

export const Route = createFileRoute("/student/courses")({
  head: () => ({
    meta: [
      { title: "My Courses | Aurora ERP" },
      { name: "description", content: "Courses the demo student is enrolled in, with credits and faculty." },
      { property: "og:title", content: "My Courses | Aurora ERP" },
      {
        property: "og:description",
        content: "Courses the demo student is enrolled in, with credits and faculty.",
      },
    ],
  }),
  component: StudentCourses,
});

function StudentCourses() {
  const { students, courses, grades, sections, faculty, attendance } = useErp();
  const me = students.find((s) => s.id === CURRENT_STUDENT_ID);
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState("all");

  const myCourses = grades
    .filter((g) => g.studentId === CURRENT_STUDENT_ID)
    .map((g) => {
      const course = courses.find((c) => c.id === g.courseId)!;
      const section = sections.find((s) => s.courseId === g.courseId);
      const teacher = faculty.find((f) => f.id === section?.facultyId);
      const recs = attendance.filter(
        (a) => a.studentId === CURRENT_STUDENT_ID && a.sectionId === section?.id,
      );
      const pct = recs.length
        ? Math.round((recs.filter((a) => a.mark !== "absent").length / recs.length) * 100)
        : null;
      return { grade: g, course, section, teacher, pct };
    })
    .filter((row) => row.course)
    .filter((row) => (type === "all" ? true : row.course.type === type))
    .filter((row) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        row.course.code.toLowerCase().includes(q) ||
        row.course.title.toLowerCase().includes(q) ||
        (row.teacher?.name ?? "").toLowerCase().includes(q)
      );
    });

  const totalCredits = myCourses.reduce((t, r) => t + r.course.credits, 0);

  return (
    <RoleWorkspace role="student">
      <PageHeader
        title="My courses"
        description={`Semester ${me?.semester ?? ""} enrolment · ${totalCredits} credits in total`}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <Input
          placeholder="Search course or faculty…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Core">Core</SelectItem>
            <SelectItem value="Elective">Elective</SelectItem>
            <SelectItem value="Lab">Lab</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {myCourses.map(({ grade, course, section, teacher, pct }) => {
          const total = grade.internal + grade.external;
          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">{course.title}</CardTitle>
                    <CardDescription>
                      {course.code} · {course.credits} credits · {course.type}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {gradeFor(total).grade}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Faculty: <span className="font-medium text-foreground">{teacher?.name ?? "To be allotted"}</span>
                </p>
                <p className="text-muted-foreground">
                  Schedule:{" "}
                  <span className="font-medium text-foreground">
                    {section ? `${section.slot} · ${section.room}` : "Announced later"}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Marks:{" "}
                  <span className="font-medium text-foreground">
                    {grade.internal}/40 internal · {grade.external}/60 external
                  </span>
                </p>
                <p className="text-muted-foreground">
                  My attendance:{" "}
                  <span className="font-medium text-foreground">{pct === null ? "—" : `${pct}%`}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
        {myCourses.length === 0 && (
          <p className="text-sm text-muted-foreground">No courses match your search.</p>
        )}
      </div>

      <DemoNotice className="mt-6">
        Only the courses of this one student are listed — other students' enrolments are never shown here.
      </DemoNotice>
    </RoleWorkspace>
  );
}
