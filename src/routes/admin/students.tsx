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
import { DEPARTMENTS, PROGRAMS, type Student } from "@/data/erp";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Student Registry | Aurora ERP" },
      {
        name: "description",
        content: "Search, filter, add, edit and remove student records in the Aurora ERP prototype.",
      },
      { property: "og:title", content: "Student Registry | Aurora ERP" },
      {
        property: "og:description",
        content: "Search, filter, add, edit and remove student records in the Aurora ERP prototype.",
      },
    ],
  }),
  component: StudentsPage,
});

const schema = z.object({
  name: z.string().min(3, "Enter the full name (min 3 characters)"),
  rollNo: z.string().min(4, "Roll number is required"),
  email: z.string().email("Enter a valid email address"),
  department: z.string().min(1, "Select a department"),
  program: z.string().min(1, "Select a programme"),
  semester: z.coerce.number().int().min(1, "1–8").max(8, "1–8"),
  sectionId: z.string().min(1, "Select a section"),
  status: z.enum(["Active", "Alumni", "On Leave"]),
  cgpa: z.coerce.number().min(0, "0–10").max(10, "0–10"),
});

type FormValues = z.input<typeof schema>;

const empty: FormValues = {
  name: "",
  rollNo: "",
  email: "",
  department: DEPARTMENTS[0]!,
  program: PROGRAMS[0]!,
  semester: 1,
  sectionId: "",
  status: "Active",
  cgpa: 7,
};

type SortKey = "name" | "rollNo" | "semester" | "cgpa";

function StudentsPage() {
  const { students, sections, courses, addStudent, updateStudent, removeStudent } = useErp();
  const [query, setQuery] = React.useState("");
  const [dept, setDept] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [asc, setAsc] = React.useState(true);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Student | null>(null);
  const [values, setValues] = React.useState<FormValues>(empty);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleting, setDeleting] = React.useState<Student | null>(null);

  const sectionLabel = (id: string) => sections.find((s) => s.id === id)?.label ?? "—";

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = students.filter((s) => {
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      return matchesQuery && (dept === "all" || s.department === dept) && (status === "all" || s.status === status);
    });
    return rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
      return asc ? cmp : -cmp;
    });
  }, [students, query, dept, status, sortKey, asc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(true);
    }
  };

  const openNew = () => {
    setEditing(null);
    setValues({ ...empty, sectionId: sections[0]?.id ?? "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setValues({ ...s });
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
    const duplicate = students.some(
      (s) => s.rollNo.toLowerCase() === parsed.data.rollNo.toLowerCase() && s.id !== editing?.id,
    );
    if (duplicate) {
      setErrors({ rollNo: "This roll number already exists" });
      toast.error("Duplicate roll number");
      return;
    }
    if (editing) {
      updateStudent(editing.id, parsed.data);
      toast.success(`${parsed.data.name} updated`);
    } else {
      addStudent(parsed.data);
      toast.success(`${parsed.data.name} enrolled`);
    }
    setDialogOpen(false);
  };

  return (
    <RoleWorkspace role="admin">
      <PageHeader
        title="Student registry"
        description="The administration owns student records: enrol new students, correct details or withdraw a record."
        action={
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add student
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
            <div className="relative min-w-0">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, roll number or email"
                className="pl-9"
                aria-label="Search students"
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
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="sm:w-40" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Alumni">Alumni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Showing {filtered.length} of {students.length} records
          </p>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort("rollNo")}>
                      Roll no <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort("name")}>
                      Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Section</TableHead>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort("semester")}>
                      Sem <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort("cgpa")}>
                      CGPA <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                    <TableCell>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{s.department}</TableCell>
                    <TableCell className="hidden lg:table-cell">{sectionLabel(s.sectionId)}</TableCell>
                    <TableCell>{s.semester}</TableCell>
                    <TableCell>{s.cgpa.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Active" ? "secondary" : "outline"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(s)}
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No students match the current filters.
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
            <DialogTitle>{editing ? "Edit student" : "Add student"}</DialogTitle>
            <DialogDescription>
              Changes stay in this browser session only.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="rollNo">Roll number</Label>
              <Input
                id="rollNo"
                value={values.rollNo}
                onChange={(e) => setValues({ ...values, rollNo: e.target.value })}
              />
              {errors.rollNo && <p className="mt-1 text-xs text-destructive">{errors.rollNo}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={values.email}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
              />
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
              <Label>Programme</Label>
              <Select value={values.program} onValueChange={(v) => setValues({ ...values, program: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                type="number"
                min={1}
                max={8}
                value={values.semester}
                onChange={(e) => setValues({ ...values, semester: e.target.value })}
              />
              {errors.semester && <p className="mt-1 text-xs text-destructive">{errors.semester}</p>}
            </div>
            <div>
              <Label htmlFor="cgpa">CGPA</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                value={values.cgpa}
                onChange={(e) => setValues({ ...values, cgpa: e.target.value })}
              />
              {errors.cgpa && <p className="mt-1 text-xs text-destructive">{errors.cgpa}</p>}
            </div>
            <div>
              <Label>Section</Label>
              <Select value={values.sectionId} onValueChange={(v) => setValues({ ...values, sectionId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label} · {courses.find((c) => c.id === s.courseId)?.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sectionId && <p className="mt-1 text-xs text-destructive">{errors.sectionId}</p>}
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
                  <SelectItem value="Alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Add student"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the record from the current demo session. Nothing is deleted permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  removeStudent(deleting.id);
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
