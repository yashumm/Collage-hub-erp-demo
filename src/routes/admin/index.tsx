import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, TrendingUp, UserSquare2, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useErp } from "@/lib/erp-store";
import { DEPARTMENTS } from "@/data/erp";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview | Aurora ERP" },
      {
        name: "description",
        content: "Institute-wide enrolment, staffing and activity overview for administrators.",
      },
      { property: "og:title", content: "Admin Overview | Aurora ERP" },
      {
        property: "og:description",
        content: "Institute-wide enrolment, staffing and activity overview for administrators.",
      },
    ],
  }),
  component: AdminDashboard,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function AdminDashboard() {
  const { students, faculty, courses, sections, attendance, activity, announcements } = useErp();

  const present = attendance.filter((a) => a.mark !== "absent").length;
  const attendanceRate = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

  const byDept = DEPARTMENTS.map((d) => ({
    department: d.split(" ")[0],
    students: students.filter((s) => s.department === d).length,
    faculty: faculty.filter((f) => f.department === d).length,
  }));

  const programSplit = Object.entries(
    students.reduce<Record<string, number>>((acc, s) => {
      acc[s.program] = (acc[s.program] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <RoleWorkspace role="admin">
      <PageHeader
        title="Institute overview"
        description="Consolidated snapshot of enrolment, staffing and academic activity across all departments."
        action={
          <Button asChild variant="outline">
            <Link to="/admin/hierarchy">Open hierarchy explorer</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={students.length} hint="Across 4 departments" icon={Users} />
        <StatCard label="Faculty" value={faculty.length} hint="Teaching staff on record" icon={UserSquare2} />
        <StatCard label="Courses" value={courses.length} hint={`${sections.length} active sections`} icon={BookOpen} />
        <StatCard
          label="Attendance"
          value={`${attendanceRate}%`}
          hint="Last 5 marked working days"
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department strength</CardTitle>
            <CardDescription>Students and faculty per department</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDept}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="department" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="students" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faculty" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programme mix</CardTitle>
            <CardDescription>Student distribution by programme</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={programSplit} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                  {programSplit.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--popover-foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Simulated audit trail for this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brass" />
                <div className="min-w-0 text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">{a.actor}</span> {a.action}{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{a.at}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notice board</CardTitle>
            <CardDescription>Latest announcements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.slice(0, 4).map((a, i) => (
              <div key={a.id}>
                {i > 0 && <Separator className="mb-4" />}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {a.audience}
                  </Badge>
                </div>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/announcements">Manage announcements</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleWorkspace>
  );
}
