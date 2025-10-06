//src/utils/seo.ts

export function setTitle(title: string) {
  document.title = title ? `${title} • Handmade Lures` : 'Handmade Lures'
}

export function injectJsonLd(json: object) {
  let node = document.getElementById('jsonld') as HTMLScriptElement | null
  if (!node) {
    node = document.createElement('script')
    node.type = 'application/ld+json'
    node.id = 'jsonld'
    document.head.appendChild(node)
  }
  node.textContent = JSON.stringify(json)
}
