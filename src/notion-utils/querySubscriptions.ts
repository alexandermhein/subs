import { NOTION_DATABASE_ID, getNotionHeaders } from "./constants";

export type NotionQueryBody = {
  filter?: object;
  sorts?: object[];
  page_size?: number;
};

export async function querySubscriptions(queryBody: NotionQueryBody = {}) {
  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
    method: "POST",
    headers: getNotionHeaders(),
    body: JSON.stringify(queryBody),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Notion query failed: ${error}`);
  }
  return res.json();
}
