import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useErp } from "@/lib/erp-store";
import { CURRENT_FACULTY_ID } from "@/data/erp";

export const Route = createFileRoute("/faculty/sections")({
  head: () => ({
    meta: [
      { title: "My Sections | Aurora ERP" },
      { name: "description", content: "Class rosters for the sections assigned to this faculty member." },
      { property: "og:title", content: "My Sections | Aurora ERP" },
      {
        property: "og:description",
        content: "Class rosters for the sections assigned to this faculty member.",
      },
    ],
  }),
  component: MySections,
});

function MySections() {
  const { faculty, sections, courses, students, attendance } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));
  const [query, setQuery] = React.useState("");

  if (mySections.length === 0) {
    return (
      <RoleWorkspace role="faculty">
        <PageHeader title="My sections" />
        <p className="text-sm text-muted-foreground">No sections are allocated to you.</p>
      </RoleWorkspace>
    );
  }

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title="My sections"
        description="Rosters are restricted to the students enrolled in your allocated sections."
      />

      <Tabs defaultValue={mySections[0]!.id}>
        <TabsList className="flex-wrap">
          {mySections.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {mySections.map((s) => {
          const course = courses.find((c) => c.id === s.courseId);
          const roster = students
            .filter((st) => st.sectionId === s.id)
            .filter(
              (st) =>
                !query.trim() ||
                st.name.toLowerCase().includes(query.toLowerCase()) ||
                st.rollNo.toLowerCase().includes(query.toLowerCase()),
            );
          return (
            <TabsContent key={s.id} value={s.id} className="mt-5">
              <Card>
                <CardHeader>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{s.label}</CardTitle>
                      <CardDescription>
                        {course?.code} {course?.title} · {s.slot} · {s.room}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {students.filter((st) => st.sectionId === s.id).length} enrolled
                    </Badge>
                  </div>
                  <div className="relative mt-3">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search this roster"
                      className="pl-9"
                      aria-label="Search roster"
                    />
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll no</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Programme</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>CGPA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roster.map((st) => {
                        const recs = attendance.filter((a) => a.studentId === st.id);
                        const pct = recs.length
                          ? Math.round((recs.filter((a) => a.mark !== "absent").length / recs.length) * 100)
                          : 0;
                        return (
                          <TableRow key={st.id}>
                            <TableCell className="font-mono text-xs">{st.rollNo}</TableCell>
                            <TableCell className="font-medium">{st.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{st.program}</TableCell>
                            <TableCell>
                              <Badge variant={pct >= 75 ? "secondary" : "outline"}>{pct}%</Badge>
                            </TableCell>
                            <TableCell>{st.cgpa.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                      {roster.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                            No students match your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <DemoNotice className="mt-6">
        Only mock sections assigned to this teacher are listed; other departments' data is never loaded here.
      </DemoNotice>
    </RoleWorkspace>
  );
}
