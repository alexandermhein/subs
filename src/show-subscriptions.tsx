import { ActionPanel, List, Action, Icon, showToast, Toast, Color } from "@raycast/api";
import { useEffect, useState, memo } from "react";

// Helper to build the tag and icon for status
function getStatusAccessory(status?: string) {
  if (!status) return undefined;
  let value = status;
  let color: Color | undefined;
  let icon: { source: Icon; tintColor: Color } | undefined;

  if (status === "Trial") {
    value = "On trial";
    color = Color.Yellow;
    icon = { source: Icon.Clock, tintColor: Color.Yellow };
  } else if (status === "Inactive") {
    value = "Not in use";
    color = Color.SecondaryText;
    icon = { source: Icon.CircleDisabled, tintColor: Color.SecondaryText };
  } else if (status === "Active") {
    color = Color.Green;
    icon = { source: Icon.CheckCircle, tintColor: Color.Green };
  }
  return {
    tag: { value, color },
    icon,
  };
}

// Extracted List.Item for clarity and maintainability
const SubscriptionListItem = memo(function SubscriptionListItem({ item }: { item: any }) {
  const props = item.properties || {};
  const name = props.Subscription?.title?.[0]?.plain_text || "(No name)";
  const price = props.Price?.number;
  const billingCycle = props["Billing cycle"]?.select?.name;
  const status = props.Status?.select?.name;
  const startDate = props["Start date"]?.date?.start;

  // Build accessories array, filtering out undefined
  const accessories = [
    startDate ? { date: new Date(startDate) } : undefined,
    billingCycle ? { tag: billingCycle } : undefined,
    getStatusAccessory(status),
  ].filter(Boolean) as Exclude<any, undefined>[];

  return (
    <List.Item
      key={item.id}
      title={name}
      subtitle={price !== undefined ? `US$${price}` : undefined}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open in Notion" url={`https://www.notion.so/${item.id.replace(/-/g, "")}`} />
        </ActionPanel>
      }
    />
  );
});

export default function Command() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscriptions() {
      setLoading(true);
      setError(null);
      try {
        // Dynamic import to avoid circular deps in Raycast extension
        const { querySubscriptions } = await import("./notion-utils/querySubscriptions");
        const data = await querySubscriptions();
        setSubscriptions(data.results || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch subscriptions");
        showToast({ style: Toast.Style.Failure, title: "Error", message: err.message });
      } finally {
        setLoading(false);
      }
    }
    fetchSubscriptions();
  }, []);

  return (
    <List isLoading={loading} searchBarPlaceholder="Search subscriptions...">
      {error && (
        <List.EmptyView title="Error" description={error} icon={Icon.ExclamationMark} />
      )}
      {!error && subscriptions.length === 0 && !loading && (
        <List.EmptyView title="No subscriptions found" description="Your Notion database is empty." icon={Icon.MinusCircle} />
      )}
      {subscriptions.map((item) => (
        <SubscriptionListItem key={item.id} item={item} />
      ))}
    </List>
  );
}
