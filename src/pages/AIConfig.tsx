
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Save } from "lucide-react";

const AIConfig = () => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);

  const aiModels = [
    { value: "gpt-4o", label: "OpenAI GPT-4o" },
    { value: "gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
    { value: "claude-3-opus", label: "Claude 3 Opus" },
    { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
    { value: "claude-3-haiku", label: "Claude 3 Haiku" }
  ];

  const handleSave = () => {
    // In a real application, this would save to backend/database
    localStorage.setItem('ai-config', JSON.stringify({
      selectedModel,
      openaiKey,
      claudeKey,
      updatedAt: new Date().toISOString()
    }));

    toast({
      title: "Configuration Saved",
      description: "AI configuration has been saved successfully.",
    });
  };

  const handleClear = () => {
    setSelectedModel("");
    setOpenaiKey("");
    setClaudeKey("");
    localStorage.removeItem('ai-config');
    
    toast({
      title: "Configuration Cleared",
      description: "All AI configuration has been cleared.",
    });
  };

  // Load saved config on component mount
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setSelectedModel(config.selectedModel || "");
      setOpenaiKey(config.openaiKey || "");
      setClaudeKey(config.claudeKey || "");
    }
  }, []);

  return (
    <Layout title="AI Configuration">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              AI Model Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model-select">Select AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an AI model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenaiKey ? "text" : "password"}
                  placeholder="Enter your OpenAI API key"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                >
                  {showOpenaiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Required for OpenAI models (GPT-4o, GPT-4o Mini)
              </p>
            </div>

            {/* Claude API Key */}
            <div className="space-y-2">
              <Label htmlFor="claude-key">Claude API Key</Label>
              <div className="relative">
                <Input
                  id="claude-key"
                  type={showClaudeKey ? "text" : "password"}
                  placeholder="Enter your Claude API key"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowClaudeKey(!showClaudeKey)}
                >
                  {showClaudeKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Required for Claude models (Opus, Sonnet, Haiku)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleClear}>
                Clear All
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-600">Selected Model</div>
                <div className="text-lg font-bold mt-1">
                  {selectedModel ? aiModels.find(m => m.value === selectedModel)?.label : "Not Selected"}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-600">OpenAI Key</div>
                <div className="text-lg font-bold mt-1">
                  {openaiKey ? "Configured" : "Not Set"}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-600">Claude Key</div>
                <div className="text-lg font-bold mt-1">
                  {claudeKey ? "Configured" : "Not Set"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AIConfig;


