export function auditCmsProvenance(entries) {
  if (!entries.length) throw new Error('Nessuna provenienza CMS registrata.');
  for (const entry of entries) {
    if (
      entry.status !== 'ok' ||
      !entry.authenticated ||
      entry.origin !== 'https://cms.netmarket.it' ||
      !/^[0-9a-f]{64}$/.test(entry.sha256 ?? '')
    ) {
      throw new Error('Accesso CMS fallito, saltato o non autenticato: ' + entry.path);
    }
  }
  for (const archive of ['services', 'case-studies', 'insights']) {
    const pages = entries.filter((entry) => {
      const url = new URL(entry.path, 'https://cms.netmarket.it/');
      return (
        url.pathname === '/' + archive &&
        !url.searchParams.has('service') &&
        !url.searchParams.has('featured')
      );
    });
    if (
      !pages.length ||
      pages.some((entry) => !Number.isInteger(entry.count) || entry.count <= 0)
    ) {
      throw new Error('Archivio CMS principale mancante o vuoto: ' + archive);
    }
    const expected = Math.max(...pages.map((entry) => entry.pagination?.totalPages ?? 0));
    const seen = new Set(pages.map((entry) => entry.pagination?.page));
    if (
      expected < 1 ||
      Array.from({ length: expected }, (_, i) => i + 1).some((page) => !seen.has(page))
    ) {
      throw new Error('Paginazione CMS incompleta: ' + archive);
    }
  }
  return { source: 'authenticated-https-cms', requests: entries.length, entries };
}
