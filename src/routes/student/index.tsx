import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarCheck, Clock, GraduationCap } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useErp } from "@/lib/erp-store";
import { CURRENT_STUDENT_ID, gradeFor } from "@/data/erp";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Overview | Aurora ERP" },
      { name: "description", content: "Attendance, marks, study hours and notices for one student." },
      { property: "og:title", content: "Student Overview | Aurora ERP" },
      {
        property: "og:description",
        content: "Attendance, marks, study hours and notices for one student.",
      },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { students, courses, grades, attendance, studyHours, studentActivities, announcements } =
    useErp();
  const me = students.find((s) => s.id === CURRENT_STUDENT_ID);

  const myAttendance = attendance.filter((a) => a.studentId === CURRENT_STUDENT_ID);
  const pct = myAttendance.length
    ? Math.round((myAttendance.filter((a) => a.mark !== "absent").length / myAttendance.length) * 100)
    : 0;
  const myGrades = grades.filter((g) => g.studentId === CURRENT_STUDENT_ID);
  const hours = studyHours
    .filter((s) => s.studentId === CURRENT_STUDENT_ID)
    .reduce((t, s) => t + s.hours, 0);
  const myActivities = studentActivities.filter((a) => a.studentId === CURRENT_STUDENT_ID);
  const notices = announcements.filter((a) => a.audience !== "Faculty");

  return (
    <RoleWorkspace role="student">
      <PageHeader
        title={`Hello, ${me?.name ?? "Student"}`}
        description={`${me?.rollNo ?? ""} · ${me?.program ?? ""} ${me?.department ?? ""} · Semester ${me?.semester ?? ""}`}
        action={
          <Button asChild>
            <Link to="/student/study-hours">Log study hours</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attendance" value={`${pct}%`} hint="Last 5 working days" icon={CalendarCheck} />
        <StatCard label="Enrolled courses" value={myGrades.length} hint="This semester" icon={BookOpen} />
        <StatCard label="CGPA" value={me?.cgpa ?? "—"} hint="Cumulative" icon={GraduationCap} />
        <StatCard label="Study hours" value={hours.toFixed(1)} hint="Logged this week" icon={Clock} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Course performance</CardTitle>
            <CardDescription>Internal /40 and external /60 marks recorded for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {myGrades.map((g) => {
              const course = courses.find((c) => c.id === g.courseId);
              const total = g.internal + g.external;
              return (
                <div key={g.id}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {course?.code} · {course?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Internal {g.internal}/40 · External {g.external}/60
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {total}/100 · {gradeFor(total).grade}
                    </Badge>
                  </div>
                  <Progress value={total} className="mt-2 h-2" />
                </div>
              );
            })}
            {myGrades.length === 0 && (
              <p className="text-sm text-muted-foreground">No marks published yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notices for you</CardTitle>
              <CardDescription>From administration and faculty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.slice(0, 3).map((a) => (
                <div key={a.id}>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
                </div>
              ))}
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/student/announcements">View all announcements</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My activities</CardTitle>
              <CardDescription>Co-curricular record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myActivities.map((a) => (
                <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate text-sm">{a.title}</p>
                  <Badge variant={a.status === "Approved" ? "secondary" : "outline"} className="shrink-0">
                    {a.status}
                  </Badge>
                </div>
              ))}
              {myActivities.length === 0 && (
                <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DemoNotice className="mt-6">
        This workspace shows only this student's own mock records. Role access is demonstrative — there
        is no login, backend or real security.
      </DemoNotice>
    </RoleWorkspace>
  );
}
