const API_BASE = "http://localhost:8000/api";

export async function sendChatMessage(message, orderId = null, sessionId = null, imageData = null) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      order_id: orderId,
      session_id: sessionId,
      image_data: imageData
    })
  });
  if (!res.ok) throw new Error(`Chat error: ${res.statusText}`);
  return await res.json();
}


export async function getOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return await res.json();
}

export async function getPolicies() {
  const res = await fetch(`${API_BASE}/policies`);
  if (!res.ok) throw new Error("Failed to fetch policies");
  return await res.json();
}

export async function updatePolicy(category, updateData) {
  const res = await fetch(`${API_BASE}/policies/${encodeURIComponent(category)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error("Failed to update policy");
  return await res.json();
}

export async function getEscalations() {
  const res = await fetch(`${API_BASE}/escalations`);
  if (!res.ok) throw new Error("Failed to fetch escalations");
  return await res.json();
}

export async function reviewEscalation(ticketId, action, reviewerNotes) {
  const res = await fetch(`${API_BASE}/escalations/${ticketId}/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      reviewer_notes: reviewerNotes,
      reviewer_name: "Lead Fraud Investigator"
    })
  });
  if (!res.ok) throw new Error("Failed to resolve escalation");
  return await res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return await res.json();
}

export async function getAuditLogs() {
  const res = await fetch(`${API_BASE}/analytics/audit-logs`);
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return await res.json();
}

export async function resetSystemStore() {
  const res = await fetch(`${API_BASE}/analytics/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset store");
  return await res.json();
}
