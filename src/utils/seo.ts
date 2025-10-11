// src/utils/seo.ts

type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>
const SITE_NAME = 'RIP Custom Lures'

const D = () => (typeof document !== 'undefined' ? document : null)

export function setTitle(title?: string) {
  const doc = D(); if (!doc) return
  doc.title = title ? `${title} • ${SITE_NAME}` : SITE_NAME
}

function upsertMeta(
  sel: { name?: string; property?: string },
  content: string
) {
  const doc = D(); if (!doc) return
  const selector = sel.name
    ? `meta[name="${sel.name}"]`
    : `meta[property="${sel.property}"]`
  let el = doc.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = doc.createElement('meta')
    if (sel.name) el.setAttribute('name', sel.name)
    if (sel.property) el.setAttribute('property', sel.property)
    doc.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setDescription(desc: string) {
  upsertMeta({ name: 'description' }, desc)
}

export function setCanonical(href?: string) {
  const doc = D(); if (!doc) return
  const url = href || (typeof window !== 'undefined' ? window.location.href : '')
  let link = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = doc.createElement('link')
    link.setAttribute('rel', 'canonical')
    doc.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

export function setOpenGraph(og: Record<string, string>) {
  for (const [k, v] of Object.entries(og)) {
    upsertMeta({ property: `og:${k}` }, v)
  }
}

/**
 * Injects or replaces a JSON-LD <script>. Pass a unique id if you need multiple blocks.
 * Example: injectJsonLd(schema, 'product-jsonld')
 */
export function injectJsonLd(json: JsonLd, id = 'jsonld') {
  const doc = D(); if (!doc) return
  let node = doc.getElementById(id) as HTMLScriptElement | null
  if (!node) {
    node = doc.createElement('script')
    node.type = 'application/ld+json'
    node.id = id
    doc.head.appendChild(node)
  }
  node.textContent = JSON.stringify(json)
}

export function removeJsonLd(id = 'jsonld') {
  const doc = D(); if (!doc) return
  const node = doc.getElementById(id)
  if (node) node.remove()
}