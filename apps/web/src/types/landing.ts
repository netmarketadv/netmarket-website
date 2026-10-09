export interface LandingLink {
  label: string;
  icon?: 'projects' | 'goals' | 'method' | 'team' | 'markets' | 'reviews';
  description?: string;
  href: `#${string}`;
}
export interface LandingShellConfig {
  links: LandingLink[];
  cta: { label: string; href: `#${string}` };
  topHref: `#${string}`;
}
