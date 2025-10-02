import axios from "axios";

// Simple Judge0 client for the free API
// Docs: https://judge0.com/

const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_RAPID_API_KEY = process.env.RAPIDAPI_KEY || process.env.JUDGE0_API_KEY || "";

const defaultHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (JUDGE0_BASE_URL.includes("rapidapi")) {
    headers["x-rapidapi-key"] = JUDGE0_RAPID_API_KEY;
    headers["x-rapidapi-host"] = new URL(JUDGE0_BASE_URL).host;
  }
  return headers;
};

export async function createSubmission(payload) {
  // payload: { source_code, language_id, stdin, expected_output, cpu_time_limit, memory_limit }
  const url = `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`;
  const { data } = await axios.post(url, payload, { headers: defaultHeaders() });
  return data; // { token }
}

export async function getSubmission(token) {
  const url = `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`;
  const { data } = await axios.get(url, { headers: defaultHeaders() });
  return data;
}

export async function waitForResult(token, { timeoutMs = 15000, intervalMs = 1200 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const res = await getSubmission(token);
    const statusId = res?.status?.id;
    if (statusId && statusId >= 3) {
      return res; // Completed
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return await getSubmission(token);
}

export const LanguageIds = {
  // Common language IDs for Judge0 CE
  // Update as needed on the client side
  C: 50,
  CPP: 54,
  JAVA: 62,
  PYTHON: 71,
  JAVASCRIPT: 63,
  GO: 60,
};


