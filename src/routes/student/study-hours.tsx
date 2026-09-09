import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Clock, Plus, Trash2, TrendingUp } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CURRENT_STUDENT_ID } from "@/data/erp";

export const Route = createFileRoute("/student/study-hours")({
  head: () => ({
    meta: [
      { title: "Study Hours | Aurora ERP" },
      { name: "description", content: "Log and review self-study hours per course as a student." },
      { property: "og:title", content: "Study Hours | Aurora ERP" },
      { property: "og:description", content: "Log and review self-study hours per course as a student." },
    ],
  }),
  component: StudentStudyHours,
});

const today = () => new Date().toISOString().slice(0, 10);

function StudentStudyHours() {
  const { courses, grades, studyHours, addStudyHours, removeStudyHours } = useErp();
  const myCourseIds = grades.filter((g) => g.studentId === CURRENT_STUDENT_ID).map((g) => g.courseId);
  const myCourses = courses.filter((c) => myCourseIds.includes(c.id));

  const mine = studyHours
    .filter((s) => s.studentId === CURRENT_STUDENT_ID)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = mine.reduce((t, s) => t + s.hours, 0);
  const target = 20;
  const [open, setOpen] = React.useState(false);
  const [courseId, setCourseId] = React.useState(myCourses[0]?.id ?? "");
  const [date, setDate] = React.useState(today());
  const [hours, setHours] = React.useState("1.5");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = () => {
    const value = Number(hours);
    if (!courseId) return setError("Choose a course.");
    if (!date) return setError("Pick a date.");
    if (date > today()) return setError("You cannot log hours for a future date.");
    if (!Number.isFinite(value) || value <= 0 || value > 12) {
      return setError("Hours must be a number between 0.5 and 12.");
    }
    setError(null);
    addStudyHours({ studentId: CURRENT_STUDENT_ID, courseId, date, hours: value, note: note.trim() || "Self study" });
    toast.success("Study hours logged", { description: `${value} h recorded for ${date}.` });
    setOpen(false);
    setNote("");
  };

  return (
    <RoleWorkspace role="student">
      <PageHeader
        title="Study hours"
        description="Track your own preparation time per course. Session-only, nothing is uploaded."
        action={
          <Button onClick={() => { setError(null); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Log hours
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total logged" value={`${total.toFixed(1)} h`} hint="All entries" icon={Clock} />
        <StatCard label="Entries" value={mine.length} hint="Study sessions" icon={TrendingUp} />
        <StatCard
          label="Daily average"
          value={`${mine.length ? (total / new Set(mine.map((s) => s.date)).size).toFixed(1) : "0.0"} h`}
          hint="Across active days"
          icon={Clock}
        />
        <StatCard
          label="Weekly target"
          value={`${Math.min(100, Math.round((total / target) * 100))}%`}
          hint={`${target} h goal`}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>My log</CardTitle>
            <CardDescription>Newest first</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {mine.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="whitespace-nowrap">{s.date}</TableCell>
                    <TableCell className="min-w-0">
                      {courses.find((c) => c.id === s.courseId)?.code ?? s.courseId}
                    </TableCell>
                    <TableCell className="min-w-0 text-muted-foreground">{s.note}</TableCell>
                    <TableCell className="text-right font-medium">{s.hours.toFixed(1)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete entry"
                        onClick={() => {
                          removeStudyHours(s.id);
                          toast.success("Entry removed");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {mine.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      Nothing logged yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Hours by course</CardTitle>
            <CardDescription>Share of your study time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {myCourses.map((c) => {
              const h = mine.filter((s) => s.courseId === c.id).reduce((t, s) => t + s.hours, 0);
              const pct = total ? Math.round((h / total) * 100) : 0;
              return (
                <div key={c.id}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <p className="truncate text-sm font-medium">
                      {c.code} · {c.title}
                    </p>
                    <Badge variant="secondary" className="shrink-0">
                      {h.toFixed(1)} h
                    </Badge>
                  </div>
                  <Progress value={pct} className="mt-2 h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <DemoNotice className="mt-6">
        Study hours are personal to this student and stored only in the current browser session.
      </DemoNotice>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log study hours</DialogTitle>
            <DialogDescription>Record time spent preparing for one of your courses.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {myCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} · {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="sh-date">Date</Label>
                <Input id="sh-date" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sh-hours">Hours</Label>
                <Input
                  id="sh-hours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sh-note">Note</Label>
              <Input
                id="sh-note"
                placeholder="Revision, assignment, lab prep…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Save entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleWorkspace>
  );
}
