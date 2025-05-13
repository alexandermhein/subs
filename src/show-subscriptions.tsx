import { ActionPanel, List, Action, Icon, showToast, Toast, Color, confirmAlert } from "@raycast/api";
import { useEffect, useState, memo } from "react";
import EditSubscriptionCommand from "./edit-subscription";
import DeleteSubscriptionCommand from "./delete-subscription";

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
const SubscriptionListItem = memo(function SubscriptionListItem({ item, setSubscriptions }: { item: any; setSubscriptions: React.Dispatch<React.SetStateAction<any[]>> }) {
  const props = item.properties || {};
  // Defensive checks for Notion property types
  let name = "(No name)";
  let price: number | undefined = undefined;
  let billingCycle: string | undefined = undefined;
  let status: string | undefined = undefined;
  let startDate: string | undefined = undefined;

  // Subscription name
  if (props.Subscription && typeof props.Subscription === "object" && Array.isArray(props.Subscription.title)) {
    name = props.Subscription.title[0]?.plain_text || "(No name)";
  } else if (typeof props.Subscription === "string") {
    name = props.Subscription;
    // Optionally log unexpected type
    console.warn("Notion property 'Subscription' is a string, expected object", props.Subscription);
  } else if (typeof props.Subscription === "number") {
    name = String(props.Subscription);
    console.warn("Notion property 'Subscription' is a number, expected object", props.Subscription);
  }

  // Price
  if (props.Price && typeof props.Price === "object" && "number" in props.Price) {
    price = props.Price.number;
  } else if (typeof props.Price === "number") {
    price = props.Price;
    console.warn("Notion property 'Price' is a number, expected object", props.Price);
  }

  // Billing cycle
  if (props["Billing cycle"] && typeof props["Billing cycle"] === "object" && props["Billing cycle"].select) {
    billingCycle = props["Billing cycle"].select.name;
  } else if (typeof props["Billing cycle"] === "string") {
    billingCycle = props["Billing cycle"];
    console.warn("Notion property 'Billing cycle' is a string, expected object", props["Billing cycle"]);
  }

  // Status
  if (props.Status && typeof props.Status === "object" && props.Status.select) {
    status = props.Status.select.name;
  } else if (typeof props.Status === "string") {
    status = props.Status;
    console.warn("Notion property 'Status' is a string, expected object", props.Status);
  }

  // Start date
  if (props["Start date"] && typeof props["Start date"] === "object" && props["Start date"].date) {
    startDate = props["Start date"].date.start;
  } else if (typeof props["Start date"] === "string") {
    startDate = props["Start date"];
    console.warn("Notion property 'Start date' is a string, expected object", props["Start date"]);
  }

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
      subtitle={price !== undefined ? `US$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : undefined}
      accessories={accessories}
      actions={
        <ActionPanel>
  <Action.OpenInBrowser title="Open in Notion" url={`https://www.notion.so/${item.id.replace(/-/g, "")}`} />
  <Action.Push
    icon={Icon.Pencil}
    title="Edit Subscription"
    target={<EditSubscriptionCommand item={item} onSave={(updatedItem: any) => {
      setSubscriptions((subs: any[]) => subs.map((s: any) => s.id === updatedItem.id ? updatedItem : s));
    }} />}
  />
  <Action
    icon={Icon.Trash}
    title="Delete Subscription"
    style={Action.Style.Destructive}
    onAction={async () => {
      const confirmed = await confirmAlert({
        title: "Delete subscription",
        message: `Are you sure you want to delete '${name}'?`,
      });
      if (!confirmed) return;
      try {
        const { deleteSubscriptionPage } = await import("./notion-utils/editSubscriptionPage");
        await deleteSubscriptionPage(item.id);
        showToast({ style: Toast.Style.Success, title: "Subscription deleted" });
        setSubscriptions((subs: any[]) => subs.filter((s: any) => s.id !== item.id));
      } catch (e) {
        showToast({ style: Toast.Style.Failure, title: "Failed to delete", message: String(e) });
      }
    }}
  />
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
        <SubscriptionListItem key={item.id} item={item} setSubscriptions={setSubscriptions} />
      ))}
    </List>
  );
}
