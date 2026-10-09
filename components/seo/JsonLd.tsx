/** Injeta dados estruturados (schema.org). `<` é escapado para impedir fechamento prematuro do script. */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
