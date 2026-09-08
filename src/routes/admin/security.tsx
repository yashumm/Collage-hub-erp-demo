import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, ShieldAlert } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { permissionMatrix } from "@/data/erp";

export const Route = createFileRoute("/admin/security")({
  head: () => ({
    meta: [
      { title: "Security & Permissions | Aurora ERP" },
      {
        name: "description",
        content: "Illustrative role capability matrix for the Aurora ERP frontend prototype.",
      },
      { property: "og:title", content: "Security & Permissions | Aurora ERP" },
      {
        property: "og:description",
        content: "Illustrative role capability matrix for the Aurora ERP frontend prototype.",
      },
    ],
  }),
  component: SecurityPage,
});

const Yes = () => <Check className="mx-auto h-4 w-4 text-success" aria-label="allowed" />;
const No = () => <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="not allowed" />;

function SecurityPage() {
  return (
    <RoleWorkspace role="admin">
      <PageHeader
        title="Security & permissions"
        description="How capabilities are intended to be split between roles in a real deployment."
      />

      <Alert className="mb-6 border-destructive/40 bg-destructive/5">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Frontend role access is demonstrative only</AlertTitle>
        <AlertDescription>
          This prototype has no authentication, no server and no enforcement. Roles here only change which
          screens are rendered in the browser, and anyone can switch roles freely. Nothing on this page is a
          security claim — real permission checks must live on a backend.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Capability matrix</CardTitle>
          <CardDescription>Intended design, shown for demonstration purposes</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Faculty</TableHead>
                <TableHead className="text-center">Student</TableHead>
                <TableHead className="hidden md:table-cell">Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionMatrix.map((row) => (
                <TableRow key={row.capability}>
                  <TableCell className="font-medium">{row.capability}</TableCell>
                  <TableCell className="text-center">{row.admin ? <Yes /> : <No />}</TableCell>
                  <TableCell className="text-center">{row.faculty ? <Yes /> : <No />}</TableCell>
                  <TableCell className="text-center">{row.student ? <Yes /> : <No />}</TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {row.note}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Data scoping",
            body: "Faculty screens read only their assigned sections; student screens read only that student's own records.",
          },
          {
            title: "No credentials",
            body: "There is no password, token or session — the role switcher simply changes the rendered workspace.",
          },
          {
            title: "Session-only data",
            body: "Every add, edit and delete lives in browser memory and resets on reload.",
          },
        ].map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                Prototype note
              </Badge>
              <CardTitle className="mt-2 text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{c.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DemoNotice className="mt-6">
        Reminder: the role-based views in this prototype are illustrative UI behaviour, not access control.
      </DemoNotice>
    </RoleWorkspace>
  );
}
