// Centralized mock/static data for the College ERP prototype.
// Frontend-only: nothing here is persisted or secured.

export type Role = "admin" | "faculty" | "student";

export type Student = {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  department: string;
  program: string;
  semester: number;
  sectionId: string;
  status: "Active" | "Alumni" | "On Leave";
  cgpa: number;
};

export type Faculty = {
  id: string;
  code: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  sections: string[];
  status: "Active" | "On Leave";
};

export type Course = {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  semester: number;
  type: "Core" | "Elective" | "Lab";
};

export type Section = {
  id: string;
  label: string;
  courseId: string;
  facultyId: string;
  room: string;
  slot: string;
};

export type AttendanceMark = "present" | "absent" | "late";

export type AttendanceRecord = {
  id: string;
  sectionId: string;
  studentId: string;
  date: string; // yyyy-mm-dd
  mark: AttendanceMark;
};

export type Grade = {
  id: string;
  studentId: string;
  courseId: string;
  internal: number; // /40
  external: number; // /60
};

export type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: "All" | "Faculty" | "Students";
  date: string;
};

export const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Mathematics",
];

export const PROGRAMS = ["B.Tech", "M.Tech", "B.Sc"];

export const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
];

/** The logged-in mock identities used by the role switcher. */
export const CURRENT_FACULTY_ID = "f-01";
export const CURRENT_STUDENT_ID = "s-01";
export const CURRENT_ADMIN = {
  name: "Dr. Meera Rao",
  title: "Registrar (Admin)",
};

export const courses: Course[] = [
  { id: "c-01", code: "CS301", title: "Data Structures", department: "Computer Science", credits: 4, semester: 3, type: "Core" },
  { id: "c-02", code: "CS402", title: "Operating Systems", department: "Computer Science", credits: 4, semester: 4, type: "Core" },
  { id: "c-03", code: "CS451", title: "Machine Learning", department: "Computer Science", credits: 3, semester: 5, type: "Elective" },
  { id: "c-04", code: "CS311", title: "DS Laboratory", department: "Computer Science", credits: 2, semester: 3, type: "Lab" },
  { id: "c-05", code: "EC205", title: "Digital Circuits", department: "Electronics", credits: 4, semester: 2, type: "Core" },
  { id: "c-06", code: "MA101", title: "Linear Algebra", department: "Mathematics", credits: 3, semester: 1, type: "Core" },
];

export const faculty: Faculty[] = [
  { id: "f-01", code: "FAC-1041", name: "Prof. Anand Kulkarni", email: "anand.k@college.edu", department: "Computer Science", designation: "Associate Professor", sections: ["sec-01", "sec-02", "sec-04"], status: "Active" },
  { id: "f-02", code: "FAC-1052", name: "Dr. Leena Fernandes", email: "leena.f@college.edu", department: "Computer Science", designation: "Professor", sections: ["sec-03"], status: "Active" },
  { id: "f-03", code: "FAC-1077", name: "Prof. Rakesh Menon", email: "rakesh.m@college.edu", department: "Electronics", designation: "Assistant Professor", sections: ["sec-05"], status: "Active" },
  { id: "f-04", code: "FAC-1088", name: "Dr. Sunita Bhat", email: "sunita.b@college.edu", department: "Mathematics", designation: "Professor", sections: ["sec-06"], status: "On Leave" },
];

export const sections: Section[] = [
  { id: "sec-01", label: "CS301 - A", courseId: "c-01", facultyId: "f-01", room: "LH-204", slot: "Mon/Wed 09:00" },
  { id: "sec-02", label: "CS402 - A", courseId: "c-02", facultyId: "f-01", room: "LH-118", slot: "Tue/Thu 11:00" },
  { id: "sec-03", label: "CS451 - B", courseId: "c-03", facultyId: "f-02", room: "LH-301", slot: "Wed/Fri 14:00" },
  { id: "sec-04", label: "CS311 - Lab 1", courseId: "c-04", facultyId: "f-01", room: "Lab-2", slot: "Fri 09:00" },
  { id: "sec-05", label: "EC205 - A", courseId: "c-05", facultyId: "f-03", room: "LH-006", slot: "Mon/Thu 10:00" },
  { id: "sec-06", label: "MA101 - C", courseId: "c-06", facultyId: "f-04", room: "LH-402", slot: "Tue/Fri 08:00" },
];

const names = [
  "Yashaswini M M", "Aditya Sharma", "Nikita Joshi", "Rahul Verma", "Sneha Iyer",
  "Karan Gupta", "Tanvi Desai", "Mohit Nair", "Ishita Roy", "Varun Reddy",
  "Pooja Shetty", "Arjun Pillai", "Divya Menon", "Rohan Kamath", "Ananya Bose",
  "Siddharth Jain", "Megha Patel", "Nikhil Rao",
];

export const students: Student[] = names.map((name, i) => {
  const sectionId = ["sec-01", "sec-02", "sec-03", "sec-05", "sec-06"][i % 5];
  const section = sections.find((s) => s.id === sectionId)!;
  const course = courses.find((c) => c.id === section.courseId)!;
  return {
    id: `s-${String(i + 1).padStart(2, "0")}`,
    rollNo: `ENG24AM${String(319 + i).padStart(4, "0")}`,
    name,
    email: `${name.split(" ")[0]!.toLowerCase()}${i}@college.edu`,
    department: course.department,
    program: i % 7 === 0 ? "M.Tech" : "B.Tech",
    semester: course.semester,
    sectionId,
    status: i % 11 === 0 ? "On Leave" : "Active",
    cgpa: Number((6.4 + ((i * 37) % 30) / 10).toFixed(2)),
  } as Student;
});

const today = new Date();
const isoDay = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

export const attendance: AttendanceRecord[] = students.flatMap((st, si) =>
  [1, 2, 3, 4, 5].map((offset) => {
    const seed = (si * 7 + offset * 13) % 10;
    const mark: AttendanceMark = seed === 0 ? "absent" : seed === 3 ? "late" : "present";
    return {
      id: `att-${st.id}-${offset}`,
      sectionId: st.sectionId,
      studentId: st.id,
      date: isoDay(offset),
      mark,
    };
  }),
);

export const grades: Grade[] = students.flatMap((st, si) => {
  const section = sections.find((s) => s.id === st.sectionId)!;
  const extra = courses.filter((c) => c.department === st.department && c.id !== section.courseId).slice(0, 2);
  return [section.courseId, ...extra.map((c) => c.id)].map((courseId, ci) => ({
    id: `g-${st.id}-${courseId}`,
    studentId: st.id,
    courseId,
    internal: 24 + ((si * 3 + ci * 5) % 16),
    external: 32 + ((si * 7 + ci * 11) % 28),
  }));
});

export const announcements: Announcement[] = [
  { id: "an-01", title: "Mid-semester exam schedule published", body: "Timetable for all departments is available on the notice board. Reporting time is 09:00 sharp.", audience: "All", date: isoDay(1) },
  { id: "an-02", title: "Faculty appraisal window open", body: "Submit self-appraisal forms to the department office before the end of the month.", audience: "Faculty", date: isoDay(4) },
  { id: "an-03", title: "Library dues clearance", body: "Students with pending dues will not receive hall tickets until cleared.", audience: "Students", date: isoDay(6) },
];

export const activity: ActivityItem[] = [
  { id: "ac-01", actor: "Prof. Anand Kulkarni", action: "marked attendance for", target: "CS301 - A", at: "10 min ago" },
  { id: "ac-02", actor: "Dr. Meera Rao", action: "added a new course", target: "CS451 Machine Learning", at: "1 hr ago" },
  { id: "ac-03", actor: "Dr. Leena Fernandes", action: "published internal marks for", target: "CS451 - B", at: "3 hrs ago" },
  { id: "ac-04", actor: "Dr. Meera Rao", action: "updated the section allocation of", target: "Prof. Rakesh Menon", at: "Yesterday" },
];

export type HierarchyNode = {
  id: string;
  name: string;
  kind: "institute" | "school" | "department" | "program" | "section";
  children?: HierarchyNode[];
  meta?: string;
};

export const hierarchy: HierarchyNode = {
  id: "h-root",
  name: "Aurora Institute of Technology",
  kind: "institute",
  meta: "Est. 1998 · 4 departments",
  children: [
    {
      id: "h-soe",
      name: "School of Engineering",
      kind: "school",
      meta: "3 departments",
      children: [
        {
          id: "h-cs",
          name: "Computer Science",
          kind: "department",
          meta: "HOD: Dr. Leena Fernandes",
          children: [
            {
              id: "h-cs-btech",
              name: "B.Tech Computer Science",
              kind: "program",
              meta: "8 semesters",
              children: [
                { id: "h-sec-01", name: "CS301 - A", kind: "section", meta: "Prof. Anand Kulkarni" },
                { id: "h-sec-02", name: "CS402 - A", kind: "section", meta: "Prof. Anand Kulkarni" },
                { id: "h-sec-03", name: "CS451 - B", kind: "section", meta: "Dr. Leena Fernandes" },
              ],
            },
            {
              id: "h-cs-mtech",
              name: "M.Tech Computer Science",
              kind: "program",
              meta: "4 semesters",
              children: [{ id: "h-sec-04", name: "CS311 - Lab 1", kind: "section", meta: "Prof. Anand Kulkarni" }],
            },
          ],
        },
        {
          id: "h-ec",
          name: "Electronics",
          kind: "department",
          meta: "HOD: Prof. Rakesh Menon",
          children: [
            {
              id: "h-ec-btech",
              name: "B.Tech Electronics",
              kind: "program",
              meta: "8 semesters",
              children: [{ id: "h-sec-05", name: "EC205 - A", kind: "section", meta: "Prof. Rakesh Menon" }],
            },
          ],
        },
      ],
    },
    {
      id: "h-sos",
      name: "School of Sciences",
      kind: "school",
      meta: "1 department",
      children: [
        {
          id: "h-ma",
          name: "Mathematics",
          kind: "department",
          meta: "HOD: Dr. Sunita Bhat",
          children: [
            {
              id: "h-ma-bsc",
              name: "B.Sc Mathematics",
              kind: "program",
              meta: "6 semesters",
              children: [{ id: "h-sec-06", name: "MA101 - C", kind: "section", meta: "Dr. Sunita Bhat" }],
            },
          ],
        },
      ],
    },
  ],
};

export type PermissionMatrixRow = {
  capability: string;
  admin: boolean;
  faculty: boolean;
  student: boolean;
  note: string;
};

export const permissionMatrix: PermissionMatrixRow[] = [
  { capability: "Manage departments & hierarchy", admin: true, faculty: false, student: false, note: "Structural changes" },
  { capability: "Create / edit student records", admin: true, faculty: false, student: false, note: "Registry ownership" },
  { capability: "Create / edit faculty records", admin: true, faculty: false, student: false, note: "Registry ownership" },
  { capability: "Allocate sections to faculty", admin: true, faculty: false, student: false, note: "Timetable control" },
  { capability: "Mark attendance", admin: false, faculty: true, student: false, note: "Assigned sections only" },
  { capability: "Enter internal marks", admin: false, faculty: true, student: false, note: "Assigned sections only" },
  { capability: "View own attendance & marks", admin: true, faculty: true, student: true, note: "Read-only for students" },
  { capability: "Publish announcements", admin: true, faculty: true, student: false, note: "Audience scoped" },
];

export const GRADE_SCALE: { min: number; grade: string; points: number }[] = [
  { min: 90, grade: "O", points: 10 },
  { min: 80, grade: "A+", points: 9 },
  { min: 70, grade: "A", points: 8 },
  { min: 60, grade: "B+", points: 7 },
  { min: 50, grade: "B", points: 6 },
  { min: 40, grade: "C", points: 5 },
  { min: 0, grade: "F", points: 0 },
];

export function gradeFor(total: number) {
  return GRADE_SCALE.find((g) => total >= g.min)!;
}

// ---------------------------------------------------------------------------
// Study hours, co-curricular activities and audit trail (all static mock data)
// ---------------------------------------------------------------------------

export type StudyHourLog = {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  hours: number;
  note: string;
};

export const ACTIVITY_CATEGORIES = [
  "Technical",
  "Sports",
  "Cultural",
  "Community Service",
  "Internship",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export type StudentActivity = {
  id: string;
  studentId: string;
  title: string;
  category: ActivityCategory;
  date: string;
  points: number;
  status: "Approved" | "Pending";
};

export type AuditLog = {
  id: string;
  actor: string;
  role: Role;
  action: string;
  entity: string;
  at: string;
};

export const studyHours: StudyHourLog[] = students.flatMap((st, si) => {
  const section = sections.find((s) => s.id === st.sectionId)!;
  return [1, 2, 3, 4].map((offset) => ({
    id: `sh-${st.id}-${offset}`,
    studentId: st.id,
    courseId: section.courseId,
    date: isoDay(offset),
    hours: Number((1 + ((si + offset * 3) % 5) * 0.5).toFixed(1)),
    note: offset % 2 === 0 ? "Self study" : "Assignment work",
  }));
});

export const studentActivities: StudentActivity[] = students.flatMap((st, si) =>
  [0, 1].map((k) => {
    const category = ACTIVITY_CATEGORIES[(si + k * 2) % ACTIVITY_CATEGORIES.length]!;
    return {
      id: `sa-${st.id}-${k}`,
      studentId: st.id,
      title:
        category === "Technical"
          ? "Inter-college hackathon"
          : category === "Sports"
            ? "District level athletics meet"
            : category === "Cultural"
              ? "Annual cultural fest — music"
              : category === "Internship"
                ? "Summer internship (4 weeks)"
                : "Village literacy drive",
      category,
      date: isoDay(7 + si + k * 5),
      points: 5 + ((si + k * 3) % 4) * 5,
      status: (si + k) % 4 === 0 ? "Pending" : "Approved",
    } as StudentActivity;
  }),
);

export const auditLogs: AuditLog[] = [
  { id: "al-01", actor: "Dr. Meera Rao", role: "admin", action: "Created course", entity: "CS451 Machine Learning", at: `${isoDay(0)} 09:14` },
  { id: "al-02", actor: "Prof. Anand Kulkarni", role: "faculty", action: "Saved attendance", entity: "CS301 - A", at: `${isoDay(0)} 09:41` },
  { id: "al-03", actor: "Dr. Leena Fernandes", role: "faculty", action: "Updated internal marks", entity: "CS451 - B", at: `${isoDay(1)} 15:02` },
  { id: "al-04", actor: "Dr. Meera Rao", role: "admin", action: "Allocated section", entity: "EC205 - A → Prof. Rakesh Menon", at: `${isoDay(1)} 11:20` },
  { id: "al-05", actor: "Yashaswini M M", role: "student", action: "Logged study hours", entity: "CS301 Data Structures", at: `${isoDay(2)} 20:35` },
  { id: "al-06", actor: "Dr. Meera Rao", role: "admin", action: "Published announcement", entity: "Mid-semester exam schedule", at: `${isoDay(2)} 10:05` },
  { id: "al-07", actor: "Prof. Rakesh Menon", role: "faculty", action: "Saved attendance", entity: "EC205 - A", at: `${isoDay(3)} 10:12` },
  { id: "al-08", actor: "Dr. Meera Rao", role: "admin", action: "Edited student record", entity: "ENG24AM0322", at: `${isoDay(4)} 16:48` },
];
