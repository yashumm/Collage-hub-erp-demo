import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpDown, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useErp } from "@/lib/erp-store";
import { DEPARTMENTS, DESIGNATIONS, type Faculty } from "@/data/erp";

export const Route = createFileRoute("/admin/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty Registry | Aurora ERP" },
      {
        name: "description",
        content: "Manage teaching staff records and section allocation in the Aurora ERP prototype.",
      },
      { property: "og:title", content: "Faculty Registry | Aurora ERP" },
      {
        property: "og:description",
        content: "Manage teaching staff records and section allocation in the Aurora ERP prototype.",
      },
    ],
  }),
  component: FacultyPage,
});

const schema = z.object({
  name: z.string().min(3, "Enter the full name"),
  code: z.string().min(3, "Staff code is required"),
  email: z.string().email("Enter a valid email address"),
  department: z.string().min(1, "Select a department"),
  designation: z.string().min(1, "Select a designation"),
  sections: z.array(z.string()),
  status: z.enum(["Active", "On Leave"]),
});

type FormValues = z.input<typeof schema>;

const empty: FormValues = {
  name: "",
  code: "",
  email: "",
  department: DEPARTMENTS[0]!,
  designation: DESIGNATIONS[0]!,
  sections: [],
  status: "Active",
};

function FacultyPage() {
  const { faculty, sections, addFaculty, updateFaculty, removeFaculty } = useErp();
  const [query, setQuery] = React.useState("");
  const [dept, setDept] = React.useState("all");
  const [asc, setAsc] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Faculty | null>(null);
  const [values, setValues] = React.useState<FormValues>(empty);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleting, setDeleting] = React.useState<Faculty | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return faculty
      .filter(
        (f) =>
          (!q || f.name.toLowerCase().includes(q) || f.code.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)) &&
          (dept === "all" || f.department === dept),
      )
      .sort((a, b) => (asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [faculty, query, dept, asc]);

  const openNew = () => {
    setEditing(null);
    setValues(empty);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (f: Faculty) => {
    setEditing(f);
    setValues({ ...f, sections: [...f.sections] });
    setErrors({});
    setDialogOpen(true);
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
    if (editing) {
      updateFaculty(editing.id, parsed.data);
      toast.success(`${parsed.data.name} updated`);
    } else {
      addFaculty(parsed.data);
      toast.success(`${parsed.data.name} added to staff`);
    }
    setDialogOpen(false);
  };

  const toggleSection = (id: string) => {
    setValues((v) => ({
      ...v,
      sections: v.sections.includes(id) ? v.sections.filter((s) => s !== id) : [...v.sections, id],
    }));
  };

  return (
    <RoleWorkspace role="admin">
      <PageHeader
        title="Faculty registry"
        description="Maintain staff records and decide which sections each faculty member teaches."
        action={
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add faculty
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative min-w-0">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, code or email"
                className="pl-9"
                aria-label="Search faculty"
              />
            </div>
            <Select value={dept} onValueChange={setDept}>
              <SelectTrigger className="sm:w-52" aria-label="Filter by department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => setAsc((v) => !v)}>
                      Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Designation</TableHead>
                  <TableHead className="hidden lg:table-cell">Department</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.code}</TableCell>
                    <TableCell>
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.email}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{f.designation}</TableCell>
                    <TableCell className="hidden lg:table-cell">{f.department}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {f.sections.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                        {f.sections.map((sid) => (
                          <Badge key={sid} variant="outline" className="text-[11px]">
                            {sections.find((s) => s.id === sid)?.label ?? sid}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={f.status === "Active" ? "secondary" : "outline"}>{f.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(f)} aria-label={`Edit ${f.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(f)} aria-label={`Delete ${f.name}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No faculty match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit faculty" : "Add faculty"}</DialogTitle>
            <DialogDescription>Section allocation controls what this teacher can see.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="fname">Full name</Label>
              <Input id="fname" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="fcode">Staff code</Label>
              <Input id="fcode" value={values.code} onChange={(e) => setValues({ ...values, code: e.target.value })} />
              {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
            </div>
            <div>
              <Label htmlFor="femail">Email</Label>
              <Input id="femail" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <Label>Department</Label>
              <Select value={values.department} onValueChange={(v) => setValues({ ...values, department: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Designation</Label>
              <Select value={values.designation} onValueChange={(v) => setValues({ ...values, designation: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Assigned sections</Label>
              <div className="mt-2 grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
                {sections.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={values.sections.includes(s.id)}
                      onCheckedChange={() => toggleSection(s.id)}
                    />
                    <span className="min-w-0 truncate">
                      {s.label} <span className="text-muted-foreground">· {s.slot}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => setValues({ ...values, status: v as FormValues["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Add faculty"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their section allocations will be released in this demo session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  removeFaculty(deleting.id);
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
