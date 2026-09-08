import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarCheck, TrendingUp, Users } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useErp } from "@/lib/erp-store";
import { CURRENT_FACULTY_ID } from "@/data/erp";

export const Route = createFileRoute("/faculty/")({
  head: () => ({
    meta: [
      { title: "Faculty Overview | Aurora ERP" },
      { name: "description", content: "Assigned sections, class strength and attendance health for a teacher." },
      { property: "og:title", content: "Faculty Overview | Aurora ERP" },
      {
        property: "og:description",
        content: "Assigned sections, class strength and attendance health for a teacher.",
      },
    ],
  }),
  component: FacultyDashboard,
});

function FacultyDashboard() {
  const { faculty, sections, courses, students, attendance, announcements } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));
  const myStudents = students.filter((s) => mySections.some((sec) => sec.id === s.sectionId));
  const myAttendance = attendance.filter((a) => mySections.some((s) => s.id === a.sectionId));
  const rate = myAttendance.length
    ? Math.round((myAttendance.filter((a) => a.mark !== "absent").length / myAttendance.length) * 100)
    : 0;
  const notices = announcements.filter((a) => a.audience !== "Students");

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title={`Welcome, ${me?.name ?? "Faculty"}`}
        description="Everything below is limited to the sections allocated to you."
        action={
          <Button asChild>
            <Link to="/faculty/attendance">Mark attendance</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sections" value={mySections.length} hint="Allocated to you" icon={BookOpen} />
        <StatCard label="Students" value={myStudents.length} hint="Across your sections" icon={Users} />
        <StatCard label="Attendance" value={`${rate}%`} hint="Your sections, last 5 days" icon={TrendingUp} />
        <StatCard label="Classes / week" value={mySections.length * 2} hint="From the timetable" icon={CalendarCheck} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>My sections</CardTitle>
            <CardDescription>Attendance health per section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {mySections.map((s) => {
              const course = courses.find((c) => c.id === s.courseId);
              const recs = attendance.filter((a) => a.sectionId === s.id);
              const pct = recs.length
                ? Math.round((recs.filter((a) => a.mark !== "absent").length / recs.length) * 100)
                : 0;
              return (
                <div key={s.id}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{s.label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {course?.title} · {s.slot} · {s.room}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {pct}%
                    </Badge>
                  </div>
                  <Progress value={pct} className="mt-2 h-2" />
                </div>
              );
            })}
            {mySections.length === 0 && (
              <p className="text-sm text-muted-foreground">No sections are allocated to you yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Notices for staff</CardTitle>
            <CardDescription>Published by administration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notices.map((a) => (
              <div key={a.id}>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
              </div>
            ))}
            {notices.length === 0 && <p className="text-sm text-muted-foreground">Nothing new.</p>}
          </CardContent>
        </Card>
      </div>

      <DemoNotice className="mt-6">
        Faculty screens show only mock sections and students assigned to this teacher. Role access is
        demonstrative only — there is no login or real authorisation.
      </DemoNotice>
    </RoleWorkspace>
  );
}
