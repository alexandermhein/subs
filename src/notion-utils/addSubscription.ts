// Utility functions for add-subscription.tsx

import { Toast, showToast } from "@raycast/api";

export interface SubscriptionFormValues {
  subscription: string;
  useCase: "Work" | "Personal";
  billingCycle: string;
  status: string; // Single value for Dropdown
  price: string;
  startDate: Date | null;
}

export function validatePrice(value: string | undefined): string | undefined {
  if (!value) return "Price is required";
  const num = Number(value);
  if (isNaN(num) || num <= 0) return "Price must be a positive number";
  return undefined;
}

export function validateStartDate(value: Date | null | undefined): string | undefined {
  if (!value) return "Start date is required";
  return undefined;
}

export function validateStatus(value: string | undefined): string | undefined {
  if (!value || value.length === 0) return "Please select a status.";
  return undefined;
}

export async function handleAddSubscription(values: SubscriptionFormValues, setIsSubmitting: (x: boolean) => void) {
  setIsSubmitting(true);
  const formattedValues = {
    ...values,
    price: Number(values.price),
    status: values.status,
  };
  try {
    const { createSubscriptionPage } = await import("./createSubscriptionPage");
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
  } finally {
    setIsSubmitting(false);
  }
}
