import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarCheck, CircleAlert, Clock3 } from "lucide-react";
import { useErp } from "@/lib/erp-store";
import { CURRENT_STUDENT_ID } from "@/data/erp";

export const Route = createFileRoute("/student/attendance")({
  head: () => ({
    meta: [
      { title: "My Attendance | Aurora ERP" },
      { name: "description", content: "Day-wise attendance record for the demo student." },
      { property: "og:title", content: "My Attendance | Aurora ERP" },
      { property: "og:description", content: "Day-wise attendance record for the demo student." },
    ],
  }),
  component: StudentAttendance,
});

const MARK_LABEL = { present: "Present", late: "Late", absent: "Absent" } as const;

function StudentAttendance() {
  const { attendance, sections, courses } = useErp();
  const [filter, setFilter] = React.useState("all");

  const mine = attendance
    .filter((a) => a.studentId === CURRENT_STUDENT_ID)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const present = mine.filter((a) => a.mark === "present").length;
  const late = mine.filter((a) => a.mark === "late").length;
  const absent = mine.filter((a) => a.mark === "absent").length;
  const pct = mine.length ? Math.round(((present + late) / mine.length) * 100) : 0;

  const rows = mine.filter((a) => (filter === "all" ? true : a.mark === filter));

  const bySection = Array.from(new Set(mine.map((a) => a.sectionId))).map((sectionId) => {
    const recs = mine.filter((a) => a.sectionId === sectionId);
    const section = sections.find((s) => s.id === sectionId);
    const course = courses.find((c) => c.id === section?.courseId);
    return {
      sectionId,
      label: section?.label ?? sectionId,
      course: course?.title ?? "",
      pct: Math.round((recs.filter((r) => r.mark !== "absent").length / recs.length) * 100),
    };
  });

  return (
    <RoleWorkspace role="student">
      <PageHeader
        title="My attendance"
        description="Marked by your faculty. Students can view but not edit these entries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Overall" value={`${pct}%`} hint="Present + late" icon={CalendarCheck} />
        <StatCard label="Present" value={present} hint="Classes attended" icon={CalendarCheck} />
        <StatCard label="Late" value={late} hint="Counted as attended" icon={Clock3} />
        <StatCard label="Absent" value={absent} hint="Missed classes" icon={CircleAlert} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_160px] items-start gap-3">
            <div className="min-w-0">
              <CardTitle>Day-wise register</CardTitle>
              <CardDescription>Most recent classes first</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All marks</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right">Mark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const section = sections.find((s) => s.id === r.sectionId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{r.date}</TableCell>
                      <TableCell className="min-w-0">{section?.label ?? r.sectionId}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            r.mark === "present" ? "secondary" : r.mark === "late" ? "outline" : "destructive"
                          }
                        >
                          {MARK_LABEL[r.mark]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      No entries for this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Per section</CardTitle>
            <CardDescription>Attendance percentage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {bySection.map((s) => (
              <div key={s.sectionId}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.course}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {s.pct}%
                  </Badge>
                </div>
                <Progress value={s.pct} className="mt-2 h-2" />
              </div>
            ))}
            {bySection.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing marked yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <DemoNotice className="mt-6">
        These records belong to this student only. Attendance is mock data held in the browser session.
      </DemoNotice>
    </RoleWorkspace>
  );
}
