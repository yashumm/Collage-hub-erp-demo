import { createFileRoute } from "@tanstack/react-router";
import { Award, GraduationCap, Sigma } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useErp } from "@/lib/erp-store";
import { CURRENT_STUDENT_ID, GRADE_SCALE, gradeFor } from "@/data/erp";

export const Route = createFileRoute("/student/grades")({
  head: () => ({
    meta: [
      { title: "My Marks | Aurora ERP" },
      { name: "description", content: "Internal and external marks, grades and GPA for the demo student." },
      { property: "og:title", content: "My Marks | Aurora ERP" },
      {
        property: "og:description",
        content: "Internal and external marks, grades and GPA for the demo student.",
      },
    ],
  }),
  component: StudentGrades,
});

function StudentGrades() {
  const { students, courses, grades } = useErp();
  const me = students.find((s) => s.id === CURRENT_STUDENT_ID);
  const mine = grades.filter((g) => g.studentId === CURRENT_STUDENT_ID);

  const rows = mine.map((g) => {
    const course = courses.find((c) => c.id === g.courseId);
    const total = g.internal + g.external;
    return { g, course, total, scale: gradeFor(total) };
  });

  const credits = rows.reduce((t, r) => t + (r.course?.credits ?? 0), 0);
  const weighted = rows.reduce((t, r) => t + r.scale.points * (r.course?.credits ?? 0), 0);
  const gpa = credits ? (weighted / credits).toFixed(2) : "—";
  const best = rows.slice().sort((a, b) => b.total - a.total)[0];

  return (
    <RoleWorkspace role="student">
      <PageHeader
        title="My marks"
        description="Published by faculty for the current semester. Read-only for students."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Semester GPA" value={gpa} hint="Credit weighted" icon={Sigma} />
        <StatCard label="CGPA" value={me?.cgpa ?? "—"} hint="Cumulative" icon={GraduationCap} />
        <StatCard label="Credits" value={credits} hint="Registered" icon={Award} />
        <StatCard
          label="Best subject"
          value={best?.scale.grade ?? "—"}
          hint={best?.course?.code ?? "No marks yet"}
          icon={Award}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Marks statement</CardTitle>
            <CardDescription>Internal /40 · External /60 · Total /100</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Internal</TableHead>
                  <TableHead className="text-right">External</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ g, course, total, scale }) => (
                  <TableRow key={g.id}>
                    <TableCell className="min-w-0">
                      <span className="block font-medium">{course?.code}</span>
                      <span className="block text-xs text-muted-foreground">{course?.title}</span>
                    </TableCell>
                    <TableCell className="text-right">{g.internal}</TableCell>
                    <TableCell className="text-right">{g.external}</TableCell>
                    <TableCell className="text-right font-medium">{total}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={scale.grade === "F" ? "destructive" : "secondary"}>
                        {scale.grade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      No marks published yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Grading scale</CardTitle>
            <CardDescription>Institute standard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {GRADE_SCALE.map((s) => (
              <div key={s.grade} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <Badge variant="outline" className="shrink-0">
                  {s.grade}
                </Badge>
                <span className="text-muted-foreground">{s.min}+ marks</span>
                <span className="shrink-0 font-medium">{s.points} pts</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <DemoNotice className="mt-6">
        Only your own marks are visible here — the prototype never lists other students' results on
        student screens.
      </DemoNotice>
    </RoleWorkspace>
  );
}
