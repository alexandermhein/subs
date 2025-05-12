import { Form, ActionPanel, Action, showToast, Toast, Icon, Color } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";

// Define the form values to match the Notion database structure
interface SubscriptionFormValues {
  subscription: string;
  priority: string;
  billingCycle: string;
  status: string[]; // Now an array for TagPicker
  price: string;
  startDate: Date | null;
}

// Default start date is today + 14 days
const today = new Date();
const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

// Main form component
export default function Command() {
  const { handleSubmit, itemProps } = useForm<SubscriptionFormValues>({
    initialValues: {
      subscription: "",
      priority: "Low",
      billingCycle: "Monthly",
      status: ["Trial"],
      price: "",
      startDate: defaultStartDate,
    },
    validation: {
      subscription: FormValidation.Required,
      price: (value) => {
        if (!value) return "Price is required";
        const num = Number(value);
        if (isNaN(num) || num <= 0) return "Price must be a positive number";
      },
      startDate: (value) => {
        if (!value) return "Start date is required";
      },
      billingCycle: FormValidation.Required,
      status: (value: string[] | undefined) => {
        if (!value || value.length === 0) return "Please select at least one status.";
      },
      priority: FormValidation.Required,
    },
    async onSubmit(values) {
      // Format values for Notion API
      const formattedValues = { ...values, price: Number(values.price) };
      try {
        // Create a new page in Notion using the API helper from utils
        const { createSubscriptionPage } = await import("./notion-utils/createSubscriptionPage");
        await createSubscriptionPage(formattedValues);
        showToast({
          style: Toast.Style.Success,
          title: "Subscription added",
          message: `${values.subscription} added to Notion.`,
        });
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to add subscription",
          message: String(error),
        });
      }
      console.log(formattedValues);
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add subscription" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <SubscriptionDetailsSection itemProps={itemProps} />
      <PaymentDetailsSection itemProps={itemProps} />
      <StatusSection itemProps={itemProps} />
      <PrioritySection itemProps={itemProps} />
    </Form>
  );
}

// Section: Subscription name
function SubscriptionDetailsSection({ itemProps }: { itemProps: any }) {
  return (
    <>
      <Form.Description text="Add a new subscription" />
      <Form.TextField placeholder="Name of your subscription" {...itemProps.subscription} />
    </>
  );
}

// Section: Payment details
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

// Section: Status with TagPicker
function StatusSection({ itemProps }: { itemProps: any }) {
  return (
    <>
      <Form.Description text="Status & relevance" />
      <Form.TagPicker title="Status" {...itemProps.status}>
        <Form.TagPicker.Item value="Active" title="Active" icon={{ source: Icon.CheckCircle, tintColor: Color.Green }} />
        <Form.TagPicker.Item value="Trial" title="On trial" icon={{ source: Icon.Clock, tintColor: Color.Yellow }} />
        <Form.TagPicker.Item value="Inactive" title="Not in use" icon={{ source: Icon.CircleDisabled }} />
      </Form.TagPicker>
    </>
  );
}

// Section: Priority dropdown
function PrioritySection({ itemProps }: { itemProps: any }) {
  return (
    <Form.Dropdown title="Priority" {...itemProps.priority}>
      <Form.Dropdown.Item value="High" title="High" />
      <Form.Dropdown.Item value="Low" title="Low" />
    </Form.Dropdown>
  );
}
