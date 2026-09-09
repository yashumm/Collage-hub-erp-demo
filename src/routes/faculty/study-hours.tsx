import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, TrendingUp, Users } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useErp } from "@/lib/erp-store";
import { CURRENT_FACULTY_ID } from "@/data/erp";

export const Route = createFileRoute("/faculty/study-hours")({
  head: () => ({
    meta: [
      { title: "Study Hours | Aurora ERP" },
      { name: "description", content: "Self-study hours logged by students in the faculty member's sections." },
      { property: "og:title", content: "Study Hours | Aurora ERP" },
      {
        property: "og:description",
        content: "Self-study hours logged by students in the faculty member's sections.",
      },
    ],
  }),
  component: FacultyStudyHours,
});

function FacultyStudyHours() {
  const { faculty, sections, students, studyHours, courses } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));
  const myStudents = students.filter((s) => mySections.some((sec) => sec.id === s.sectionId));
  const [sectionId, setSectionId] = React.useState("all");

  const scoped = myStudents.filter((s) => (sectionId === "all" ? true : s.sectionId === sectionId));
  const logs = studyHours.filter((l) => scoped.some((s) => s.id === l.studentId));
  const total = logs.reduce((t, l) => t + l.hours, 0);

  const perStudent = scoped
    .map((s) => {
      const hours = logs.filter((l) => l.studentId === s.id).reduce((t, l) => t + l.hours, 0);
      return { s, hours };
    })
    .sort((a, b) => b.hours - a.hours);

  const max = perStudent[0]?.hours ?? 1;

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title="Study hours"
        description="Preparation time logged by the students you teach, for guidance during mentoring."
      />

      <div className="mb-4 max-w-xs">
        <Select value={sectionId} onValueChange={setSectionId}>
          <SelectTrigger>
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All my sections</SelectItem>
            {mySections.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total hours" value={total.toFixed(1)} hint="Logged by your students" icon={Clock} />
        <StatCard label="Students logging" value={perStudent.filter((p) => p.hours > 0).length} hint="Active learners" icon={Users} />
        <StatCard
          label="Average per student"
          value={`${scoped.length ? (total / scoped.length).toFixed(1) : "0.0"} h`}
          hint="Across the selection"
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Per student</CardTitle>
            <CardDescription>Highest first</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {perStudent.map(({ s, hours }) => (
              <div key={s.id}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {hours.toFixed(1)} h
                  </Badge>
                </div>
                <Progress value={Math.round((hours / max) * 100)} className="mt-2 h-2" />
              </div>
            ))}
            {perStudent.length === 0 && <p className="text-sm text-muted-foreground">No students in this selection.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent entries</CardTitle>
            <CardDescription>Latest 12 logs</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs
                  .slice()
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .slice(0, 12)
                  .map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="whitespace-nowrap">{l.date}</TableCell>
                      <TableCell className="min-w-0">
                        {students.find((s) => s.id === l.studentId)?.name}
                      </TableCell>
                      <TableCell>{courses.find((c) => c.id === l.courseId)?.code}</TableCell>
                      <TableCell className="text-right">{l.hours.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      Nothing logged yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <DemoNotice className="mt-6">
        Figures cover only students in your allocated sections and come from centralised mock data.
      </DemoNotice>
    </RoleWorkspace>
  );
}
