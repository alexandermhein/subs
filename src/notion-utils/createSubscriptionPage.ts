import { NOTION_DATABASE_ID, getNotionHeaders } from "./constants";

export type SubscriptionFormValues = {
  subscription: string;
  priority: string;
  billingCycle: string;
  status: string[];
  price: string | number;
  startDate: Date | null;
};

/**
 * Creates a new subscription page in the Notion subscriptions database.
 * Maps the form values to Notion's expected property structure.
 * @param values Subscription form values
 */
export async function createSubscriptionPage(values: SubscriptionFormValues) {
  const properties: Record<string, any> = {
    // The title property must match the Notion schema ('Subscription')
    Subscription: {
      title: [
        {
          text: { content: values.subscription },
        },
      ],
    },
    Priority: {
      select: { name: values.priority },
    },
    "Billing cycle": {
      select: { name: values.billingCycle },
    },
    // Status is a select property (not multi_select) in the Notion schema
    Status: {
      select: { name: values.status[0] }, // Only one value allowed
    },
    Price: {
      number: typeof values.price === "string" ? Number(values.price) : values.price,
    },
    "Start date": values.startDate
      ? { date: { start: values.startDate.toISOString().split("T")[0] } }
      : undefined,
  };

  Object.keys(properties).forEach((key) => {
    if (properties[key] === undefined) delete properties[key];
  });

  const body = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties,
  };

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: getNotionHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create Notion page: ${error}`);
  }
  return res.json();
}
