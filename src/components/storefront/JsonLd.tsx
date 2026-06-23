interface ProductJsonLdProps {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
  storeName: string;
  storeUrl: string;
  productUrl: string;
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency,
  rating,
  reviewCount,
  storeName,
  storeUrl,
  productUrl,
}: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: image || undefined,
    brand: {
      '@type': 'Brand',
      name: storeName,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: storeName,
        url: storeUrl,
      },
    },
    ...(rating && reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.toFixed(1),
            reviewCount: reviewCount.toString(),
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface OrganizationJsonLdProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

export function OrganizationJsonLd({ name, url, logo, description }: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: logo || undefined,
    description: description || undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface StoreJsonLdProps {
  name: string;
  url: string;
  description?: string;
  logo?: string;
  currency: string;
}

export function StoreJsonLd({ name, url, description, logo, currency }: StoreJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name,
    url,
    description: description || undefined,
    logo: logo || undefined,
    priceRange: `${currency} - ${currency}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
