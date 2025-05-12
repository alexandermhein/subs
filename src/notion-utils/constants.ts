// Centralized constants and Notion API header helper
import { getPreferenceValues } from "@raycast/api";

export const NOTION_DATABASE_ID = "1f1fc478743580d7b41dff20ac953622";

const { notion_secret } = getPreferenceValues<{ notion_secret: string }>();
export function getNotionHeaders() {
  if (!notion_secret) throw new Error("Notion secret is not set in Raycast preferences.");
  return {
    Authorization: `Bearer ${notion_secret}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };
}
