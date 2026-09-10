import * as React from "react";
import {
  activity as seedActivity,
  announcements as seedAnnouncements,
  attendance as seedAttendance,
  auditLogs as seedAuditLogs,
  courses as seedCourses,
  departments as seedDepartments,
  faculty as seedFaculty,
  grades as seedGrades,
  sections as seedSections,
  studentActivities as seedStudentActivities,
  students as seedStudents,
  studyHours as seedStudyHours,
  type ActivityItem,
  type Announcement,
  type AttendanceMark,
  type AttendanceRecord,
  type AuditLog,
  type Course,
  type Department,
  type Faculty,
  type Grade,
  type Role,
  type Section,
  type Student,
  type StudentActivity,
  type StudyHourLog,
} from "@/data/erp";

const ROLE_KEY = "erp.role";

type State = {
  role: Role | null;
  setRole: (role: Role | null) => void;
  students: Student[];
  faculty: Faculty[];
  courses: Course[];
  sections: Section[];
  departments: Department[];
  departmentNames: string[];
  attendance: AttendanceRecord[];
  grades: Grade[];
  announcements: Announcement[];
  activity: ActivityItem[];
  studyHours: StudyHourLog[];
  studentActivities: StudentActivity[];
  auditLogs: AuditLog[];
  addStudent: (s: Omit<Student, "id">) => void;
  updateStudent: (id: string, s: Omit<Student, "id">) => void;
  removeStudent: (id: string) => void;
  addFaculty: (f: Omit<Faculty, "id">) => void;
  updateFaculty: (id: string, f: Omit<Faculty, "id">) => void;
  removeFaculty: (id: string) => void;
  addCourse: (c: Omit<Course, "id">) => string;
  updateCourse: (id: string, c: Omit<Course, "id">) => void;
  removeCourse: (id: string) => void;
  addDepartment: (d: Omit<Department, "id">) => void;
  removeDepartment: (id: string) => void;
  addSection: (s: Omit<Section, "id">) => void;
  updateSection: (id: string, s: Partial<Omit<Section, "id">>) => void;
  removeSection: (id: string) => void;
  setAttendance: (sectionId: string, date: string, marks: Record<string, AttendanceMark>) => void;
  setGrade: (studentId: string, courseId: string, internal: number, external: number) => void;
  addAnnouncement: (a: Omit<Announcement, "id">) => void;
  removeAnnouncement: (id: string) => void;
  addStudyHours: (log: Omit<StudyHourLog, "id">) => void;
  removeStudyHours: (id: string) => void;
  addActivity: (a: Omit<StudentActivity, "id">) => void;
  removeActivity: (id: string) => void;
  log: (action: string, target: string) => void;
};

const ErpContext = React.createContext<State | null>(null);

let counter = 0;
const uid = (p: string) => `${p}-n${++counter}-${Date.now().toString(36)}`;

export function ErpProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role | null>(null);
  const [students, setStudents] = React.useState(seedStudents);
  const [faculty, setFaculty] = React.useState(seedFaculty);
  const [courses, setCourses] = React.useState(seedCourses);
  const [sections, setSections] = React.useState(seedSections);
  const [departments, setDepartments] = React.useState(seedDepartments);
  const [attendance, setAttendanceState] = React.useState(seedAttendance);
  const [grades, setGrades] = React.useState(seedGrades);
  const [announcements, setAnnouncements] = React.useState(seedAnnouncements);
  const [activity, setActivity] = React.useState(seedActivity);
  const [studyHours, setStudyHours] = React.useState(seedStudyHours);
  const [studentActivities, setStudentActivities] = React.useState(seedStudentActivities);
  const [auditLogs, setAuditLogs] = React.useState(seedAuditLogs);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(ROLE_KEY) as Role | null;
    if (stored === "admin" || stored === "faculty" || stored === "student") {
      setRoleState(stored);
    }
  }, []);

  const setRole = React.useCallback((next: Role | null) => {
    setRoleState(next);
    if (next) window.localStorage.setItem(ROLE_KEY, next);
    else window.localStorage.removeItem(ROLE_KEY);
  }, []);

  const log = React.useCallback((action: string, target: string) => {
    setActivity((prev) =>
      [
        { id: uid("ac"), actor: "You (demo session)", action, target, at: "Just now" },
        ...prev,
      ].slice(0, 20),
    );
    setAuditLogs((prev) =>
      [
        {
          id: uid("al"),
          actor: "You (demo session)",
          role: (window.localStorage.getItem(ROLE_KEY) as Role | null) ?? "admin",
          action: action.charAt(0).toUpperCase() + action.slice(1),
          entity: target,
          at: "Just now",
        },
        ...prev,
      ].slice(0, 40),
    );
  }, []);

  const value: State = {
    role,
    setRole,
    students,
    faculty,
    courses,
    sections,
    attendance,
    grades,
    announcements,
    activity,
    studyHours,
    studentActivities,
    auditLogs,
    log,
    addStudent: (s) => {
      setStudents((prev) => [{ ...s, id: uid("s") }, ...prev]);
      log("added student", s.name);
    },
    updateStudent: (id, s) => {
      setStudents((prev) => prev.map((x) => (x.id === id ? { ...s, id } : x)));
      log("updated student", s.name);
    },
    removeStudent: (id) => {
      setStudents((prev) => prev.filter((x) => x.id !== id));
      log("removed a student record", id);
    },
    addFaculty: (f) => {
      setFaculty((prev) => [{ ...f, id: uid("f") }, ...prev]);
      log("added faculty", f.name);
    },
    updateFaculty: (id, f) => {
      setFaculty((prev) => prev.map((x) => (x.id === id ? { ...f, id } : x)));
      log("updated faculty", f.name);
    },
    removeFaculty: (id) => {
      setFaculty((prev) => prev.filter((x) => x.id !== id));
      log("removed a faculty record", id);
    },
    addCourse: (c) => {
      setCourses((prev) => [{ ...c, id: uid("c") }, ...prev]);
      log("added course", `${c.code} ${c.title}`);
    },
    updateCourse: (id, c) => {
      setCourses((prev) => prev.map((x) => (x.id === id ? { ...c, id } : x)));
      log("updated course", `${c.code} ${c.title}`);
    },
    removeCourse: (id) => {
      setCourses((prev) => prev.filter((x) => x.id !== id));
      log("removed a course", id);
    },
    setAttendance: (sectionId, date, marks) => {
      setAttendanceState((prev) => {
        const kept = prev.filter((r) => !(r.sectionId === sectionId && r.date === date));
        const next = Object.entries(marks).map(([studentId, mark]) => ({
          id: `att-${studentId}-${date}`,
          sectionId,
          studentId,
          date,
          mark,
        }));
        return [...kept, ...next];
      });
      log("marked attendance for", sectionId);
    },
    setGrade: (studentId, courseId, internal, external) => {
      setGrades((prev) => {
        const existing = prev.find((g) => g.studentId === studentId && g.courseId === courseId);
        if (existing) {
          return prev.map((g) => (g === existing ? { ...g, internal, external } : g));
        }
        return [...prev, { id: uid("g"), studentId, courseId, internal, external }];
      });
    },
    addAnnouncement: (a) => {
      setAnnouncements((prev) => [{ ...a, id: uid("an") }, ...prev]);
      log("published announcement", a.title);
    },
    removeAnnouncement: (id) => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      log("removed announcement", id);
    },
    addStudyHours: (entry) => {
      setStudyHours((prev) => [{ ...entry, id: uid("sh") }, ...prev]);
      log("logged study hours for", entry.courseId);
    },
    removeStudyHours: (id) => {
      setStudyHours((prev) => prev.filter((s) => s.id !== id));
      log("deleted a study-hour entry", id);
    },
    addActivity: (a) => {
      setStudentActivities((prev) => [{ ...a, id: uid("sa") }, ...prev]);
      log("submitted activity", a.title);
    },
    removeActivity: (id) => {
      setStudentActivities((prev) => prev.filter((a) => a.id !== id));
      log("removed activity", id);
    },
  };

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>;
}

export function useErp() {
  const ctx = React.useContext(ErpContext);
  if (!ctx) throw new Error("useErp must be used inside ErpProvider");
  return ctx;
}
