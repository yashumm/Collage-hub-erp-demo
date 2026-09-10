import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useErp } from "@/lib/erp-store";
import { COLLEGE, type Department } from "@/data/erp";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({
    meta: [
      { title: "Departments | Aurora ERP" },
      {
        name: "description",
        content: "Create and review the departments that sit directly under the college.",
      },
      { property: "og:title", content: "Departments | Aurora ERP" },
      {
        property: "og:description",
        content: "Create and review the departments that sit directly under the college.",
      },
    ],
  }),
  component: DepartmentsPage,
});

const schema = z.object({
  name: z.string().min(3, "Department name is required"),
  code: z.string().min(2, "Department code is required (e.g. CSE)"),
  description: z.string().optional(),
});

type FormValues = z.input<typeof schema>;
const empty: FormValues = { name: "", code: "", description: "" };

function DepartmentsPage() {
  const { departments, sections, courses, students, faculty, addDepartment, removeDepartment } = useErp();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<FormValues>(empty);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleting, setDeleting] = React.useState<Department | null>(null);

  const filtered = departments.filter((d) => {
    const q = query.trim().toLowerCase();
    return !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
  });

  const openNew = () => {
    setValues(empty);
    setErrors({});
    setOpen(true);
  };

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
    if (departments.some((d) => d.code.toLowerCase() === parsed.data.code.toLowerCase())) {
      setErrors({ code: "This department code already exists" });
      toast.error("Duplicate department code");
      return;
    }
    if (departments.some((d) => d.name.toLowerCase() === parsed.data.name.toLowerCase())) {
      setErrors({ name: "This department already exists" });
      toast.error("Duplicate department name");
      return;
    }
    addDepartment(parsed.data);
    toast.success(`${parsed.data.name} added to ${COLLEGE.name}`);
    setOpen(false);
  };

  return (
    <RoleWorkspace role="admin">
      <PageHeader
        title="Departments"
        description={`Level 2 of the academic hierarchy — departments belong directly to ${COLLEGE.name}.`}
        action={
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add department
          </Button>
        }
      />

      <DemoNotice className="mb-6">
        Next step after creating a department is to{" "}
        <Link to="/admin/sections" className="font-medium text-foreground underline">
          add its sections
        </Link>
        . Everything you add stays in this browser session only.
      </DemoNotice>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search departments by name or code"
              className="pl-9"
              aria-label="Search departments"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Papers</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => {
                  const deptCourses = courses.filter((c) => c.department === d.name);
                  const deptSections = sections.filter(
                    (s) => s.department === d.name || deptCourses.some((c) => c.id === s.courseId),
                  );
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs">{d.code}</TableCell>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                          {d.name}
                        </span>
                      </TableCell>
                      <TableCell className="hidden max-w-xs truncate lg:table-cell text-muted-foreground">
                        {d.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{deptSections.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{deptCourses.length}</Badge>
                      </TableCell>
                      <TableCell>{students.filter((s) => s.department === d.name).length}</TableCell>
                      <TableCell>{faculty.filter((f) => f.department === d.name).length}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(d)}
                          aria-label={`Delete ${d.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No departments match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add department</DialogTitle>
            <DialogDescription>
              {COLLEGE.name} → <span className="text-foreground">new department</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="dname">Department name</Label>
              <Input
                id="dname"
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
                placeholder="Civil Engineering"
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="dcode">Department code</Label>
              <Input
                id="dcode"
                value={values.code}
                onChange={(e) => setValues({ ...values, code: e.target.value.toUpperCase() })}
                placeholder="CIV"
              />
              {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ddesc">Description (optional)</Label>
              <Textarea
                id="ddesc"
                value={values.description}
                onChange={(e) => setValues({ ...values, description: e.target.value })}
                placeholder="What this department covers"
                rows={3}
              />
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <Plus className="h-4 w-4" /> Add department
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Existing sections, papers and people keep their department label in this demo session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  removeDepartment(deleting.id);
                  toast.success(`${deleting.name} removed`);
                }
                setDeleting(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoleWorkspace>
  );
}
