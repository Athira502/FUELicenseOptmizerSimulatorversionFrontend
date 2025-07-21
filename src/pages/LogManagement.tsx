

import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Loader2 } from "lucide-react";
import { deleteOldDbLogs } from "@/api/log_api";

const LogManagement = () => {
  const [daysOlder, setDaysOlder] = useState<string>("30");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleDeleteLogs = async () => {
    console.log("🚀 handleDeleteLogs started");
    console.log("📊 daysOlder value:", daysOlder);
    
    setIsLoading(true);
    
    try {
      const days = parseInt(daysOlder, 10);
      console.log("🔢 Parsed days:", days);
      
      if (isNaN(days) || days <= 0) {
        console.log("❌ Invalid days value");
        toast({
          title: "Invalid Input",
          description: "Please enter a positive number of days.",
          variant: "destructive",
        });
        return;
      }

      console.log("📞 About to call deleteOldDbLogs with:", days);
      
      const result = await deleteOldDbLogs(days);
      
      console.log("✅ API call successful:", result);

      toast({
        title: "Success",
        description: result.message,
        variant: "default",
      });
      
      setDaysOlder("30");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("❌ Error:", error);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("🏁 handleDeleteLogs finished");
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Log Management">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delete Old Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Remove logs older than a specified number of days to free up storage space.
            </p>

            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="days">Delete logs older than (days)</Label>
                <Input
                  id="days"
                  type="number"
                  value={daysOlder}
                  onChange={(e) => setDaysOlder(e.target.value)}
                  placeholder="Enter number of days"
                  min="1"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleDeleteLogs}
                variant="destructive"
                className="flex items-center gap-2"
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isLoading ? "Deleting..." : "Delete Logs"}
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Warning: This action cannot be undone. Please ensure you have backed up any important logs before deletion.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center p-12 border border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-500 text-center">
            <h3 className="text-xl font-medium mb-2">Additional Log Management Features</h3>
            <p>More log management features will be implemented soon.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LogManagement;