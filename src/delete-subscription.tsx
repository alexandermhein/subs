import { ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";

export default function DeleteSubscriptionCommand(props: { item: any; onDelete?: () => void }) {
  const { item, onDelete } = props;

  async function handleDelete() {
    try {
      const { deleteSubscriptionPage } = await import("./notion-utils/editSubscriptionPage");
      await deleteSubscriptionPage(item.id);
      showToast({ style: Toast.Style.Success, title: "Subscription deleted" });
      if (onDelete) onDelete();
    } catch (e) {
      showToast({ style: Toast.Style.Failure, title: "Failed to delete", message: String(e) });
    }
  }

  return (
    <ActionPanel>
      <Action
        icon={Icon.Trash}
        title="Delete subscription"
        style={Action.Style.Destructive}
        onAction={handleDelete}
      />
    </ActionPanel>
  );
}
