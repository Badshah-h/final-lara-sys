import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  Edit,
  ArrowUp,
  ArrowDown,
  Play,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FollowUpSuggestion } from "@/types/ai-configuration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export interface FollowUpManagerProps {
  standalone?: boolean;
}

export const FollowUpManager = ({
  standalone = false,
}: FollowUpManagerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<FollowUpSuggestion | null>(null);
  const [newSuggestion, setNewSuggestion] = useState<Partial<FollowUpSuggestion>>({
    text: "",
    description: "",
    order: 0,
  });
  const [enableFollowUps, setEnableFollowUps] = useState(true);
  const [maxSuggestions, setMaxSuggestions] = useState(3);
  const [testResponse, setTestResponse] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState("suggestions");

  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([
    {
      id: "suggestion1",
      text: "Need more help?",
      description: "General follow-up",
      order: 1,
    },
    {
      id: "suggestion2",
      text: "Talk to a human agent",
      description: "Escalation option",
      order: 2,
    },
    {
      id: "suggestion3",
      text: "Learn about our pricing",
      description: "Sales inquiry",
      order: 3,
    },
  ]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleAddSuggestion = () => {
    setNewSuggestion({
      text: "",
      description: "",
      order: suggestions.length + 1,
    });
    setShowAddDialog(true);
  };

  const handleEditSuggestion = (suggestion: FollowUpSuggestion) => {
    setCurrentSuggestion(suggestion);
    setShowEditDialog(true);
  };

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter((suggestion) => suggestion.id !== id));
  };

  const handleSaveNewSuggestion = () => {
    if (newSuggestion.text) {
      const suggestion: FollowUpSuggestion = {
        id: `suggestion${suggestions.length + 1}`,
        text: newSuggestion.text,
        description: newSuggestion.description || "",
        order: newSuggestion.order || suggestions.length + 1,
      };

      setSuggestions([...suggestions, suggestion]);
      setShowAddDialog(false);
    }
  };

  const handleSaveEditedSuggestion = () => {
    if (currentSuggestion) {
      const updatedSuggestions = suggestions.map((suggestion) =>
        suggestion.id === currentSuggestion.id ? currentSuggestion : suggestion
      );
      setSuggestions(updatedSuggestions);
      setShowEditDialog(false);
      setCurrentSuggestion(null);
    }
  };

  const handleMoveUp = (id: string) => {
    const index = suggestions.findIndex((suggestion) => suggestion.id === id);
    if (index > 0) {
      const newSuggestions = [...suggestions];
      const temp = newSuggestions[index].order;
      newSuggestions[index].order = newSuggestions[index - 1].order;
      newSuggestions[index - 1].order = temp;
      newSuggestions.sort((a, b) => a.order - b.order);
      setSuggestions(newSuggestions);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = suggestions.findIndex((suggestion) => suggestion.id === id);
    if (index < suggestions.length - 1) {
      const newSuggestions = [...suggestions];
      const temp = newSuggestions[index].order;
      newSuggestions[index].order = newSuggestions[index + 1].order;
      newSuggestions[index + 1].order = temp;
      newSuggestions.sort((a, b) => a.order - b.order);
      setSuggestions(newSuggestions);
    }
  };

  const handleTest = () => {
    setIsTesting(true);
    // Simulate API call
    setTimeout(() => {
      const response = "Our product offers several powerful features designed to enhance your customer experience. The AI-powered chat provides intelligent responses based on your business knowledge. We also offer multi-channel support, allowing seamless integration with your website, mobile app, and social media platforms.";
      
      const followUps = enableFollowUps
        ? suggestions
            .slice(0, maxSuggestions)
            .map((s) => `- ${s.text}`)
            .join("\n")
        : "";
      
      setTestResponse(
        followUps
          ? `${response}\n\n${followUps}`
          : response
      );
      setIsTesting(false);
      setActiveTab("preview");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {standalone && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Follow-Up Suggestions</h1>
            <p className="text-muted-foreground">
              Configure suggested next steps for users
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="suggestions">
            <MessageSquare className="mr-2 h-4 w-4" /> Suggestions
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Play className="mr-2 h-4 w-4" /> Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Follow-Up Suggestions</CardTitle>
                  <CardDescription>
                    Configure suggested next steps for users
                  </CardDescription>
                </div>
                <Switch
                  checked={enableFollowUps}
                  onCheckedChange={setEnableFollowUps}
                  id="enable-followups"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="max-suggestions">Maximum Suggestions</Label>
                    <p className="text-sm text-muted-foreground">
                      How many suggestions to show at once
                    </p>
                  </div>
                  <Select
                    value={maxSuggestions.toString()}
                    onValueChange={(value) => setMaxSuggestions(parseInt(value))}
                    disabled={!enableFollowUps}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
