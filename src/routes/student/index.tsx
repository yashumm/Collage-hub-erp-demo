import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarCheck, Clock, GraduationCap } from "lucide-react";
import { RoleWorkspace } from "@/components/erp/RoleWorkspace";
import { PageHeader } from "@/components/erp/PageHeader";
import { StatCard } from "@/components/erp/StatCard";
import { DemoNotice } from "@/components/erp/DemoNotice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useErp } from "@/lib/erp-store";
import { CURRENT_STUDENT_ID, gradeFor } from "@/data/erp";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Overview | Aurora ERP" },
      { name: "description", content: "Attendance, marks, study hours and notices for one student." },
      { property: "og:title", content: "Student Overview | Aurora ERP" },
      {
        property: "og:description",
        content: "Attendance, marks, study hours and notices for one student.",
      },
    ],
  }),
  component: StudentDashboard;
});

function StudentDashboard() {
  return null;
}
