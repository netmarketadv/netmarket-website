/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_CMS_URL?: string;
  readonly PUBLIC_DEPLOY_ENV?: 'local' | 'staging' | 'production';
  readonly PUBLIC_ANALYTICS_ENABLED?: 'true' | 'false';
  readonly PUBLIC_GTM_ID?: string;
  readonly CMS_API_BASE_URL?: string;
  readonly CMS_GRAPHQL_URL?: string;
  readonly CMS_BUILD_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
