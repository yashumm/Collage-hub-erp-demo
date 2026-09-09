import { createFileRoute } from "@tanstack/react-router";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useErp } from "@/lib/erp-store";
import { CURRENT_STUDENT_ID } from "@/data/erp";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | Aurora ERP" },
      { name: "description", content: "Personal and academic profile details of the signed-in demo student." },
      { property: "og:title", content: "My Profile | Aurora ERP" },
      {
        property: "og:description",
        content: "Personal and academic profile details of the signed-in demo student.",
      },
    ],
  }),
  component: StudentProfile,
});

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 font-medium break-words">{value}</span>
    </div>
  );
}

function StudentProfile() {
  const { students, sections, courses, faculty, grades } = useErp();
  const me = students.find((s) => s.id === CURRENT_STUDENT_ID);
  const section = sections.find((s) => s.id === me?.sectionId);
  const course = courses.find((c) => c.id === section?.courseId);
  const mentor = faculty.find((f) => f.id === section?.facultyId);
  const credits = grades
    .filter((g) => g.studentId === CURRENT_STUDENT_ID)
    .reduce((t, g) => t + (courses.find((c) => c.id === g.courseId)?.credits ?? 0), 0);

  return (
    <RoleWorkspace role="student">
      <PageHeader
        title="My profile"
        description="Registry information held for you. Students have read-only access to these details."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Maintained by the registrar's office</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <Row label="Full name" value={me?.name ?? "—"} />
            <Row label="Roll number" value={me?.rollNo ?? "—"} />
            <Row label="Email" value={me?.email ?? "—"} />
            <Row label="Status" value={me?.status ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic details</CardTitle>
            <CardDescription>Programme, department and progress</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <Row label="Programme" value={me?.program ?? "—"} />
            <Row label="Department" value={me?.department ?? "—"} />
            <Row label="Semester" value={me?.semester ?? "—"} />
            <Row label="CGPA" value={me?.cgpa ?? "—"} />
            <Row label="Credits enrolled" value={credits} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Home section</CardTitle>
            <CardDescription>Class allocation and faculty in charge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{section?.label ?? "Not allocated"}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {course?.title} · {section?.slot} · Room {section?.room}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {course?.credits ?? 0} credits
              </Badge>
            </div>
            <Separator className="my-4" />
            <p className="text-sm">
              <span className="text-muted-foreground">Faculty in charge: </span>
              <span className="font-medium">{mentor?.name ?? "—"}</span>
              {mentor && (
                <span className="text-muted-foreground"> · {mentor.designation}</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <DemoNotice className="mt-6">
        Profile editing is intentionally disabled in this prototype — records are centralised mock data
        and nothing is stored anywhere.
      </DemoNotice>
    </RoleWorkspace>
  );
}
