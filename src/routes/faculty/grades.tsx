import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useErp } from "@/lib/erp-store";
import { CURRENT_FACULTY_ID, gradeFor } from "@/data/erp";

export const Route = createFileRoute("/faculty/grades")({
  head: () => ({
    meta: [
      { title: "Marks Entry | Aurora ERP" },
      { name: "description", content: "Enter internal and external marks for students in assigned sections." },
      { property: "og:title", content: "Marks Entry | Aurora ERP" },
      {
        property: "og:description",
        content: "Enter internal and external marks for students in assigned sections.",
      },
    ],
  }),
  component: GradesEntry,
});

function GradesEntry() {
  const { faculty, sections, courses, students, grades, setGrade } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));
  const [sectionId, setSectionId] = React.useState(mySections[0]?.id ?? "");

  const section = sections.find((s) => s.id === sectionId);
  const course = courses.find((c) => c.id === section?.courseId);
  const roster = students.filter((s) => s.sectionId === sectionId);

  const [draft, setDraft] = React.useState<Record<string, { internal: string; external: string }>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const next: Record<string, { internal: string; external: string }> = {};
    for (const st of roster) {
      const g = grades.find((x) => x.studentId === st.id && x.courseId === course?.id);
      next[st.id] = { internal: String(g?.internal ?? ""), external: String(g?.external ?? "") };
    }
    setDraft(next);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, roster.length, course?.id]);

  const save = () => {
    if (!course) {
      toast.error("This section has no linked course");
      return;
    }
    const nextErrors: Record<string, string> = {};
    for (const st of roster) {
      const d = draft[st.id];
      const internal = Number(d?.internal);
      const external = Number(d?.external);
      if (d?.internal === "" || Number.isNaN(internal) || internal < 0 || internal > 40) {
        nextErrors[st.id] = "Internal must be 0–40";
      } else if (d?.external === "" || Number.isNaN(external) || external < 0 || external > 60) {
        nextErrors[st.id] = "External must be 0–60";
      }
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error("Some marks are out of range");
      return;
    }
    for (const st of roster) {
      setGrade(st.id, course.id, Number(draft[st.id]!.internal), Number(draft[st.id]!.external));
    }
    setErrors({});
    toast.success(`Marks saved for ${section?.label}`);
  };

  if (mySections.length === 0) {
    return (
      <RoleWorkspace role="faculty">
        <PageHeader title="Marks entry" />
        <p className="text-sm text-muted-foreground">No sections are allocated to you.</p>
      </RoleWorkspace>
    );
  }

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title="Marks entry"
        description="Internal is out of 40 and external out of 60; the grade updates as you type."
        action={
          <Button className="gap-2" onClick={save}>
            <Save className="h-4 w-4" /> Save marks
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="max-w-sm">
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
          <CardTitle className="pt-3 text-base">{section?.label}</CardTitle>
          <CardDescription>
            {course ? `${course.code} ${course.title} · ${course.credits} credits` : "No linked course"}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll no</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="w-28">Internal /40</TableHead>
                <TableHead className="w-28">External /60</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((st) => {
                const d = draft[st.id] ?? { internal: "", external: "" };
                const total = Number(d.internal || 0) + Number(d.external || 0);
                const g = gradeFor(total);
                return (
                  <TableRow key={st.id}>
                    <TableCell className="font-mono text-xs">{st.rollNo}</TableCell>
                    <TableCell>
                      <p className="font-medium">{st.name}</p>
                      {errors[st.id] && <p className="text-xs text-destructive">{errors[st.id]}</p>}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={d.internal}
                        onChange={(e) => setDraft({ ...draft, [st.id]: { ...d, internal: e.target.value } })}
                        aria-label={`Internal marks for ${st.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={d.external}
                        onChange={(e) => setDraft({ ...draft, [st.id]: { ...d, external: e.target.value } })}
                        aria-label={`External marks for ${st.name}`}
                      />
                    </TableCell>
                    <TableCell>{total}</TableCell>
                    <TableCell>
                      <Badge variant={g.grade === "F" ? "destructive" : "secondary"}>{g.grade}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {roster.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No students are enrolled in this section.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DemoNotice className="mt-6">
        You can only enter marks for sections assigned to you; entries are session-only.
      </DemoNotice>
    </RoleWorkspace>
  );
}
