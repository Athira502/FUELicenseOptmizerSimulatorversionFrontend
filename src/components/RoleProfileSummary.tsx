import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Loader2 } from "lucide-react"; // Import Loader2 for loading animation

interface Role {
  id: string;
  description: string;
  classification: string;
  gb: number;
  gc: number;
  gd: number;
  assignedUsers: number;
  objects: any[];
}

interface PendingChangesSummary {
  totalChanges: number;
  changesByAction: Record<string, number>;
}

interface RoleProfileSummaryProps {
  filteredRoles: Role[];
  selectedRole: Role | null;
  onRoleSelect: (role: Role) => Promise<void>;
  onRunSimulation: () => Promise<void>;
  savedChanges: boolean;
  pendingChangesSummary: PendingChangesSummary | null;
  getRoleChangesSummary: (roleId: string) => { changesCount: number; hasChanges: boolean };
  simulationRunning: boolean; // Add this prop
}

const RoleProfileSummary: React.FC<RoleProfileSummaryProps> = ({
  filteredRoles,
  selectedRole,
  onRoleSelect,
  onRunSimulation,
  savedChanges,
  pendingChangesSummary,
  getRoleChangesSummary,
  simulationRunning, // Add this prop
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Role/Profile License Summary</CardTitle>
          <Button
            onClick={onRunSimulation}
            disabled={simulationRunning || !pendingChangesSummary || pendingChangesSummary.totalChanges === 0}
            className="bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {simulationRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              "Run Simulation"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role/Profile</TableHead>
                <TableHead>Authorization Classification</TableHead>
                <TableHead>GB</TableHead>
                <TableHead>GC</TableHead>
                <TableHead>GD</TableHead>
                <TableHead>Assigned to Users</TableHead>
                <TableHead>Pending Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                    No roles found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => {
                  const { changesCount, hasChanges } = getRoleChangesSummary(role.id);
                  return (
                    <TableRow
                      key={role.id}
                      className={`cursor-pointer hover:bg-gray-50 ${selectedRole?.id === role.id ? 'bg-blue-50' : ''}`}
                      onClick={() => onRoleSelect(role)}
                    >
                      <TableCell className="font-medium text-blue-600">
                        {role.id}
                      </TableCell>
                      <TableCell>{role.classification}</TableCell>
                      <TableCell>{role.gb}</TableCell>
                      <TableCell>{role.gc}</TableCell>
                      <TableCell>{role.gd}</TableCell>
                      <TableCell className="font-medium">{role.assignedUsers}</TableCell>
                      <TableCell>
                        {hasChanges ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full w-fit">
                            <AlertCircle className="h-3 w-3" /> {changesCount}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleProfileSummary;
