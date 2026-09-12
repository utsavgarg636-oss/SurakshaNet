const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchUserProfile() {
  const res = await fetch(`${API_BASE_URL}/api/user/profile`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function fetchTrustedContacts() {
  const res = await fetch(`${API_BASE_URL}/api/contacts`);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

export async function processVoiceCommand(transcribedText) {
  const res = await fetch(`${API_BASE_URL}/api/voice/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcribed_text: transcribedText })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to process voice input');
  }
  return res.json();
}

export async function executeTransaction(payload) {
  const res = await fetch(`${API_BASE_URL}/api/transactions/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to execute transaction');
  }
  return res.json();
}

export async function fetchGuardianAlerts() {
  const res = await fetch(`${API_BASE_URL}/api/guardian/alerts`);
  if (!res.ok) throw new Error('Failed to fetch guardian alerts');
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE_URL}/api/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchScamRules() {
  const res = await fetch(`${API_BASE_URL}/api/scam-rules`);
  if (!res.ok) throw new Error('Failed to fetch scam rules');
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE_URL}/api/reset-demo`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo data');
  return res.json();
}
