// ── MCP Forge Service Worker ──
// Handles chrome.debugger attachment, network capture, and backend communication

import type {
  CapturedRequest,
  ExtensionState,
  ExtensionMessage,
  ForgeResult,
} from "../types/messages";
import { DEFAULT_STATE } from "../types/messages";
import { filterRequests, buildHar } from "./har-builder";

// ── In-memory state ──
let state: ExtensionState = { ...DEFAULT_STATE };
let capturedRequests: CapturedRequest[] = [];
let activeTabId: number | null = null;
let pendingResponseBodies: Map<string, boolean> = new Map();

const BACKEND_URL = "http://localhost:8000";

// ── Persist state to chrome.storage.session ──
async function persistState() {
  try {
    await chrome.storage.session.set({ 
      mcpForgeState: state,
      mcpForgeActiveTabId: activeTabId,
      mcpForgeRequests: capturedRequests
    });
  } catch {
    // storage might not be available
  }
}

// ── Restore state on startup ──
async function restoreState() {
  try {
    const result = await chrome.storage.session.get([
      "mcpForgeState", 
      "mcpForgeActiveTabId", 
      "mcpForgeRequests"
    ]);
    if (result.mcpForgeState) state = result.mcpForgeState;
    if (result.mcpForgeActiveTabId) activeTabId = result.mcpForgeActiveTabId || null;
    if (result.mcpForgeRequests) capturedRequests = result.mcpForgeRequests || [];
  } catch {
    // use default
  }
}

restoreState();

// ── chrome.debugger Event Handler ──
function onDebuggerEvent(
  source: chrome.debugger.Debuggee,
  method: string,
  params: any
) {
  if (source.tabId !== activeTabId) return;

  switch (method) {
    case "Network.requestWillBeSent": {
      const req: CapturedRequest = {
        requestId: params.requestId,
        method: params.request.method,
        url: params.request.url,
        requestHeaders: params.request.headers || {},
        requestBody: params.request.postData,
        startTime: params.timestamp * 1000,
        resourceType: params.type,
      };
      capturedRequests.push(req);
      state.capturedCount = capturedRequests.length;
      persistState();
      break;
    }

    case "Network.responseReceived": {
      const existing = capturedRequests.find(
        (r) => r.requestId === params.requestId
      );
      if (existing) {
        existing.responseStatus = params.response.status;
        existing.mimeType = params.response.mimeType || "";
        existing.responseHeaders = params.response.headers || {};

        // Try to get response body
        pendingResponseBodies.set(params.requestId, true);
        chrome.debugger
          .sendCommand(
            { tabId: activeTabId! },
            "Network.getResponseBody",
            { requestId: params.requestId }
          )
          .then((result: any) => {
            if (result && result.body) {
              existing.responseBody = result.body.substring(0, 500);
            }
            pendingResponseBodies.delete(params.requestId);
          })
          .catch(() => {
            pendingResponseBodies.delete(params.requestId);
          });
      }
      break;
    }

    case "Network.loadingFinished": {
      const existing = capturedRequests.find(
        (r) => r.requestId === params.requestId
      );
      if (existing) {
        existing.endTime = params.timestamp * 1000;
      }
      break;
    }
  }
}

// ── Start Recording ──
async function startRecording(projectName: string, taskDescription: string) {
  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab found");

  activeTabId = tab.id;
  capturedRequests = [];
  pendingResponseBodies.clear();

  state = {
    phase: "RECORDING",
    projectName,
    taskDescription,
    capturedCount: 0,
    filteredCount: 0,
    result: null,
    error: null,
  };
  await persistState();

  // Attach debugger
  await chrome.debugger.attach({ tabId: activeTabId }, "1.3");
  await chrome.debugger.sendCommand({ tabId: activeTabId }, "Network.enable", {});

  // Listen for events
  chrome.debugger.onEvent.addListener(onDebuggerEvent);

  // Update icon badge
  chrome.action.setBadgeText({ text: "REC" });
  chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
}

// ── Stop Recording & Forge ──
async function stopAndForge() {
  if (!activeTabId) throw new Error("No active recording");

  // Detach debugger
  chrome.debugger.onEvent.removeListener(onDebuggerEvent);
  try {
    await chrome.debugger.detach({ tabId: activeTabId });
  } catch {
    // may already be detached
  }

  chrome.action.setBadgeText({ text: "..." });
  chrome.action.setBadgeBackgroundColor({ color: "#a855f7" });

  state.phase = "PROCESSING";
  await persistState();

  // Wait a moment for pending response bodies
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Filter noise
  const filtered = filterRequests(capturedRequests);
  state.filteredCount = filtered.length;
  await persistState();

  if (filtered.length === 0) {
    state.phase = "ERROR";
    state.error =
      "No API endpoints detected. Try performing more actions on the page (searches, clicks, form submissions).";
    await persistState();
    chrome.action.setBadgeText({ text: "" });
    return;
  }

  // Build HAR
  const harJson = buildHar(filtered);

  // POST to backend
  try {
    const formData = new FormData();
    const harBlob = new Blob([harJson], { type: "application/json" });
    formData.append("har_file", harBlob, `${state.projectName}.har`);
    formData.append("task_description", state.taskDescription);
    formData.append("server_name", state.projectName);

    const response = await fetch(`${BACKEND_URL}/generate/`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Backend returned ${response.status}`
      );
    }

    const result: ForgeResult = await response.json();

    state.phase = "RESULTS";
    state.result = result;
    state.error = null;
    await persistState();

    chrome.action.setBadgeText({ text: "✓" });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });

    // Clear badge after a few seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 5000);
  } catch (err: any) {
    state.phase = "ERROR";
    state.error = err.message || "Failed to connect to MCP Forge backend";
    await persistState();
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
  }

  // Cleanup
  activeTabId = null;
  capturedRequests = [];
  pendingResponseBodies.clear();
}

// ── Message Handler ──
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    switch (message.type) {
      case "START_RECORDING":
        startRecording(
          message.payload.projectName,
          message.payload.taskDescription
        )
          .then(() => sendResponse({ success: true }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true; // async response

      case "STOP_RECORDING":
        // Set phase to processing immediately to avoid message timeout
        state.phase = "PROCESSING";
        persistState();
        
        stopAndForge()
          .then(() => sendResponse({ success: true }))
          .catch((err) => {
            state.phase = "ERROR";
            state.error = err.message || "Unknown error during Forge";
            persistState();
            sendResponse({ success: false, error: err.message });
          });
        return true;

      case "GET_STATUS":
        sendResponse({ success: true, state });
        return false;

      case "RESET_STATE":
        state = { ...DEFAULT_STATE };
        activeTabId = null;
        capturedRequests = [];
        pendingResponseBodies.clear();
        chrome.action.setBadgeText({ text: "" });
        persistState().then(() => sendResponse({ success: true }));
        return true;

      default:
        sendResponse({ success: false, error: "Unknown message type" });
        return false;
    }
  }
);

// ── Handle debugger detach (e.g. user closes DevTools) ──
chrome.debugger.onDetach.addListener((source, reason) => {
  if (source.tabId === activeTabId && state.phase === "RECORDING") {
    state.phase = "IDLE";
    state.error = `Recording stopped: ${reason}`;
    persistState();
    chrome.action.setBadgeText({ text: "" });
    activeTabId = null;
    capturedRequests = [];
  }
});
