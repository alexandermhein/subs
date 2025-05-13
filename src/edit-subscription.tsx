import { Form, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useEffect, useState } from "react";
import { SubscriptionFormValues, validatePrice, validateStartDate, validateStatus } from "./notion-utils/addSubscription";

// Section components from add-subscription
function SubscriptionDetailsSection({ itemProps }: { itemProps: any }) {
  return (
    <>
      <Form.Description text="Edit your subscription" />
      <Form.TextField placeholder="Name of your subscription" {...itemProps.subscription} />
    </>
  );
}
function PaymentDetailsSection({ itemProps }: { itemProps: any }) {
  return (
    <>
      <Form.Description text="Payment details" />
      <Form.TextField title="Price (US$)" placeholder="20.00" {...itemProps.price} />
      <Form.DatePicker
        type={Form.DatePicker.Type.Date}
        title="First payment"
        info="Assumes a 14-day free trial"
        {...itemProps.startDate}
      />
      <Form.Dropdown title="Billing cycle" {...itemProps.billingCycle}>
        <Form.Dropdown.Item value="Monthly" title="Monthly" />
        <Form.Dropdown.Item value="Annually" title="Annually" />
      </Form.Dropdown>
    </>
  );
}
function StatusSection({ itemProps }: { itemProps: any }) {
  return (
    <>
      <Form.Description text="Status & relevance" />
      <Form.Dropdown title="Status" {...itemProps.status}>
        <Form.Dropdown.Item value="Active" title="Active" icon={Icon.CheckCircle} />
        <Form.Dropdown.Item value="Trial" title="Trial" icon={Icon.Clock} />
        <Form.Dropdown.Item value="Inactive" title="Inactive" icon={Icon.CircleDisabled} />
      </Form.Dropdown>
    </>
  );
}
function UseCaseSection({ itemProps }: { itemProps: any }) {
  return (
    <Form.Dropdown title="Use case" {...itemProps.useCase}>
      <Form.Dropdown.Item value="Work" title="Work" />
      <Form.Dropdown.Item value="Personal" title="Personal" />
    </Form.Dropdown>
  );
}

export default function EditSubscriptionCommand(props: { item: any; onSave?: (updatedItem: any) => void }) {
  const { item, onSave } = props;
  const propsData = item.properties || {};
  const [loading, setLoading] = useState(false);

  const { handleSubmit, itemProps, setValue } = useForm<SubscriptionFormValues>({
    initialValues: {
      subscription: propsData.Subscription?.title?.[0]?.plain_text || "",
      useCase: (propsData["Use case"]?.select?.name as "Work" | "Personal") || "Work",
      billingCycle: (propsData["Billing cycle"]?.select?.name === "Annually" ? "Annually" : "Monthly"),
      status: (propsData.Status?.select?.name as "Active" | "Trial" | "Inactive") || "Active",
      price: propsData.Price?.number !== undefined && propsData.Price?.number !== null
        ? Number(propsData.Price.number).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : "",
      startDate: propsData["Start date"]?.date?.start ? new Date(propsData["Start date"].date.start) : null,
    },
    validation: {
      subscription: FormValidation.Required,
      price: validatePrice,
      startDate: validateStartDate,
      billingCycle: FormValidation.Required,
      status: validateStatus,
      useCase: FormValidation.Required,
    },
    async onSubmit(values) {
      setLoading(true);
      try {
        const { updateSubscriptionPage } = await import("./notion-utils/editSubscriptionPage");
        await updateSubscriptionPage(item.id, {
          Subscription: { title: [{ text: { content: values.subscription } }] },
          "Use case": { select: { name: values.useCase as "Work" | "Personal" } },
          "Billing cycle": { select: { name: values.billingCycle } },
          Status: { select: { name: values.status } },
          Price: { number: Number(values.price) },
          "Start date": values.startDate ? { date: { start: values.startDate.toISOString().split("T")[0] } } : undefined,
        });
        showToast({ style: Toast.Style.Success, title: "Subscription updated" });
        if (onSave) {
          // Compose updated item for parent state update
          const updatedItem = {
            ...item,
            properties: {
              ...item.properties,
              Subscription: { title: [{ plain_text: values.subscription }] },
              "Use case": { select: { name: values.useCase } },
              "Billing cycle": { select: { name: values.billingCycle } },
              Status: { select: { name: values.status } },
              Price: { number: Number(values.price) },
              "Start date": values.startDate ? { date: { start: values.startDate.toISOString().split("T")[0] } } : undefined,
            },
          };
          onSave(updatedItem);
        }
      } catch (e) {
        showToast({ style: Toast.Style.Failure, title: "Failed to update", message: String(e) });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title={loading ? "Saving..." : "Save changes"} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <SubscriptionDetailsSection itemProps={itemProps} />
      <PaymentDetailsSection itemProps={itemProps} />
      <StatusSection itemProps={itemProps} />
      <UseCaseSection itemProps={itemProps} />
    </Form>
  );
}
