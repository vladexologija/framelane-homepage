type LdObject = Record<string, unknown>;

/**
 * Renders schema.org JSON-LD into the document. Pass a single object or an
 * array of objects. The `<` → `<` escape follows the official Next.js
 * recommendation to keep the embedded JSON safe from `</script>` breakout.
 */
export function JsonLd({ data }: { data: LdObject | LdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
