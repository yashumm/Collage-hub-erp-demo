import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Award, Trophy } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useErp } from "@/lib/erp-store";
import { ACTIVITY_CATEGORIES, CURRENT_FACULTY_ID } from "@/data/erp";

export const Route = createFileRoute("/faculty/activities")({
  head: () => ({
    meta: [
      { title: "Student Activities | Aurora ERP" },
      { name: "description", content: "Co-curricular submissions from students in the faculty member's sections." },
      { property: "og:title", content: "Student Activities | Aurora ERP" },
      {
        property: "og:description",
        content: "Co-curricular submissions from students in the faculty member's sections.",
      },
    ],
  }),
  component: FacultyActivities,
});

function FacultyActivities() {
  const { faculty, sections, students, studentActivities, log } = useErp();
  const me = faculty.find((f) => f.id === CURRENT_FACULTY_ID);
  const mySections = sections.filter((s) => me?.sections.includes(s.id));
  const myStudents = students.filter((s) => mySections.some((sec) => sec.id === s.sectionId));

  const [tab, setTab] = React.useState("all");
  const [query, setQuery] = React.useState("");

  const rows = studentActivities
    .filter((a) => myStudents.some((s) => s.id === a.studentId))
    .filter((a) => (tab === "all" ? true : a.category === tab))
    .filter((a) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const student = students.find((s) => s.id === a.studentId);
      return a.title.toLowerCase().includes(q) || (student?.name ?? "").toLowerCase().includes(q);
    })
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const pending = rows.filter((a) => a.status === "Pending").length;
  const points = rows.filter((a) => a.status === "Approved").reduce((t, a) => t + a.points, 0);

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title="Student activities"
        description="Mentor view of co-curricular records for students in your sections."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Submissions" value={rows.length} hint="In your sections" icon={Trophy} />
        <StatCard label="Pending review" value={pending} hint="Awaiting mentor action" icon={Trophy} />
        <StatCard label="Approved points" value={points} hint="Credited so far" icon={Award} />
      </div>

      <div className="mt-6 mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input placeholder="Search activity or student…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {ACTIVITY_CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>Acknowledge entries as a demo mentor action</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="min-w-0">{students.find((s) => s.id === a.studentId)?.name}</TableCell>
                  <TableCell className="min-w-0">
                    <span className="block">{a.title}</span>
                    <span className="block text-xs text-muted-foreground">{a.date}</span>
                  </TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell className="text-right">{a.points}</TableCell>
                  <TableCell className="text-right">
                    {a.status === "Approved" ? (
                      <Badge variant="secondary">Approved</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          log("acknowledged activity", a.title);
                          toast.success("Acknowledged", {
                            description: "Demo action — approval is not persisted.",
                          });
                        }}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    No submissions match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DemoNotice className="mt-6">
        Only your own students' activities are visible, and approvals are simulated in this session.
      </DemoNotice>
    </RoleWorkspace>
  );
}
