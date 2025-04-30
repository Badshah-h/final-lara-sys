import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  runCsrfDiagnostics,
  testCsrfEndpoint,
} from "@/services/api/csrf-debug";
import { tokenService } from "@/services/auth/tokenService";
import { API_BASE_URL } from "@/services/api/config";

const CsrfDebugger = () => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [csrfToken, setCsrfToken] = useState<string | null>(
    tokenService.getCsrfToken(),
  );

  const runDiagnostics = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    // Override console.log to capture output
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const captureLog = (type: string, ...args: any[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === "object" && arg !== null) {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");

      setTestResults((prev) => [...prev, `[${type}] ${message}`]);

      if (type === "error") {
        originalConsoleError(...args);
      } else if (type === "warn") {
        originalConsoleWarn(...args);
      } else {
        originalConsoleLog(...args);
      }
    };

    console.log = (...args) => captureLog("info", ...args);
    console.error = (...args) => captureLog("error", ...args);
    console.warn = (...args) => captureLog("warn", ...args);

    try {
      await runCsrfDiagnostics();

      // Try to get a new CSRF token
      const token = await tokenService.initCsrfToken();
      setCsrfToken(token);

      captureLog("info", "-----------------------------------");
      captureLog(
        "info",
        "CSRF Token after diagnostics:",
        token || "Not available",
      );
    } catch (error) {
      captureLog("error", "Diagnostics failed:", error);
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      setIsRunningTests(false);
    }
  };

  const testCsrfCookie = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    // Override console.log to capture output
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    const captureLog = (type: string, ...args: any[]) => {
      const message = args
        .map((arg) => {
          if (typeof arg === "object" && arg !== null) {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(" ");

      setTestResults((prev) => [...prev, `[${type}] ${message}`]);

      if (type === "error") {
        originalConsoleError(...args);
      } else if (type === "warn") {
        originalConsoleWarn(...args);
      } else {
        originalConsoleLog(...args);
      }
    };

    console.log = (...args) => captureLog("info", ...args);
    console.error = (...args) => captureLog("error", ...args);
    console.warn = (...args) => captureLog("warn", ...args);

    try {
      await testCsrfEndpoint();

      // Try to get a new CSRF token
      const token = await tokenService.initCsrfToken();
      setCsrfToken(token);

      captureLog("info", "-----------------------------------");
      captureLog("info", "CSRF Token after test:", token || "Not available");
    } catch (error) {
      captureLog("error", "CSRF test failed:", error);
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      setIsRunningTests(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>CSRF Token Debugger</CardTitle>
        <CardDescription>
          Diagnose and fix CSRF token issues with your Laravel backend
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Current CSRF Token Status</h3>
              <p className="text-sm text-muted-foreground">
                Check if a valid CSRF token is available
              </p>
            </div>
            <Badge variant={csrfToken ? "success" : "destructive"}>
              {csrfToken ? "Available" : "Not Available"}
            </Badge>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-2">API Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <p className="text-sm font-medium">API Base URL</p>
                <p className="text-sm text-muted-foreground break-all">
                  {API_BASE_URL}
                </p>
              </div>
              <div className="p-4 border rounded-md">
                <p className="text-sm font-medium">CSRF Endpoint</p>
                <p className="text-sm text-muted-foreground break-all">
                  {API_BASE_URL.endsWith("/api")
                    ? API_BASE_URL.substring(0, API_BASE_URL.length - 4)
                    : API_BASE_URL}
                  /sanctum/csrf-cookie
                </p>
              </div>
            </div>
          </div>

          {testResults.length > 0 && (
            <>
              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Diagnostic Results</h3>
                <ScrollArea className="h-[300px] w-full border rounded-md p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {testResults.map((result, index) => {
                      const isError = result.includes("[error]");
                      const isWarning = result.includes("[warn]");
                      return (
                        <div
                          key={index}
                          className={`py-1 ${isError ? "text-red-500" : isWarning ? "text-yellow-500" : ""}`}
                        >
                          {result}
                        </div>
                      );
                    })}
                  </pre>
                </ScrollArea>
              </div>
            </>
          )}

          {!csrfToken && (
            <Alert variant="destructive">
              <AlertDescription>
                No CSRF token is currently available. This may cause
                authentication issues with your Laravel backend. Run the
                diagnostics to troubleshoot the problem.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={testCsrfCookie}
          disabled={isRunningTests}
        >
          {isRunningTests ? "Testing..." : "Test CSRF Cookie"}
        </Button>
        <Button onClick={runDiagnostics} disabled={isRunningTests}>
          {isRunningTests ? "Running Diagnostics..." : "Run Full Diagnostics"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CsrfDebugger;
