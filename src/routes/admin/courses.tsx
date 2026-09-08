import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { DEPARTMENTS, type Course } from "@/data/erp";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({
    meta: [
      { title: "Courses & Sections | Aurora ERP" },
      {
        name: "description",
        content: "Course catalogue and section allocation for the Aurora College ERP prototype.",
      },
      { property: "og:title", content: "Courses & Sections | Aurora ERP" },
      {
        property: "og:description",
        content: "Course catalogue and section allocation for the Aurora College ERP prototype.",
      },
    ],
  }),
  component: CoursesPage,
});

const schema = z.object({
  code: z.string().min(4, "Course code is required (e.g. CS301)"),
  title: z.string().min(3, "Enter the course title"),
  department: z.string().min(1, "Select a department"),
  credits: z.coerce.number().int().min(1, "1–6 credits").max(6, "1–6 credits"),
  semester: z.coerce.number().int().min(1, "1–8").max(8, "1–8"),
  type: z.enum(["Core", "Elective", "Lab"]),
});

type FormValues = z.input<typeof schema>;

const empty: FormValues = {
  code: "",
  title: "",
  department: DEPARTMENTS[0]!,
  credits: 3,
  semester: 1,
  type: "Core",
};

function CoursesPage() {
  const { courses, sections, faculty, students, addCourse, updateCourse, removeCourse } = useErp();
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Course | null>(null);
  const [values, setValues] = React.useState<FormValues>(empty);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleting, setDeleting] = React.useState<Course | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses
      .filter(
        (c) =>
          (!q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) &&
          (type === "all" || c.type === type),
      )
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [courses, query, type]);

  const openNew = () => {
    setEditing(null);
    setValues(empty);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setValues({ ...c });
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
    if (courses.some((c) => c.code.toLowerCase() === parsed.data.code.toLowerCase() && c.id !== editing?.id)) {
      setErrors({ code: "This course code already exists" });
      toast.error("Duplicate course code");
      return;
    }
    if (editing) {
      updateCourse(editing.id, parsed.data);
      toast.success(`${parsed.data.code} updated`);
    } else {
      addCourse(parsed.data);
      toast.success(`${parsed.data.code} added to catalogue`);
    }
    setDialogOpen(false);
  };

  return (
    <RoleWorkspace role="admin">
      <PageHeader
        title="Courses & sections"
        description="The catalogue drives everything downstream — sections, attendance registers and marks sheets."
        action={
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add course
          </Button>
        }
      />

      <Tabs defaultValue="catalogue">
        <TabsList>
          <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogue" className="mt-5">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative min-w-0">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by code or title"
                    className="pl-9"
                    aria-label="Search courses"
                  />
                </div>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="sm:w-40" aria-label="Filter by type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="Core">Core</SelectItem>
                    <SelectItem value="Elective">Elective</SelectItem>
                    <SelectItem value="Lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-5 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Department</TableHead>
                      <TableHead>Sem</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.code}</TableCell>
                        <TableCell className="font-medium">{c.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{c.department}</TableCell>
                        <TableCell>{c.semester}</TableCell>
                        <TableCell>{c.credits}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{c.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label={`Edit ${c.code}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(c)}
                            aria-label={`Delete ${c.code}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                          No courses match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="mt-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sections.map((s) => {
              const course = courses.find((c) => c.id === s.courseId);
              const teacher = faculty.find((f) => f.id === s.facultyId);
              const count = students.filter((st) => st.sectionId === s.id).length;
              return (
                <Card key={s.id}>
                  <CardHeader>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base">{s.label}</CardTitle>
                        <CardDescription className="truncate">
                          {course ? `${course.code} · ${course.title}` : "Course removed"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {count} students
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Faculty</span>
                      <span className="min-w-0 truncate text-right font-medium">
                        {teacher?.name ?? "Unallocated"}
                      </span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Room</span>
                      <span className="font-medium">{s.room}</span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Slot</span>
                      <span className="font-medium">{s.slot}</span>
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Reassign a section to a different teacher from the Faculty page.
          </p>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit course" : "Add course"}</DialogTitle>
            <DialogDescription>Catalogue entries are session-only in this prototype.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="code">Course code</Label>
              <Input id="code" value={values.code} onChange={(e) => setValues({ ...values, code: e.target.value })} />
              {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
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
              <Label>Type</Label>
              <Select
                value={values.type}
                onValueChange={(v) => setValues({ ...values, type: v as FormValues["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Elective">Elective</SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={values.credits}
                onChange={(e) => setValues({ ...values, credits: e.target.value })}
              />
              {errors.credits && <p className="mt-1 text-xs text-destructive">{errors.credits}</p>}
            </div>
            <div>
              <Label htmlFor="csem">Semester</Label>
              <Input
                id="csem"
                type="number"
                value={values.semester}
                onChange={(e) => setValues({ ...values, semester: e.target.value })}
              />
              {errors.semester && <p className="mt-1 text-xs text-destructive">{errors.semester}</p>}
            </div>
            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : "Add course"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleting?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Sections referencing this course will show as unlinked in the demo session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  removeCourse(deleting.id);
                  toast.success(`${deleting.code} removed`);
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
