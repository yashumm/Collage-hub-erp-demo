import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldAlert, X } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { permissionMatrix } from "@/data/erp";

export const Route = createFileRoute("/student/security")({
  head: () => ({
    meta: [
      { title: "Access & Privacy | Aurora ERP" },
      { name: "description", content: "What a student can and cannot do in this frontend-only prototype." },
      { property: "og:title", content: "Access & Privacy | Aurora ERP" },
      {
        property: "og:description",
        content: "What a student can and cannot do in this frontend-only prototype.",
      },
    ],
  }),
  component: StudentSecurity,
});

function StudentSecurity() {
  return (
    <RoleWorkspace role="student">
      <PageHeader
        title="Access & privacy"
        description="A plain summary of what this student role can reach in the demo."
      />

      <Alert className="mb-6">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Frontend role access is demonstrative only</AlertTitle>
        <AlertDescription>
          This prototype has no login, no server and no database. Role separation is presentational: it
          shapes the screens you see but enforces nothing, so it must not be treated as real security or
          privacy protection.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Your capabilities</CardTitle>
          <CardDescription>Student column of the institute capability matrix</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                <TableHead className="text-center">Student</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionMatrix.map((row) => (
                <TableRow key={row.capability}>
                  <TableCell className="min-w-0 font-medium">{row.capability}</TableCell>
                  <TableCell className="text-center">
                    {row.student ? (
                      <Check className="mx-auto h-4 w-4 text-primary" aria-label="Allowed" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Not allowed" />
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </RoleWorkspace>
  );
}
