# Design QA

## NØD product landing

- Date: 2026-09-07
- Route: `/nod/`
- Viewports checked: 390, 430, 768, 1024, 1280, 1440, 1728 px
- Motion modes checked: default and `prefers-reduced-motion: reduce`

### Issues and resolutions

| Area            | Issue                                                                     | Resolution                                                                                                  | Status |
| --------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| Hero            | Product logo was oversized, distorted and hidden beneath the fixed header | Preserved the original symbol locally, rebuilt the compact wordmark, and added header-safe spacing          | Pass   |
| Hero            | H1 clipped and wrapped unpredictably                                      | Added bounded `clamp()` sizing, balanced wrapping and mobile-specific limits                                | Pass   |
| Product visuals | Static screenshots were dense and hard to read                            | Replaced them with seven responsive HTML/CSS product demos                                                  | Pass   |
| Dark surfaces   | Heading color inherited the light-page default                            | Set explicit white heading colors and tested contrast visually                                              | Pass   |
| Mobile          | Dense desktop product views became illegible                              | Added purpose-built mobile reductions for tables, pipeline, calendar and reporting                          | Pass   |
| Responsive      | Wide UI could overflow the viewport                                       | Added minimum-width guards, compact demo layouts and measured document width at all target breakpoints      | Pass   |
| Motion          | Product behavior was not explained                                        | Added lightweight CSS loops for lead intake, pipeline movement, AI response, tasks, automations and reports | Pass   |
| Reduced motion  | Animated states needed a static equivalent                                | Disabled all demo motion and exposed meaningful completed states                                            | Pass   |
| Accessibility   | Product visuals and brand groups needed concise accessible names          | Added named `role="img"` wrappers while keeping visual internals decorative                                 | Pass   |
| Performance     | Product screenshots and remote logo requests increased page weight        | Removed product image requests, localized the 2.1 KB SVG symbol and kept demos script-free                  | Pass   |

### Final checks

- No horizontal document overflow at any requested viewport.
- Seven product demos render and remain inside their containers.
- Hero, lead view, AI section and final CTA reviewed as targeted screenshots on mobile and desktop.
- UI text remains available in the document copy; product meaning does not depend on animation.

## Contact page

- Date: 2026-09-07
- Route: `/contatti/`
- Viewports checked: 390, 430, 768, 1024, 1280, 1440, 1728 px
- Motion mode checked: `light`, including `prefers-reduced-motion: reduce`

### Issues and resolutions

| Area         | Issue                                                                | Resolution                                                                                       | Status |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| Hero         | The page opened with excessive passive space and generic positioning | Built a compact editorial split with explicit agency, service and Padova context                 | Pass   |
| Form         | Controls and submit action looked browser-default and administrative | Added consistent fields, labels, microcopy, focus, loading, success and error states             | Pass   |
| Validation   | Errors were summarized but not explained beside each field           | Added contextual error copy, `aria-invalid` and focus on the first invalid control               | Pass   |
| Privacy      | Marketing consent added unnecessary friction                         | Removed newsletter consent and integrated the required privacy link into one accessible control  | Pass   |
| Contact data | The supporting card lacked presence and local information            | Added a dark responsive contact surface with email, address, hours, company data and Maps CTA    | Pass   |
| Mobile       | Form and supporting information needed a deliberate stacked flow     | Switched to one-column fields, full-width submit and non-sticky contact data below the form      | Pass   |
| Responsive   | Wide content could escape smaller viewports                          | Measured document width across all seven required breakpoints                                    | Pass   |
| Submission   | Redesign risked changing the existing confirmation flow              | Preserved success tracking and `window.location.assign('/grazie/')`; verified end to end         | Pass   |
| SEO/GEO      | Local intent was mainly implicit                                     | Added crawlable Padova copy plus ContactPage, PostalAddress, ContactPoint and opening hours data | Pass   |

### Final checks

- Hero, full form, dark contact card, process sequence and footer reviewed on desktop and mobile.
- Valid submit, invalid fields, invalid email, missing privacy, backend failure and duplicate submission tested.
- Keyboard order and responsive containment verified with Playwright.
