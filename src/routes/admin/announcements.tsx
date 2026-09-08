import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErp } from "@/lib/erp-store";

export const Route = createFileRoute("/admin/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements | Aurora ERP" },
      { name: "description", content: "Publish and remove notice-board announcements for staff and students." },
      { property: "og:title", content: "Announcements | Aurora ERP" },
      {
        property: "og:description",
        content: "Publish and remove notice-board announcements for staff and students.",
      },
    ],
  }),
  component: AnnouncementsPage,
});

const schema = z.object({
  title: z.string().min(5, "Give the notice a clear title (min 5 characters)"),
  body: z.string().min(10, "Add at least 10 characters of detail"),
  audience: z.enum(["All", "Faculty", "Students"]),
});

function AnnouncementsPage() {
  const { announcements, addAnnouncement, removeAnnouncement } = useErp();
  const [tab, setTab] = React.useState("All");
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState({ title: "", body: "", audience: "All" as const });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const visible = announcements.filter((a) => tab === "All" || a.audience === tab);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields");
      return;
    }
    addAnnouncement({ ...parsed.data, date: new Date().toISOString().slice(0, 10) });
    toast.success("Announcement published");
    setValues({ title: "", body: "", audience: "All" });
    setErrors({});
    setOpen(false);
  };

  return (
    <RoleWorkspace role="admin">
      <PageHeader
        title="Announcements"
        description="Notices shown on the dashboards of the selected audience."
        action={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New announcement
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Faculty">Faculty</TabsTrigger>
          <TabsTrigger value="Students">Students</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {visible.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <CardDescription>
                    {a.date} · {a.audience}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    removeAnnouncement(a.id);
                    toast.success("Announcement removed");
                  }}
                  aria-label={`Delete ${a.title}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{a.body}</p>
              <Badge variant="outline" className="mt-3">
                {a.audience}
              </Badge>
            </CardContent>
          </Card>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements for this audience yet.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New announcement</DialogTitle>
            <DialogDescription>Published to the demo notice board immediately.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4">
            <div>
              <Label htmlFor="atitle">Title</Label>
              <Input
                id="atitle"
                value={values.title}
                onChange={(e) => setValues({ ...values, title: e.target.value })}
              />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="abody">Details</Label>
              <Textarea
                id="abody"
                rows={4}
                value={values.body}
                onChange={(e) => setValues({ ...values, body: e.target.value })}
              />
              {errors.body && <p className="mt-1 text-xs text-destructive">{errors.body}</p>}
            </div>
            <div>
              <Label>Audience</Label>
              <Select
                value={values.audience}
                onValueChange={(v) => setValues({ ...values, audience: v as typeof values.audience })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Everyone</SelectItem>
                  <SelectItem value="Faculty">Faculty only</SelectItem>
                  <SelectItem value="Students">Students only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </RoleWorkspace>
  );
}
