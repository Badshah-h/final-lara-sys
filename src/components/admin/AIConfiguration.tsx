import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Sparkles,
  MessageSquare,
  Wand2,
  Zap,
  Save,
  Play,
} from "lucide-react";

const AIConfiguration = () => {
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant for our company. Your goal is to provide accurate, helpful information to users in a friendly and professional tone.",
  );
  const [testPrompt, setTestPrompt] = useState("How can you help me?");
  const [testResponse, setTestResponse] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = () => {
    setIsTesting(true);
    // Simulate API call
    setTimeout(() => {
      setTestResponse(
        "I can help you with a variety of tasks! As your AI assistant, I can answer questions about your account, provide information about our products and services, help troubleshoot common issues, and connect you with a human agent if needed. Just let me know what you're looking for, and I'll do my best to assist you in a friendly and professional manner.",
      );
      setIsTesting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Configuration</h1>
          <p className="text-muted-foreground">
            Configure AI models, prompts, and response formatting
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <Tabs defaultValue="models">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">
            <Bot className="mr-2 h-4 w-4" /> AI Models
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <MessageSquare className="mr-2 h-4 w-4" /> Prompt Templates
          </TabsTrigger>
          <TabsTrigger value="formatting">
            <Wand2 className="mr-2 h-4 w-4" /> Response Formatting
          </TabsTrigger>
          <TabsTrigger value="testing">
            <Zap className="mr-2 h-4 w-4" /> Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Model Card - Gemini */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-blue-500" /> Gemini
                  </CardTitle>
                  <Switch checked={true} />
                </div>
                <CardDescription>Google's advanced AI model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input type="password" value="••••••••••••••••" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Temperature: {temperature}</Label>
                    </div>
                    <Slider
                      value={[temperature]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => setTemperature(value[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model Version</Label>
                    <Select defaultValue="gemini-pro">
                      <SelectTrigger>
                        <SelectValue placeholder="Select model version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="gemini-pro-vision">
                          Gemini Pro Vision
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset</Button>
                <Button>Apply</Button>
              </CardFooter>
            </Card>

            {/* Model Card - Hugging Face */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />{" "}
                    Hugging Face
                  </CardTitle>
                  <Switch checked={false} />
                </div>
                <CardDescription>Open-source model integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input type="password" placeholder="Enter API key" />
                  </div>
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input placeholder="e.g., mistralai/Mistral-7B-v0.1" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Temperature: 0.5</Label>
                    </div>
                    <Slider value={[0.5]} min={0} max={1} step={0.1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input type="number" value="512" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset</Button>
                <Button>Apply</Button>
              </CardFooter>
            </Card>

            {/* Model Card - Custom */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-purple-500" /> Custom
                    Model
                  </CardTitle>
                  <Switch checked={false} />
                </div>
                <CardDescription>Add your own AI model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] flex items-center justify-center border-2 border-dashed rounded-md">
                  <div className="text-center">
                    <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Click to add a new AI model
                    </p>
                    <Button variant="outline" className="mt-4">
                      Add Model
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Model Routing Rules</CardTitle>
              <CardDescription>
                Configure when to use each AI model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Default Model</Label>
                    <Select defaultValue="gemini-pro">
                      <SelectTrigger>
                        <SelectValue placeholder="Select default model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="huggingface">
                          Hugging Face
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fallback Model</Label>
                    <Select defaultValue="huggingface">
                      <SelectTrigger>
                        <SelectValue placeholder="Select fallback model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                        <SelectItem value="huggingface">
                          Hugging Face
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Routing Rules</Label>
                  <div className="border rounded-md">
                    <div className="p-4 border-b flex items-center justify-between">
                      <div>
                        <p className="font-medium">Technical Support Queries</p>
                        <p className="text-sm text-muted-foreground">
                          Route to Gemini Pro
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 border-b flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sales Inquiries</p>
                        <p className="text-sm text-muted-foreground">
                          Route to Hugging Face
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-center">
                      <Button variant="outline">Add New Rule</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Prompt</CardTitle>
              <CardDescription>
                Define the base behavior of your AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  rows={6}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Use variables like {"{company_name}"} or {"{user_name}"}
                  </span>
                  <span>{systemPrompt.length} characters</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt Templates</CardTitle>
              <CardDescription>
                Create specialized prompts for different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <p className="font-medium">Welcome Message</p>
                      <p className="text-sm text-muted-foreground">
                        Initial greeting for new users
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <p className="font-medium">Product Information</p>
                      <p className="text-sm text-muted-foreground">
                        Details about products and services
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <p className="font-medium">Technical Support</p>
                      <p className="text-sm text-muted-foreground">
                        Handling technical questions
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    <Button variant="outline">Add New Template</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Integration</CardTitle>
              <CardDescription>
                Connect your AI to your knowledge sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="kb-integration" />
                    <Label htmlFor="kb-integration">
                      Enable Knowledge Base Integration
                    </Label>
                  </div>
                  <Button variant="outline">Manage Knowledge Base</Button>
                </div>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">
                    When enabled, the AI will use your knowledge base to ground
                    its responses in your company's specific information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formatting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Formatting</CardTitle>
              <CardDescription>
                Configure how AI responses are structured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Default Format</Label>
                    <Select defaultValue="conversational">
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversational">
                          Conversational
                        </SelectItem>
                        <SelectItem value="structured">Structured</SelectItem>
                        <SelectItem value="bullet-points">
                          Bullet Points
                        </SelectItem>
                        <SelectItem value="step-by-step">
                          Step by Step
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Response Length</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tone of Voice</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Formatting Options</Label>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="headings" checked />
                      <Label htmlFor="headings">Use Headings</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="bullet-points" checked />
                      <Label htmlFor="bullet-points">Use Bullet Points</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="links" checked />
                      <Label htmlFor="links">Include Links</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="code-blocks" />
                      <Label htmlFor="code-blocks">Format Code Blocks</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Voice</CardTitle>
              <CardDescription>
                Customize how your brand appears in AI responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Brand Name</Label>
                  <Input placeholder="Your Company Name" />
                </div>
                <div className="space-y-2">
                  <Label>Brand Positioning</Label>
                  <Select defaultValue="start">
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="start">Start of Response</SelectItem>
                      <SelectItem value="inline">
                        Inline with Response
                      </SelectItem>
                      <SelectItem value="end">End of Response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand Signature</Label>
                  <Textarea placeholder="Custom text to include with responses" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-Up Suggestions</CardTitle>
              <CardDescription>
                Configure suggested next steps for users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="follow-up" checked />
                    <Label htmlFor="follow-up">
                      Enable Follow-Up Suggestions
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Suggestions</Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border rounded-md">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <p className="font-medium">Need more help?</p>
                      <p className="text-sm text-muted-foreground">
                        General follow-up
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <p className="font-medium">Talk to a human agent</p>
                      <p className="text-sm text-muted-foreground">
                        Escalation option
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    <Button variant="outline">Add New Suggestion</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Response Testing</CardTitle>
              <CardDescription>
                Test your AI configuration with sample prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Prompt</Label>
                  <Textarea
                    placeholder="Enter a test prompt"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleTest}
                    disabled={isTesting || !testPrompt.trim()}
                  >
                    {isTesting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" /> Test Response
                      </>
                    )}
                  </Button>
                </div>

                {testResponse && (
                  <div className="mt-4">
                    <Label>AI Response</Label>
                    <div className="mt-2 p-4 border rounded-md bg-muted/20">
                      <p>{testResponse}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration Validation</CardTitle>
              <CardDescription>
                Check your AI setup for potential issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md">
                  <div className="p-4 border-b flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-600"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">API Keys Valid</p>
                      <p className="text-sm text-muted-foreground">
                        All API keys are properly configured
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border-b flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-600"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">System Prompt</p>
                      <p className="text-sm text-muted-foreground">
                        System prompt is properly configured
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-yellow-600"
                      >
                        <path d="M12 9v4" />
                        <path d="M12 16h.01" />
                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Knowledge Base</p>
                      <p className="text-sm text-muted-foreground">
                        Knowledge base integration is enabled but no documents
                        are uploaded
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIConfiguration;
