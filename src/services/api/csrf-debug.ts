/**
 * CSRF Debug Utility
 *
 * This utility provides functions to help debug CSRF token issues
 */

import { API_BASE_URL } from "./config";

/**
 * Test the CSRF cookie endpoint with detailed logging
 */
export async function testCsrfEndpoint(): Promise<void> {
  console.group("CSRF Endpoint Test");
  console.log("Testing CSRF cookie endpoint...");

  try {
    // Extract the base URL without the /api suffix
    const baseUrl = API_BASE_URL.endsWith("/api")
      ? API_BASE_URL.substring(0, API_BASE_URL.length - 4)
      : API_BASE_URL;

    console.log(`Making request to: ${baseUrl}/sanctum/csrf-cookie`);
    console.log("Request headers:", {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    });

    const startTime = performance.now();
    const response = await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      mode: "cors",
    });
    const endTime = performance.now();

    console.log(`Response received in ${Math.round(endTime - startTime)}ms`);
    console.log("Response status:", response.status, response.statusText);
    console.log("Response headers:", {
      ...Object.fromEntries([...response.headers.entries()]),
    });

    // Check for cookies
    const cookies = document.cookie.split(";");
    console.log("Cookies after request:", cookies);

    const xsrfCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("XSRF-TOKEN="),
    );
    console.log("XSRF-TOKEN cookie found:", !!xsrfCookie);

    if (xsrfCookie) {
      const token = decodeURIComponent(xsrfCookie.split("=")[1]);
      console.log(
        "XSRF token (first 10 chars):",
        token.substring(0, 10) + "...",
      );
    }

    // Try to get response body
    try {
      const responseText = await response.text();
      console.log("Response body:", responseText || "(empty)");
    } catch (e) {
      console.error("Could not read response body:", e);
    }

    if (!response.ok) {
      console.error("CSRF endpoint test failed with status:", response.status);
    } else {
      console.log("CSRF endpoint test completed successfully");
    }
  } catch (error) {
    console.error("CSRF endpoint test failed with error:", error);
  }

  console.groupEnd();
}

/**
 * Check browser CORS settings and compatibility
 */
export function checkCorsCompatibility(): void {
  console.group("CORS Compatibility Check");

  // Check if credentials in CORS is supported
  console.log(
    "withCredentials supported:",
    "XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest(),
  );

  // Check if SameSite cookies might be an issue
  const userAgent = navigator.userAgent;
  const chromeVersion = userAgent.match(/Chrome\/([0-9]+)/);
  if (chromeVersion && parseInt(chromeVersion[1]) >= 80) {
    console.log("Chrome 80+ detected. SameSite cookie restrictions may apply.");
  }

  // Check if third-party cookies are likely blocked
  const isThirdPartyCookiesLikelyBlocked = () => {
    // Safari often blocks third-party cookies by default
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    // Firefox has enhanced tracking protection
    const isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;

    return isSafari || isFirefox;
  };

  console.log(
    "Third-party cookies likely blocked:",
    isThirdPartyCookiesLikelyBlocked(),
  );

  // Check current domain vs API domain
  const apiUrl = new URL(API_BASE_URL);
  const isSameDomain = window.location.hostname === apiUrl.hostname;
  console.log("API is on same domain:", isSameDomain);
  console.log("Current domain:", window.location.hostname);
  console.log("API domain:", apiUrl.hostname);

  console.groupEnd();
}

/**
 * Run all CSRF and CORS diagnostic tests
 */
export async function runCsrfDiagnostics(): Promise<void> {
  console.group("CSRF & CORS Diagnostics");
  console.log("Starting diagnostics at", new Date().toISOString());

  // Environment info
  console.log("Environment:", import.meta.env.MODE);
  console.log("API Base URL:", API_BASE_URL);
  console.log("Browser:", navigator.userAgent);

  // Check CORS compatibility
  checkCorsCompatibility();

  // Test CSRF endpoint
  await testCsrfEndpoint();

  console.log("Diagnostics completed at", new Date().toISOString());
  console.groupEnd();

  return;
}
