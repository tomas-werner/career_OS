/**
 * Normalization primitives for deduplication keys and matching.
 * Plan.md section 37 (dedup levels 1-3) relies on these.
 */

/** NFKD + strip accents + lowercase + collapse whitespace + trim. */
export function normalizeText(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalized text with legal-entity suffixes removed (ltd, gmbh, inc, sas...). */
export function normalizeCompanyName(name: string): string {
  const base = normalizeText(name);
  if (!base) return '';
  const suffixes = [
    'inc',
    'incorporated',
    'llc',
    'ltd',
    'limited',
    'plc',
    'corp',
    'corporation',
    'co',
    'company',
    'gmbh',
    'ag',
    'sa',
    'sas',
    'sarl',
    'sl',
    'bv',
    'nv',
    'ab',
    'as',
    'oy',
    'spa',
    'srl',
    'kk',
    'pty',
    'group',
    'holding',
  ];
  const words = base.split(' ').filter((w) => !suffixes.includes(w));
  return (words.length > 0 ? words : base.split(' ')).join(' ');
}

/** Normalized title: strip accents, lowercase, remove seniority noise. */
export function normalizeTitle(title: string): string {
  let base = normalizeText(title);
  if (!base) return '';
  // gender / contract markers with separators, e.g. H/F, F/H, M/F/D, (CDI), H-F
  base = base.replace(/\b([hfm])\s*[/\\-]\s*([hfmd])\b/g, ' ');
  const noise = new Set([
    'junior',
    'senior',
    'jr',
    'sr',
    'lead',
    'principal',
    'staff',
    'head',
    'chief',
    'intern',
    'internship',
    'freelance',
    'freelancer',
    'contractor',
    'cdi',
    'cdd',
    'full-time',
    'part-time',
    'remote',
    'hybrid',
    'urgent',
    'new',
  ]);
  const cleaned = base
    .replace(/[()/\\]/g, ' ')
    .split(' ')
    .filter((w) => w && !noise.has(w));
  return cleaned.join(' ');
}

/** Trigram similarity in [0,1] for level-3 dedup similarity. */
export function trigramSimilarity(a: string, b: string): number {
  const grams = (s: string): Set<string> => {
    const norm = ` ${normalizeText(s)} `;
    const out = new Set<string>();
    for (let i = 0; i < Math.max(0, norm.length - 2); i++) {
      out.add(norm.slice(i, i + 3));
    }
    return out;
  };
  const ga = grams(a);
  const gb = grams(b);
  if (ga.size === 0 || gb.size === 0) return 0;
  let intersection = 0;
  for (const g of ga) if (gb.has(g)) intersection++;
  return (2 * intersection) / (ga.size + gb.size);
}
