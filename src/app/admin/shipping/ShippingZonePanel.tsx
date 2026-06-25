"use client";

import { SimpleCrudPanel } from "../../../components/admin/SimpleCrudPanel";

const FIELDS = [
  { name: "name", label: "Zone name" },
  { name: "cities", label: "Cities" },
  { name: "baseRate", label: "Base rate", type: "number" as const },
  { name: "freeShippingThreshold", label: "Free shipping threshold", type: "number" as const },
  { name: "codEnabled", label: "COD enabled", type: "checkbox" as const },
];

export function ShippingZonePanel({ zones }: { zones: any[] }) {
  return (
    <SimpleCrudPanel
      title="Delivery zones"
      description="Use comma-separated cities. Checkout can price against the first active matching zone."
      endpoint="/api/admin/shipping"
      fields={FIELDS}
      initialValues={{ baseRate: "50", codEnabled: true }}
      items={zones}
      renderItem={(zone: any) => (
        <>
          <strong>{zone.name}</strong>
          <p className="admin-muted-text">
            {(zone.cities as string[] | null)?.join(", ") || "All cities"} ·{" "}
            {zone.baseRate} EGP · COD {zone.codEnabled ? "on" : "off"}
          </p>
        </>
      )}
    />
  );
}
