export type AnalyticsEvent =
  | {
      event: 'page_context';
      page_path: string;
      page_title: string;
      page_type: 'home' | 'service' | 'case_study' | 'insight' | 'archive' | 'standard';
      content_slug?: string;
    }
  | { event: 'cta_click'; cta_label: string; cta_url: string; cta_location: string }
  | { event: 'contact_click'; contact_method: 'email' | 'phone' | 'maps' }
  | { event: 'contact_form_start'; form_id: string }
  | { event: 'contact_form_submit'; form_id: string }
  | { event: 'contact_form_success'; form_id: string }
  | { event: 'generate_lead'; form_id: string; lead_type: 'contact' }
  | { event: 'contact_form_error'; form_id: string; error_code: string }
  | { event: 'case_study_view'; case_study_slug: string }
  | { event: 'service_view'; service_slug: string }
  | { event: 'insight_view'; insight_slug: string }
  | { event: 'resource_download'; resource_slug: string }
  | { event: 'outbound_click'; outbound_domain: string; outbound_path: string };

declare global {
  interface Window {
    dataLayer?: AnalyticsEvent[];
    gtag?: (command: 'event', eventName: string, parameters: Record<string, string>) => void;
  }
}

export function pushEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);

  // Dedicated GTM conversion tags own generate_lead to avoid duplicate conversions.
  if (event.event === 'generate_lead' || !window.gtag) return;
  const { event: eventName, ...parameters } = event;
  window.gtag('event', eventName, parameters);
}
