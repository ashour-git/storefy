"use client";

import { SimpleCrudPanel } from "../../../components/admin/SimpleCrudPanel";

const FIELDS = [
  { name: "code", label: "Code" },
  {
    name: "type",
    label: "Type",
    type: "select" as const,
    options: [
      { label: "Percent", value: "percent" },
      { label: "Fixed EGP", value: "fixed" },
    ],
  },
  { name: "value", label: "Value", type: "number" as const },
  { name: "maxUses", label: "Max uses", type: "number" as const },
];

export function DiscountPanel({ discounts }: { discounts: any[] }) {
  return (
    <SimpleCrudPanel
      title="Launch coupons"
      description="Coupons are stored in the existing discounts table and ready for checkout expansion."
      endpoint="/api/admin/discounts"
      fields={FIELDS}
      initialValues={{ type: "percent", value: "10" }}
      items={discounts}
      renderItem={(discount: any) => (
        <>
          <strong>{discount.code}</strong>
          <p className="admin-muted-text">
            {discount.type} · {discount.value} · used{" "}
            {discount.usesCount || 0}
            {discount.maxUses ? `/${discount.maxUses}` : ""}
          </p>
        </>
      )}
    />
  );
}
