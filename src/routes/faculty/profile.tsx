import { createFileRoute } from "@tanstack/react-router";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useErp } from "@/lib/erp-store";
import { CURRENT_FACULTY_ID } from "@/data/erp";

export const Route = createFileRoute("/faculty/profile")({
  head: () => ({
    meta: [
      { title: "Faculty Profile | Aurora ERP" },
      { name: "description", content: "Staff profile, department and teaching load of the demo faculty member." },
      { property: "og:title", content: "Faculty Profile | Aurora ERP" },
      {
        property: "og:description",
        content: "Staff profile, department and teaching load of the demo faculty member.",
      },
    ],
  }),
  component: FacultyProfile,
});

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 font-medium break-words">{value}</span>
    </div>
  );
}

function FacultyProfile() {
  const { faculty, sections, courses, students } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));
  const load = mySections.reduce(
    (t, s) => t + (courses.find((c) => c.id === s.courseId)?.credits ?? 0),
    0,
  );

  return (
    <RoleWorkspace role="faculty">
      <PageHeader title="My profile" description="Staff record held by the registrar's office." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Staff details</CardTitle>
            <CardDescription>Read-only registry information</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <Row label="Name" value={me?.name ?? "—"} />
            <Row label="Staff code" value={me?.code ?? "—"} />
            <Row label="Email" value={me?.email ?? "—"} />
            <Row label="Designation" value={me?.designation ?? "—"} />
            <Row label="Department" value={me?.department ?? "—"} />
            <Row label="Status" value={me?.status ?? "—"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching load</CardTitle>
            <CardDescription>Allocated sections this semester</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-border p-3">
                <p className="font-serif text-2xl font-semibold">{mySections.length}</p>
                <p className="text-xs text-muted-foreground">Sections</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="font-serif text-2xl font-semibold">
                  {students.filter((s) => mySections.some((sec) => sec.id === s.sectionId)).length}
                </p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="font-serif text-2xl font-semibold">{load}</p>
                <p className="text-xs text-muted-foreground">Credits</p>
              </div>
            </div>
            <div className="space-y-2">
              {mySections.map((s) => (
                <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <p className="truncate text-sm">
                    {s.label} · <span className="text-muted-foreground">{s.slot}</span>
                  </p>
                  <Badge variant="outline" className="shrink-0">
                    {s.room}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <DemoNotice className="mt-6">
        Profile editing is disabled — this prototype keeps all records as centralised mock data.
      </DemoNotice>
    </RoleWorkspace>
  );
}
