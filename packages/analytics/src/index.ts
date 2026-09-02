export type AnalyticsEvent =
  | { event: 'page_view'; page_path: string; page_title: string }
  | { event: 'cta_click'; cta_label: string; cta_url: string }
  | { event: 'contact_form_start'; form_id: string }
  | { event: 'contact_form_submit'; form_id: string }
  | { event: 'contact_form_success'; form_id: string }
  | { event: 'contact_form_error'; form_id: string; error_code: string }
  | { event: 'case_study_view'; case_study_slug: string }
  | { event: 'service_view'; service_slug: string }
  | { event: 'resource_download'; resource_slug: string }
  | { event: 'outbound_click'; outbound_url: string };

declare global {
  interface Window {
    dataLayer?: AnalyticsEvent[];
  }
}

export function pushEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}
