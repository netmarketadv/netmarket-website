export const socialGoals = [
  'Più richieste',
  'Più appuntamenti o iscritti',
  'Più vendite online',
  'Vorrei capire da dove partire'
] as const;

export const sectors = {
  generale: {
    opening: 'Per chi vuole ricevere più contatti dai social.',
    example:
      'Una persona vede come lavori in un reel. Dal video può passare ai tuoi prodotti o chiederti informazioni.'
  },
  fitness: {
    opening: 'Per chi vuole portare nuovi iscritti in palestra.',
    example:
      'Una persona vorrebbe provare il Pilates, ma non sa cosa aspettarsi. Un reel le mostra la prima lezione e la invita a prenotare una prova.'
  },
  showroom: {
    opening: 'Per chi vuole più appuntamenti in showroom.',
    example:
      'Chi sta scegliendo un tavolo vuole capire finiture e dimensioni. In un reel gliele fai vedere da vicino e lo inviti a fissare una visita in showroom.'
  }
} as const;

export function socialSector(params: URLSearchParams): keyof typeof sectors {
  const value = params.get('settore');
  return value === 'fitness' || value === 'showroom' ? value : 'generale';
}

export function campaignUtm(params: URLSearchParams): Record<string, string> {
  const tags: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key)?.trim().slice(0, 150);
    if (value) tags[key] = value;
  }
  return tags;
}
