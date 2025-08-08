import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Loader2, Settings, Info, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LogManagement = () => {
  const [daysOlder, setDaysOlder] = useState("30");
  const [isLoading, setIsLoading] = useState(false);
  const [isLevelLoading, setIsLevelLoading] = useState(false);
  const [selectedLogLevel, setSelectedLogLevel] = useState("INFO");
  const [currentLogLevel, setCurrentLogLevel] = useState("INFO");
  const [lastUpdated, setLastUpdated] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("default");
  const [connectionError, setConnectionError] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  const API_BASE_URL = "http://127.0.0.1:8000";

  const logLevels = [
    { 
      value: "DEBUG", 
      label: "Debug", 
      description: "Shows ONLY debug messages (most detailed)",
      color: "bg-gray-100 text-gray-800"
    },
    { 
      value: "INFO", 
      label: "Info", 
      description: "Shows ONLY informational messages",
      color: "bg-blue-100 text-blue-800"
    },
    { 
      value: "WARNING", 
      label: "Warning", 
      description: "Shows ONLY warning messages",
      color: "bg-yellow-100 text-yellow-800"
    },
    { 
      value: "ERROR", 
      label: "Error", 
      description: "Shows ONLY error messages",
      color: "bg-red-100 text-red-800"
    }
  ];

  const showToast = (message, type = "default") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Enhanced API call functions with better error handling
  const getCurrentLogLevel = async () => {
    console.log("🌐 getCurrentLogLevel called");
    
    const url = `${API_BASE_URL}/logs/level`;
    console.log("📡 Making request to:", url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("📬 Response status:", response.status);
      console.log("📬 Response headers:", response.headers.get('content-type'));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error("🔥 Non-JSON Response:", textResponse.substring(0, 200) + '...');
        throw new Error(`Server returned HTML instead of JSON. Is your FastAPI server running on ${API_BASE_URL}?`);
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📋 Log level data:", data);
      return data;
    } catch (error) {
      console.error('🔥 Error fetching current log level:', error);
      throw error;
    }
  };

  const updateLogLevel = async (level) => {
    console.log("🌐 updateLogLevel called with:", level);
    
    const url = `${API_BASE_URL}/logs/level`;
    console.log("📡 Making request to:", url);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ log_level: level }),
      });

      console.log("📬 Response status:", response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error("🔥 Non-JSON Response:", textResponse.substring(0, 200) + '...');
        throw new Error(`Server returned HTML instead of JSON. Is your FastAPI server running on ${API_BASE_URL}?`);
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📋 Update result:", data);
      return data;
    } catch (error) {
      console.error('🔥 Error updating log level:', error);
      throw error;
    }
  };

  const deleteOldLogFiles = async (days) => {
    console.log("🌐 deleteOldLogFiles called with days:", days);
    
    if (isNaN(days) || days <= 0) {
      throw new Error("Number of days must be a positive integer.");
    }

    const url = `${API_BASE_URL}/logs/delete-old-logs/?days=${days}`;
    console.log("📡 Making request to:", url);

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📬 Response status:", response.status);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error("🔥 Non-JSON Response:", textResponse.substring(0, 200) + '...');
        throw new Error(`Server returned HTML instead of JSON. Is your FastAPI server running on ${API_BASE_URL}?`);
      }

      const data = await response.json();
      console.log("📋 Response data:", data);

      if (!response.ok) {
        throw new Error(data.detail || "An unexpected error occurred while deleting log files.");
      }

      return data;
    } catch (error) {
      console.error("🔥 API Error:", error);
      throw error;
    }
  };

  // Test server connection
  const testServerConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/docs`, { method: 'HEAD' });
      return response.status < 400;
    } catch {
      return false;
    }
  };

  // Fetch current log level on component mount
  useEffect(() => {
    const fetchCurrentLogLevel = async () => {
      setIsInitializing(true);
      setConnectionError("");
      
      try {
        // First test if server is reachable
        const isServerUp = await testServerConnection();
        if (!isServerUp) {
          throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if your FastAPI server is running.`);
        }

        const response = await getCurrentLogLevel();
        setCurrentLogLevel(response.log_level);
        setSelectedLogLevel(response.log_level);
        setLastUpdated(response.last_updated);
        setConnectionError("");
      } catch (error) {
        console.error("Failed to fetch current log level:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setConnectionError(errorMessage);
        
        // Set defaults
        setCurrentLogLevel("INFO");
        setSelectedLogLevel("INFO");
        
        showToast(
          `Connection failed: ${errorMessage}. Using default INFO level.`,
          "error"
        );
      } finally {
        setIsInitializing(false);
      }
    };

    fetchCurrentLogLevel();
  }, []);

  const handleDeleteLogs = async () => {
    setIsLoading(true);
    
    try {
      const days = parseInt(daysOlder, 10);
      
      if (isNaN(days) || days <= 0) {
        showToast("Please enter a positive number of days.", "error");
        return;
      }

      const result = await deleteOldLogFiles(days);
      
      showToast(result.message, "success");
      setDaysOlder("30");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogLevelChange = async () => {
    if (selectedLogLevel === currentLogLevel) {
      showToast("Selected log level is already active.", "info");
      return;
    }

    setIsLevelLoading(true);
    
    try {
      const result = await updateLogLevel(selectedLogLevel);
      
      setCurrentLogLevel(selectedLogLevel);
      setLastUpdated(result.updated_at);
      setConnectionError("");

      showToast(
        `Log level updated to ${selectedLogLevel}. Now showing ONLY ${selectedLogLevel} level logs.`,
        "success"
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(errorMessage, "error");
      setSelectedLogLevel(currentLogLevel);
    } finally {
      setIsLevelLoading(false);
    }
  };

  const currentLevelConfig = logLevels.find(level => level.value === currentLogLevel);

  if (isInitializing) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Connecting to server...</p>
              <p className="text-sm text-gray-500 mt-2">Trying to reach {API_BASE_URL}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
<Layout title="Log Management">    
  <div className="max-w-4xl mx-auto p-6 space-y-6">
      {toastMessage && (
        <Alert className={`${toastType === 'error' ? 'border-red-500' : toastType === 'warning' ? 'border-yellow-500' : toastType === 'success' ? 'border-green-500' : 'border-blue-500'}`}>
          <AlertDescription>{toastMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Log Level Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Important Notice about Exact Filtering */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>EXACT LEVEL FILTERING:</strong> This system shows ONLY logs of the selected level, not all levels above it.
              For example, if you select WARNING, you will see ONLY warning messages, not errors or critical messages.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Current Active Level:</span>
            <span className={`px-3 py-1 rounded-md text-sm font-medium ${currentLevelConfig?.color || 'bg-gray-100 text-gray-800'}`}>
              {currentLogLevel}
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Select New Log Level</Label>
            <RadioGroup
              value={selectedLogLevel}
              onValueChange={setSelectedLogLevel}
              // disabled={isLevelLoading || connectionError}
              className="space-y-3"
            >
              {logLevels.map((level) => (
                <div key={level.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem
                    value={level.value}
                    id={level.value}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={level.value}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {level.label}
                      </Label>
                      <span className={`px-2 py-0.5 rounded text-xs ${level.color}`}>
                        {level.value}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {level.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button
                onClick={handleLogLevelChange}
                className="flex items-center gap-2"
                // disabled={isLevelLoading || selectedLogLevel === currentLogLevel || connectionError}
                type="button"
              >
                {isLevelLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
                {isLevelLoading ? "Updating..." : "Apply Log Level"}
              </Button>
              
              {selectedLogLevel !== currentLogLevel && !connectionError && (
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                  <Info className="h-4 w-4 inline mr-1" />
                  Will show ONLY {selectedLogLevel} level messages
                </div>
              )}
            </div>

          
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Delete Old Log Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Remove log files older than a specified number of days to free up storage space.
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
                // disabled={isLoading || connectionError}
              />
            </div>
            <Button
              onClick={handleDeleteLogs}
              variant="destructive"
              className="flex items-center gap-2"
              // disabled={isLoading || connectionError}
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

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. Please ensure you have backed up any important logs before deletion.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
};

export default LogManagement;