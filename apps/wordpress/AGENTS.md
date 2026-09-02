# apps/wordpress

- Usare solo API native WordPress e codice PHP namespaced.
- Non introdurre ACF, Elementor, page builder o framework campi a pagamento.
- Ogni dato pubblico deve passare da sanitizzazione, validazione, escaping e capability check.
- Gli endpoint pubblici REST sono read-only fino a diversa decisione architetturale.
