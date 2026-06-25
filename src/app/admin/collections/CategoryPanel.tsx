"use client";

import { SimpleCrudPanel } from "../../../components/admin/SimpleCrudPanel";

const FIELDS = [
  { name: "name", label: "Name" },
  { name: "slug", label: "Slug" },
  { name: "description", label: "Description", type: "textarea" as const },
  { name: "image", label: "Image URL" },
  { name: "sortOrder", label: "Sort order", type: "number" as const },
];

export function CategoryPanel({ categories }: { categories: any[] }) {
  return (
    <SimpleCrudPanel
      title="Storefront collections"
      description="Each collection gets a public category page. Use short slugs for links in ads and social posts."
      endpoint="/api/admin/categories"
      fields={FIELDS}
      initialValues={{ sortOrder: "0" }}
      items={categories}
      renderItem={(category: any) => (
        <>
          <strong>{category.name}</strong>
          <p className="admin-muted-text">
            /{category.slug || category.id} ·{" "}
            {category.description || "No description"}
          </p>
        </>
      )}
    />
  );
}
