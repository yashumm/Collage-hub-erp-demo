import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErp } from "@/lib/erp-store";

export const Route = createFileRoute("/student/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements | Aurora ERP" },
      { name: "description", content: "Notices published for students by administration and faculty." },
      { property: "og:title", content: "Announcements | Aurora ERP" },
      {
        property: "og:description",
        content: "Notices published for students by administration and faculty.",
      },
    ],
  }),
  component: StudentAnnouncements,
});

function StudentAnnouncements() {
  const { announcements } = useErp();
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("all");

  const visible = announcements
    .filter((a) => a.audience !== "Faculty")
    .filter((a) => (tab === "all" ? true : a.audience === tab))
    .filter((a) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
    })
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <RoleWorkspace role="student">
      <PageHeader
        title="Announcements"
        description="Only notices addressed to students or to everyone are shown here."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          placeholder="Search announcements…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="All">Institute-wide</TabsTrigger>
            <TabsTrigger value="Students">For students</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements match your search.</p>
        )}
      </div>

      <DemoNotice className="mt-6">
        Students can read notices but cannot publish them in this prototype.
      </DemoNotice>
    </RoleWorkspace>
  );
}
