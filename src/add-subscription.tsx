import { Form, ActionPanel, Action, Icon, Color } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useState } from "react";
import { handleAddSubscription, validatePrice, validateStartDate, validateStatus } from "./notion-utils/addSubscription";

// Define the form values to match the Notion database structure
export interface SubscriptionFormValues {
  subscription: string;
  useCase: "Work" | "Personal";
  billingCycle: string;
  status: string; // Single value for Dropdown
  price: string;
  startDate: Date | null;
}

// Default start date is today + 14 days
const today = new Date();
const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

/**
 * Main form component for adding a subscription
 */
export default function Command() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSubmit, itemProps } = useForm<SubscriptionFormValues>({
    initialValues: {
      subscription: "",
      useCase: "Work",
      billingCycle: "Monthly",
      status: "Trial",
      price: "",
      startDate: defaultStartDate,
    },
    validation: {
      subscription: FormValidation.Required,
      price: validatePrice,
      startDate: validateStartDate,
      billingCycle: FormValidation.Required,
      status: validateStatus,
      useCase: FormValidation.Required,
    },
    onSubmit: (values) => handleAddSubscription(values, setIsSubmitting),
  });

  return (
    <Form
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={isSubmitting ? "Submitting..." : "Add subscription"}
            onSubmit={handleSubmit}
          />
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

/**
 * Section: Subscription name
 */
function SubscriptionDetailsSection({ itemProps }: { itemProps: any }) {
  return (
    <>
      <Form.Description text="Add a new subscription" />
      <Form.TextField placeholder="Name of your subscription" {...itemProps.subscription} />
    </>
  );
}

/**
 * Section: Payment details
 */
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

/**
 * Section: Status with Dropdown
 */
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

/**
 * Section: Use case dropdown
 */
function UseCaseSection({ itemProps }: { itemProps: any }) {
  return (
    <Form.Dropdown title="Use case" {...itemProps.useCase}>
      <Form.Dropdown.Item value="Work" title="Work" />
      <Form.Dropdown.Item value="Personal" title="Personal" />
    </Form.Dropdown>
  );
}
