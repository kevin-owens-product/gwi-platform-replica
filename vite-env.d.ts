/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GWI_API_BASE_URL: string
  readonly VITE_GWI_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
