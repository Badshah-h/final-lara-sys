import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Code,
  Smartphone,
  MonitorIcon,
  Palette,
  Settings,
  Save,
  Copy,
  Check,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getWidgetConfig, saveWidgetConfig } from "@/services/api/widget";

const WidgetBuilder = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("appearance");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Define TypeScript interface for widget configuration
  interface WidgetConfigType {
    appearance: {
      primaryColor: string;
      secondaryColor: string;
      position: string;
      size: string;
      darkMode: boolean;
    };
    behavior: {
      autoOpen: boolean;
      autoOpenDelay: number;
      autoOpenTrigger?: string;
      persistOpen: boolean;
      showNotifications: boolean;
      collectUserInfo: boolean;
      requiredFields: string[];
    };
    content: {
      welcomeMessage: string;
      botName: string;
      placeholderText: string;
      offlineMessage: string;
    };
    advanced: {
      customCSS: string;
      customJS: string;
      domain: string;
      apiKey: string;
      secureMode?: boolean;
      dataCollection?: boolean;
    };
  }

  // Widget configuration state
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfigType>({
    appearance: {
      primaryColor: "#1e40af",
      secondaryColor: "#e2e8f0",
      position: "bottom-right",
      size: "medium",
      darkMode: true,
    },
    behavior: {
      autoOpen: false,
      autoOpenDelay: 5,
      autoOpenTrigger: "time",
      persistOpen: false,
      showNotifications: true,
      collectUserInfo: true,
      requiredFields: ["name", "email"],
    },
    content: {
      welcomeMessage: "Hi there! How can I help you today?",
      botName: "AI Assistant",
      placeholderText: "Type your message here...",
      offlineMessage:
        "We're currently offline. Please leave a message and we'll get back to you.",
    },
    advanced: {
      customCSS: "",
      customJS: "",
      domain: "",
      apiKey: "",
      secureMode: true,
      dataCollection: true,
    },
  });

  // Load widget configuration from API
  useEffect(() => {
    const fetchWidgetConfig = async () => {
      try {
        setLoading(true);
        const response = await getWidgetConfig();
        if (response.success && response.data) {
          setWidgetConfig(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching widget config:", error);
        toast({
          variant: "destructive",
          title: "Error loading configuration",
          description: "There was an error loading your widget configuration.",
        });
        setLoading(false);
      }
    };

    fetchWidgetConfig();
  }, [toast]);

  // Handle form field changes
  const handleChange = (section, field, value) => {
    setWidgetConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Save widget configuration
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await saveWidgetConfig(widgetConfig);
      if (response.success) {
        toast({
          title: "Configuration saved",
          description: "Your widget configuration has been saved successfully.",
        });
      } else {
        throw new Error(response.message || "Unknown error");
      }
      setSaving(false);
    } catch (error) {
      console.error("Error saving widget config:", error);
      toast({
        variant: "destructive",
        title: "Error saving configuration",
        description: "There was an error saving your widget configuration.",
      });
      setSaving(false);
    }
  };

  const handleCopyCode = () => {
    // Copy the widget embed code to clipboard
    const embedCode = `<script src="${window.location.origin}/widget.js" data-widget-id="${widgetConfig.advanced?.apiKey || "YOUR_API_KEY"}"></script>`;
    navigator.clipboard
      .writeText(embedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Failed to copy embed code to clipboard.",
        });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Widget Builder</h1>
          <p className="text-muted-foreground">
            Customize and generate your chat widget
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />{" "}
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Tabs
            defaultValue="appearance"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance">
                <Palette className="mr-2 h-4 w-4" /> Appearance
              </TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Widget Appearance</CardTitle>
                  <CardDescription>
                    Customize how your chat widget looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <div
                          className="h-10 w-10 rounded border"
                          style={{
                            backgroundColor:
                              widgetConfig.appearance?.primaryColor ||
                              "#1e40af",
                          }}
                        />
                        <Input
                          type="text"
                          value={
                            widgetConfig.appearance?.primaryColor || "#1e40af"
                          }
                          onChange={(e) =>
                            handleChange(
                              "appearance",
                              "primaryColor",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <div
                          className="h-10 w-10 rounded border"
                          style={{
                            backgroundColor:
                              widgetConfig.appearance?.secondaryColor ||
                              "#e2e8f0",
                          }}
                        />
                        <Input
                          type="text"
                          value={
                            widgetConfig.appearance?.secondaryColor || "#e2e8f0"
                          }
                          onChange={(e) =>
                            handleChange(
                              "appearance",
                              "secondaryColor",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Widget Position</Label>
                    <Select
                      value={
                        widgetConfig.appearance?.position || "bottom-right"
                      }
                      onValueChange={(value) =>
                        handleChange("appearance", "position", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">
                          Bottom Right
                        </SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Widget Size</Label>
                    <Select
                      value={widgetConfig.appearance?.size || "medium"}
                      onValueChange={(value) =>
                        handleChange("appearance", "size", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode Support</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for your widget
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={widgetConfig.appearance?.darkMode || false}
                      onCheckedChange={(checked) =>
                        handleChange("appearance", "darkMode", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Widget Behavior</CardTitle>
                  <CardDescription>
                    Configure how your chat widget behaves
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-open">Auto Open</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically open the chat after page load
                      </p>
                    </div>
                    <Switch
                      id="auto-open"
                      checked={widgetConfig.behavior?.autoOpen || false}
                      onCheckedChange={(checked) =>
                        handleChange("behavior", "autoOpen", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Auto Open Delay (seconds)</Label>
                    <Input
                      type="number"
                      value={widgetConfig.behavior?.autoOpenDelay || 5}
                      onChange={(e) =>
                        handleChange(
                          "behavior",
                          "autoOpenDelay",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Auto Open Trigger</Label>
                    <Select
                      value={widgetConfig.behavior?.autoOpenTrigger || "time"}
                      onValueChange={(value) =>
                        handleChange("behavior", "autoOpenTrigger", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Time Delay</SelectItem>
                        <SelectItem value="scroll">
                          Scroll Percentage
                        </SelectItem>
                        <SelectItem value="exit">Exit Intent</SelectItem>
                        <SelectItem value="inactive">User Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications for new messages
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={
                        widgetConfig.behavior?.showNotifications || false
                      }
                      onCheckedChange={(checked) =>
                        handleChange("behavior", "showNotifications", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="persist-open">Persist Open</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep the chat open after the user closes it
                      </p>
                    </div>
                    <Switch
                      id="persist-open"
                      checked={widgetConfig.behavior?.persistOpen || false}
                      onCheckedChange={(checked) =>
                        handleChange("behavior", "persistOpen", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="collect-info">Collect User Info</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect user information for analytics
                      </p>
                    </div>
                    <Switch
                      id="collect-info"
                      checked={widgetConfig.behavior?.collectUserInfo || false}
                      onCheckedChange={(checked) =>
                        handleChange("behavior", "collectUserInfo", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Widget Content</CardTitle>
                  <CardDescription>
                    Customize the text and content of your widget
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Widget Title</Label>
                    <Input
                      type="text"
                      value={widgetConfig.content?.botName || "AI Assistant"}
                      onChange={(e) =>
                        handleChange("content", "botName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Input
                      type="text"
                      value={
                        widgetConfig.content?.welcomeMessage ||
                        "Hi there! How can I help you today?"
                      }
                      onChange={(e) =>
                        handleChange(
                          "content",
                          "welcomeMessage",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder Text</Label>
                    <Input
                      type="text"
                      value={
                        widgetConfig.content?.placeholderText ||
                        "Type your message here..."
                      }
                      onChange={(e) =>
                        handleChange(
                          "content",
                          "placeholderText",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Offline Message</Label>
                    <Input
                      type="text"
                      value={
                        widgetConfig.content?.offlineMessage ||
                        "We're currently offline. Please leave a message and we'll get back to you."
                      }
                      onChange={(e) =>
                        handleChange(
                          "content",
                          "offlineMessage",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>
                    Configure advanced options for your widget
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Widget ID</Label>
                    <Input
                      type="text"
                      value={widgetConfig.advanced?.apiKey || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Domain Restriction</Label>
                    <Input
                      type="text"
                      value={widgetConfig.advanced?.domain || ""}
                      placeholder="example.com"
                      onChange={(e) =>
                        handleChange("advanced", "domain", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="secure-mode">Secure Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable additional security features
                      </p>
                    </div>
                    <Switch
                      id="secure-mode"
                      checked={widgetConfig.advanced?.secureMode || false}
                      onCheckedChange={(checked) =>
                        handleChange("advanced", "secureMode", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-collection">Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Collect user data for analytics
                      </p>
                    </div>
                    <Switch
                      id="data-collection"
                      checked={widgetConfig.advanced?.dataCollection || false}
                      onCheckedChange={(checked) =>
                        handleChange("advanced", "dataCollection", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Preview</CardTitle>
              <CardDescription>
                See how your widget will look in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-b">
                <div className="flex justify-center p-2">
                  <Button
                    variant={
                      previewDevice === "desktop" ? "secondary" : "ghost"
                    }
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <MonitorIcon className="h-4 w-4" />
                    Desktop
                  </Button>
                  <Button
                    variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </Button>
                </div>
              </div>
              <div className="h-[400px] relative bg-muted/20 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`${previewDevice === "mobile" ? "w-[320px]" : "w-[400px]"} h-[350px] bg-background rounded-lg shadow-lg overflow-hidden border`}
                  >
                    <div
                      className="p-4 flex justify-between items-center"
                      style={{
                        backgroundColor:
                          widgetConfig.appearance?.primaryColor || "#1e40af",
                        color: "white",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-white/20"></div>
                        <div>
                          <h3 className="font-medium">Chat Support</h3>
                          <p className="text-xs opacity-80">Online</p>
                        </div>
                      </div>
                      <button className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="sr-only">Close</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <div
                      className="p-4 h-[240px] overflow-y-auto"
                      style={{
                        backgroundColor:
                          widgetConfig.appearance?.secondaryColor || "#e2e8f0",
                      }}
                    >
                      <div className="flex justify-start mb-4">
                        <div className="max-w-[80%] rounded-lg p-3 bg-white">
                          <p>Hello! How can I help you today?</p>
                        </div>
                      </div>
                      <div className="flex justify-end mb-4">
                        <div
                          className="max-w-[80%] rounded-lg p-3 text-white"
                          style={{
                            backgroundColor:
                              widgetConfig.appearance?.primaryColor ||
                              "#1e40af",
                          }}
                        >
                          <p>I have a question about your services.</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-3 bg-white">
                          <p>
                            I'd be happy to help with that! What would you like
                            to know about our services?
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 p-2 rounded border"
                      />
                      <button
                        className="px-4 py-2 text-white rounded"
                        style={{
                          backgroundColor:
                            widgetConfig.appearance?.primaryColor || "#1e40af",
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Add this code to your website to display the chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <code className="text-xs">
                  &lt;script src="https://chat-widget.example.com/widget.js"
                  data-widget-id="my-chat-widget"&gt;&lt;/script&gt;
                </code>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleCopyCode}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" /> Copy Code
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WidgetBuilder;
