import * as React from "react";
import type { Role } from "@/data/erp";
import { useErp } from "@/lib/erp-store";
import { AppShell } from "./AppShell";

/**
 * Wraps a page in the workspace chrome for a given role. Deep links are allowed
 * (this is a prototype), so entering a role's route simply activates that role.
 */
export function RoleWorkspace({ role, children }: { role: Role; children: React.ReactNode }) {
  const { role: current, setRole } = useErp();

  React.useEffect(() => {
    if (current !== role) setRole(role);
  }, [current, role, setRole]);

  return <AppShell role={role}>{children}</AppShell>;
}
