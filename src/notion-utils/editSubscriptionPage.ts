import { getNotionHeaders } from "./constants";

/**
 * Update a subscription page in Notion by page_id.
 * Only properties in the values object will be updated.
 */
export async function updateSubscriptionPage(pageId: string, values: Record<string, any>) {
  const body = {
    properties: values,
  };
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: getNotionHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update Notion page: ${error}`);
  }
  return res.json();
}

/**
 * Delete (archive) a subscription page in Notion by page_id.
 * This sets archived: true, which removes it from all database views.
 */
export async function deleteSubscriptionPage(pageId: string) {
  const body = {
    archived: true,
  };
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers: getNotionHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete (archive) Notion page: ${error}`);
  }
  return res.json();
}
