import { validatePublicEnv, validateServerEnv } from '@netmarket/config';

const localFallback = {
  PUBLIC_SITE_URL: 'http://localhost:4321',
  PUBLIC_CMS_URL: 'https://cms.netmarket.it',
  PUBLIC_DEPLOY_ENV: 'local',
  PUBLIC_ANALYTICS_ENABLED: 'false',
  PUBLIC_GTM_ID: '',
  PUBLIC_GOOGLE_MAPS_API_KEY: '',
  PUBLIC_GOOGLE_PLACE_ID: '',
  CMS_API_BASE_URL: 'https://cms.netmarket.it/wp-json/netmarket/v1/',
  CMS_GRAPHQL_URL: 'https://cms.netmarket.it/graphql',
  CMS_BUILD_TOKEN: '',
  CMS_BASIC_AUTH_USER: '',
  CMS_BASIC_AUTH_PASSWORD: ''
};

export function getPublicEnv() {
  return validatePublicEnv({ ...localFallback, ...import.meta.env });
}

export function getServerEnv() {
  const publicEnv = getPublicEnv();
  return validateServerEnv({ ...localFallback, ...import.meta.env }, publicEnv.PUBLIC_DEPLOY_ENV);
}
