import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Megaphone, Plus } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErp } from "@/lib/erp-store";

export const Route = createFileRoute("/faculty/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements | Aurora ERP" },
      { name: "description", content: "Notices for staff plus class notices a faculty member can publish." },
      { property: "og:title", content: "Announcements | Aurora ERP" },
      {
        property: "og:description",
        content: "Notices for staff plus class notices a faculty member can publish.",
      },
    ],
  }),
  component: FacultyAnnouncements,
});

function FacultyAnnouncements() {
  const { announcements, addAnnouncement } = useErp();
  const [tab, setTab] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const visible = announcements
    .filter((a) => (tab === "all" ? true : a.audience === tab))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const submit = () => {
    if (title.trim().length < 5) return setError("Title needs at least 5 characters.");
    if (body.trim().length < 15) return setError("Message needs at least 15 characters.");
    setError(null);
    addAnnouncement({
      title: title.trim(),
      body: body.trim(),
      audience: "Students",
      date: new Date().toISOString().slice(0, 10),
    });
    toast.success("Class notice published", { description: "Visible to students in this demo session." });
    setOpen(false);
    setTitle("");
    setBody("");
  };

  return (
    <RoleWorkspace role="faculty">
      <PageHeader
        title="Announcements"
        description="Read institute notices and publish notices to your students."
        action={
          <Button onClick={() => { setError(null); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New class notice
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="All">Institute-wide</TabsTrigger>
          <TabsTrigger value="Faculty">For faculty</TabsTrigger>
          <TabsTrigger value="Students">For students</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {visible.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <CardDescription>{a.date}</CardDescription>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {a.audience === "All" ? "Everyone" : a.audience}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{a.body}</p>
            </CardContent>
          </Card>
        ))}
        {visible.length === 0 && <p className="text-sm text-muted-foreground">No announcements here.</p>}
      </div>

      <DemoNotice className="mt-6">
        Faculty can publish student-facing notices only; institute-wide notices remain with administration.
      </DemoNotice>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish a class notice</DialogTitle>
            <DialogDescription>Sent to students in this prototype session.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="an-title">Title</Label>
              <Input id="an-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="an-body">Message</Label>
              <Textarea id="an-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleWorkspace>
  );
}
