import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Award, Plus, Trash2, Trophy } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useErp } from "@/lib/erp-store";
import { ACTIVITY_CATEGORIES, CURRENT_STUDENT_ID, type ActivityCategory } from "@/data/erp";

export const Route = createFileRoute("/student/activities")({
  head: () => ({
    meta: [
      { title: "My Activities | Aurora ERP" },
      { name: "description", content: "Co-curricular activity record and submissions for the demo student." },
      { property: "og:title", content: "My Activities | Aurora ERP" },
      {
        property: "og:description",
        content: "Co-curricular activity record and submissions for the demo student.",
      },
    ],
  }),
  component: StudentActivities,
});

const today = () => new Date().toISOString().slice(0, 10);

function StudentActivities() {
  const { studentActivities, addActivity, removeActivity } = useErp();
  const mine = studentActivities
    .filter((a) => a.studentId === CURRENT_STUDENT_ID)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const [tab, setTab] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<ActivityCategory>("Technical");
  const [date, setDate] = React.useState(today());
  const [points, setPoints] = React.useState("5");
  const [error, setError] = React.useState<string | null>(null);

  const rows = mine.filter((a) => (tab === "all" ? true : a.category === tab));
  const approvedPoints = mine.filter((a) => a.status === "Approved").reduce((t, a) => t + a.points, 0);
  const pending = mine.filter((a) => a.status === "Pending").length;

  const submit = () => {
    const p = Number(points);
    if (title.trim().length < 4) return setError("Give the activity a title of at least 4 characters.");
    if (!date || date > today()) return setError("Pick a date that is not in the future.");
    if (!Number.isFinite(p) || p < 1 || p > 50) return setError("Points must be between 1 and 50.");
    setError(null);
    addActivity({
      studentId: CURRENT_STUDENT_ID,
      title: title.trim(),
      category,
      date,
      points: p,
      status: "Pending",
    });
    toast.success("Activity submitted", { description: "It will show as pending until a mentor approves." });
    setOpen(false);
    setTitle("");
  };

  return (
    <RoleWorkspace role="student">
      <PageHeader
        title="My activities"
        description="Technical, cultural, sports and service records that count towards activity points."
        action={
          <Button onClick={() => { setError(null); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Submit activity
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Activities" value={mine.length} hint="Total submitted" icon={Trophy} />
        <StatCard label="Approved points" value={approvedPoints} hint="Counted so far" icon={Award} />
        <StatCard label="Pending review" value={pending} hint="With your mentor" icon={Trophy} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          {ACTIVITY_CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c}>
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {rows.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{a.title}</CardTitle>
                  <CardDescription>
                    {a.category} · {a.date}
                  </CardDescription>
                </div>
                <Badge variant={a.status === "Approved" ? "secondary" : "outline"} className="shrink-0">
                  {a.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <p className="text-sm text-muted-foreground">{a.points} activity points</p>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove activity"
                onClick={() => {
                  removeActivity(a.id);
                  toast.success("Activity removed");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No activities in this category yet.</p>
        )}
      </div>

      <DemoNotice className="mt-6">
        Submissions stay in this browser session — approval is simulated and no data leaves the page.
      </DemoNotice>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit an activity</DialogTitle>
            <DialogDescription>Add a co-curricular achievement to your record.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ac-title">Title</Label>
              <Input
                id="ac-title"
                placeholder="e.g. State level robotics contest"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ActivityCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="ac-date">Date</Label>
                <Input id="ac-date" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ac-points">Points claimed</Label>
                <Input
                  id="ac-points"
                  type="number"
                  min="1"
                  max="50"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleWorkspace>
  );
}
