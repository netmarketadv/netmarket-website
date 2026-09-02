# apps/wordpress

- Usare solo API native WordPress e codice PHP namespaced.
- Non introdurre ACF, Elementor, page builder o framework campi a pagamento.
- Ogni dato pubblico deve passare da sanitizzazione, validazione, escaping e capability check.
- Gli endpoint pubblici REST sono read-only fino a diversa decisione architetturale.
- Le modifiche WordPress devono attivare controlli PHP pertinenti; non richiedono E2E frontend completo salvo impatto su endpoint usati da routing, form o rendering critico.
- Il deploy CMS resta separato dal deploy frontend staging.
