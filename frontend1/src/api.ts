export const API_BASE = "http://localhost:8000";

// Response Types matching FastAPI backend contracts exactly
export interface CaseUploadResponse {
  status: string;
  case_id: string;
  file: string;
}

export interface CaseAskResponse {
  case_id: string;
  answer: string;
}

export interface CaseImproveResponse {
  status: string;
  case_id: string;
}

export interface CaseForgetResponse {
  status: string;
  case_id: string;
}

export interface CaseContradictionsResponse {
  case_id: string;
  hearing_1_statement: string;
  hearing_3_statement: string;
  contradiction_check: {
    contradiction: boolean;
    explanation: string;
  };
}

export interface CaseMemoryResponse {
  case_id: string;
  cognee_status: string;
  memory_stored: number;
  embeddings_created: number;
}

export interface MemorySummaryCase {
  case_id: string;
  status: string;
}

export interface MemorySummaryResponse {
  total_cases: number;
  total_documents: number;
  cases: MemorySummaryCase[];
}

export interface HealthResponse {
  status: string;
}

/**
 * Custom fetch wrapper implementing an AbortController for a strict 120-second timeout.
 * This is crucial because /ask and /contradictions endpoints involve LLM operations and rate limits.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out (server took longer than 120 seconds to respond).");
    }
    throw error;
  }
}

// 1. POST /cases/{case_id}/upload
export async function uploadCase(caseId: string, file: File): Promise<CaseUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithTimeout(`${API_BASE}/cases/${encodeURIComponent(caseId)}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Upload failed with status code ${response.status}`);
  }

  return response.json();
}

// 2. POST /cases/{case_id}/ask
export async function askCase(caseId: string, question: string): Promise<CaseAskResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/cases/${encodeURIComponent(caseId)}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Ask query failed with status code ${response.status}`);
  }

  return response.json();
}

// 3. POST /cases/{case_id}/improve
export async function improveCase(caseId: string): Promise<CaseImproveResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/cases/${encodeURIComponent(caseId)}/improve`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Improve memory failed with status code ${response.status}`);
  }

  return response.json();
}

// 4. DELETE /cases/{case_id}
export async function forgetCase(caseId: string): Promise<CaseForgetResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/cases/${encodeURIComponent(caseId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Forget operation failed with status code ${response.status}`);
  }

  return response.json();
}

// 5. POST /cases/{case_id}/contradictions
export async function runContradictionScan(caseId: string): Promise<CaseContradictionsResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/cases/${encodeURIComponent(caseId)}/contradictions`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Contradiction scan failed with status code ${response.status}`);
  }

  return response.json();
}

// 6. GET /cases/{case_id}/memory
export async function getCaseMemory(caseId: string): Promise<CaseMemoryResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/cases/${encodeURIComponent(caseId)}/memory`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Memory retrieval failed with status code ${response.status}`);
  }

  return response.json();
}

// 7. GET /memory/summary
export async function getMemorySummary(): Promise<MemorySummaryResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/memory/summary`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Memory summary retrieval failed with status code ${response.status}`);
  }

  return response.json();
}

// 8. GET /health
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetchWithTimeout(`${API_BASE}/health`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status code ${response.status}`);
  }

  return response.json();
}
