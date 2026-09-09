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

export const Route = createFileRoute("/faculty/students")({
  head: () => ({
    meta: [
      { title: "My Students | Aurora ERP" },
      { name: "description", content: "Roster of students in the demo faculty member's assigned sections." },
      { property: "og:title", content: "My Students | Aurora ERP" },
      {
        property: "og:description",
        content: "Roster of students in the demo faculty member's assigned sections.",
      },
    ],
  }),
  component: FacultyStudents,
});

function FacultyStudents() {
  const { faculty, sections, students, attendance } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));
  const [query, setQuery] = React.useState("");
  const [sectionId, setSectionId] = React.useState("all");
  const [sort, setSort] = React.useState("name");

  const rows = students
    .filter((s) => mySections.some((sec) => sec.id === s.sectionId))
    .filter((s) => (sectionId === "all" ? true : s.sectionId === sectionId))
    .filter((s) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q);
    })
    .map((s) => {
      const recs = attendance.filter((a) => a.studentId === s.id);
      const pct = recs.length
        ? Math.round((recs.filter((a) => a.mark !== "absent").length / recs.length) * 100)
        : 0;
      return { s, pct };
    })
    .sort((a, b) =>
      sort === "cgpa" ? b.s.cgpa - a.s.cgpa : sort === "attendance" ? b.pct - a.pct : a.s.name.localeCompare(b.s.name),
    );

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title="My students"
        description={`${rows.length} students across ${mySections.length} allocated sections.`}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
        <Input placeholder="Search name or roll no…" value={query} onChange={(e) => setQuery(e.target.value)} />
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
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by name</SelectItem>
            <SelectItem value="cgpa">Sort by CGPA</SelectItem>
            <SelectItem value="attendance">Sort by attendance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          <CardDescription>Read-only view of students you teach</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">CGPA</TableHead>
                <TableHead className="text-right">Attendance</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ s, pct }) => (
                <TableRow key={s.id}>
                  <TableCell className="min-w-0">
                    <span className="block font-medium">{s.name}</span>
                    <span className="block text-xs text-muted-foreground">{s.rollNo}</span>
                  </TableCell>
                  <TableCell>{sections.find((sec) => sec.id === s.sectionId)?.label}</TableCell>
                  <TableCell className="text-right">{s.cgpa}</TableCell>
                  <TableCell className="text-right">{pct}%</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={s.status === "Active" ? "secondary" : "outline"}>{s.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No students match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DemoNotice className="mt-6">
        Only students of your allocated sections appear. Editing student records stays with administration.
      </DemoNotice>
    </RoleWorkspace>
  );
}
