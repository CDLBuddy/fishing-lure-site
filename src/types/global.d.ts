/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHECKOUT_ENABLED?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
