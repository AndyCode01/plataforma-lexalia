const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function apiGet(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
    method: 'GET',
  });
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}

export async function apiPost(path, body, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let extra = '';
    try {
      const data = await res.json();
      if (data?.message) extra = `: ${data.message}`;
      if (data?.hint) extra += ` – ${data.hint}`;
    } catch (_) {}
    throw new Error(`POST ${path} ${res.status}${extra}`);
  }
  return res.json();
}

export async function apiPatch(path, body, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} ${res.status}`);
  return res.json();
}

export async function apiPut(path, body, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} ${res.status}`);
  return res.json();
}

export async function apiDelete(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`DELETE ${path} ${res.status}`);
  return res.json();
}

export function withAuth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function apiUpload(path, file, opts = {}) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { ...(opts.headers || {}) },
    body: form,
  });
  if (!res.ok) {
    let extra = '';
    try {
      const data = await res.json();
      if (data?.message) extra = `: ${data.message}`;
    } catch (_) {}
    throw new Error(`POST ${path} ${res.status}${extra}`);
  }
  return res.json();
}
