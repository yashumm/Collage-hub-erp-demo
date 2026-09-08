import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, ChevronRight, GraduationCap, Layers, School, Users } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hierarchy, type HierarchyNode } from "@/data/erp";

export const Route = createFileRoute("/admin/hierarchy")({
  head: () => ({
    meta: [
      { title: "Hierarchy Explorer | Aurora ERP" },
      {
        name: "description",
        content: "Explore the institute, school, department, programme and section structure.",
      },
      { property: "og:title", content: "Hierarchy Explorer | Aurora ERP" },
      {
        property: "og:description",
        content: "Explore the institute, school, department, programme and section structure.",
      },
    ],
  }),
  component: HierarchyPage,
});

const ICON: Record<HierarchyNode["kind"], React.ElementType> = {
  institute: Building2,
  school: School,
  department: Layers,
  program: GraduationCap,
  section: Users,
};

function allIds(node: HierarchyNode): string[] {
  return [node.id, ...(node.children ?? []).flatMap(allIds)];
}

function matches(node: HierarchyNode, q: string): boolean {
  if (!q) return true;
  return (
    node.name.toLowerCase().includes(q) ||
    (node.meta ?? "").toLowerCase().includes(q) ||
    (node.children ?? []).some((c) => matches(c, q))
  );
}

function Node({
  node,
  depth,
  expanded,
  toggle,
  select,
  selectedId,
  query,
}: {
  node: HierarchyNode;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  select: (n: HierarchyNode) => void;
  selectedId: string;
  query: string;
}) {
  if (!matches(node, query)) return null;
  const Icon = ICON[node.kind];
  const hasChildren = !!node.children?.length;
  const isOpen = expanded.has(node.id) || !!query;

  return (
    <div>
      <div
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
          selectedId === node.id ? "bg-secondary" : "hover:bg-muted",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          className="grid h-5 w-5 shrink-0 place-items-center text-muted-foreground"
          onClick={() => hasChildren && toggle(node.id)}
          aria-label={hasChildren ? `Toggle ${node.name}` : node.name}
        >
          {hasChildren ? (
            <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-border" />
          )}
        </button>
        <button className="flex min-w-0 items-center gap-2 text-left" onClick={() => select(node)}>
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{node.name}</span>
        </button>
        <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
          {node.kind}
        </Badge>
      </div>
      {hasChildren && isOpen && (
        <div>
          {node.children!.map((c) => (
            <Node
              key={c.id}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              select={select}
              selectedId={selectedId}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HierarchyPage() {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(["h-root", "h-soe", "h-cs", "h-cs-btech"]),
  );
  const [selected, setSelected] = React.useState<HierarchyNode>(hierarchy);
  const [query, setQuery] = React.useState("");

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const SelectedIcon = ICON[selected.kind];

  return (
    <RoleWorkspace role="admin">
      <PageHeader
        title="Hierarchy explorer"
        description="Institute → school → department → programme → section. Select any node to inspect it."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExpanded(new Set(allIds(hierarchy)))}>
              Expand all
            </Button>
            <Button variant="outline" onClick={() => setExpanded(new Set(["h-root"]))}>
              Collapse
            </Button>
          </div>
        }
      />

      <DemoNotice className="mb-6">
        This explorer visualises the academic structure only. Frontend role access in this prototype is{" "}
        <strong className="text-foreground">demonstrative only</strong> — there is no authentication,
        no server-side authorisation and no real security behind these views.
      </DemoNotice>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Structure</CardTitle>
            <CardDescription>Search filters the tree across every level</CardDescription>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value.toLowerCase())}
              placeholder="Search departments, programmes, sections…"
              className="mt-3"
              aria-label="Search hierarchy"
            />
          </CardHeader>
          <CardContent>
            <Node
              node={hierarchy}
              depth={0}
              expanded={expanded}
              toggle={toggle}
              select={setSelected}
              selectedId={selected.id}
              query={query}
            />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SelectedIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Badge variant="secondary" className="capitalize">
                {selected.kind}
              </Badge>
            </div>
            <CardTitle className="mt-2 text-lg">{selected.name}</CardTitle>
            {selected.meta && <CardDescription>{selected.meta}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Direct children</span>
              <span className="font-medium">{selected.children?.length ?? 0}</span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Nodes below</span>
              <span className="font-medium">{allIds(selected).length - 1}</span>
            </p>
            {selected.children?.length ? (
              <div>
                <p className="mb-2 text-muted-foreground">Contains</p>
                <div className="flex flex-wrap gap-1">
                  {selected.children.map((c) => (
                    <Badge key={c.id} variant="outline" className="text-[11px]">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">This is a leaf node.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleWorkspace>
  );
}
