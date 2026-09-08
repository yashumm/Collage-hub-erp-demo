import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, Save, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useErp } from "@/lib/erp-store";
import { CURRENT_FACULTY_ID, type AttendanceMark } from "@/data/erp";

export const Route = createFileRoute("/faculty/attendance")({
  head: () => ({
    meta: [
      { title: "Mark Attendance | Aurora ERP" },
      { name: "description", content: "Mark daily attendance for an assigned section in the ERP prototype." },
      { property: "og:title", content: "Mark Attendance | Aurora ERP" },
      {
        property: "og:description",
        content: "Mark daily attendance for an assigned section in the ERP prototype.",
      },
    ],
  }),
  component: AttendancePage,
});

const MARKS: { value: AttendanceMark; label: string; icon: React.ElementType }[] = [
  { value: "present", label: "Present", icon: CheckCircle2 },
  { value: "late", label: "Late", icon: Clock },
  { value: "absent", label: "Absent", icon: XCircle },
];

function AttendancePage() {
  const { faculty, sections, courses, students, attendance, setAttendance } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));

  const [sectionId, setSectionId] = React.useState(mySections[0]?.id ?? "");
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const roster = students.filter((s) => s.sectionId === sectionId);

  const existing = React.useMemo(() => {
    const map: Record<string, AttendanceMark> = {};
    for (const r of attendance.filter((a) => a.sectionId === sectionId && a.date === date)) {
      map[r.studentId] = r.mark;
    }
    return map;
  }, [attendance, sectionId, date]);

  const [marks, setMarks] = React.useState<Record<string, AttendanceMark>>({});
  React.useEffect(() => {
    setMarks(Object.fromEntries(roster.map((s) => [s.id, existing[s.id] ?? "present"])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, date, roster.length]);

  const counts = MARKS.map((m) => ({
    ...m,
    count: Object.values(marks).filter((v) => v === m.value).length,
  }));

  const section = sections.find((s) => s.id === sectionId);
  const course = courses.find((c) => c.id === section?.courseId);

  const save = () => {
    if (!sectionId || roster.length === 0) {
      toast.error("Nothing to save for this section");
      return;
    }
    if (new Date(date) > new Date()) {
      toast.error("You cannot mark attendance for a future date");
      return;
    }
    setAttendance(sectionId, date, marks);
    toast.success(`Attendance saved for ${section?.label} on ${date}`);
  };

  if (mySections.length === 0) {
    return (
      <RoleWorkspace role="faculty">
        <PageHeader title="Attendance" />
        <p className="text-sm text-muted-foreground">No sections are allocated to you.</p>
      </RoleWorkspace>
    );
  }

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title="Mark attendance"
        description="Choose one of your sections and a date, then tap a state for each student."
        action={
          <Button className="gap-2" onClick={save}>
            <Save className="h-4 w-4" /> Save register
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <Label>Section</Label>
              <Select value={sectionId} onValueChange={setSectionId}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mySections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                className="mt-1 sm:w-44"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <CardDescription className="pt-2">
            {course ? `${course.code} ${course.title} · ${section?.slot} · ${section?.room}` : ""}
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            {counts.map((c) => (
              <Badge key={c.value} variant="outline">
                {c.label}: {c.count}
              </Badge>
            ))}
            <Badge variant="secondary">Roster: {roster.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMarks(Object.fromEntries(roster.map((s) => [s.id, "present" as AttendanceMark])))}
            >
              Mark all present
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMarks(Object.fromEntries(roster.map((s) => [s.id, "absent" as AttendanceMark])))}
            >
              Mark all absent
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {roster.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-[minmax(0,1fr)] items-center gap-3 rounded-md border border-border p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{s.rollNo}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {MARKS.map((m) => {
                  const Icon = m.icon;
                  const active = marks[s.id] === m.value;
                  return (
                    <Button
                      key={m.value}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className={cn("gap-1.5", active && m.value === "absent" && "bg-destructive hover:bg-destructive/90")}
                      onClick={() => setMarks({ ...marks, [s.id]: m.value })}
                    >
                      <Icon className="h-3.5 w-3.5" /> {m.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
          {roster.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No students are enrolled in this section.
            </p>
          )}
        </CardContent>
      </Card>

      <DemoNotice className="mt-6">
        Saved registers stay in this browser session only and reset when the page is reloaded.
      </DemoNotice>
    </RoleWorkspace>
  );
}
