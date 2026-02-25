import { getCountdown, formatDuration, normalizeTimeString } from './utils-time';

describe('normalizeTimeString', () => {
  it('sadece HH:mm kısmını alır', () => {
    expect(normalizeTimeString('05:29 (EET)')).toBe('05:29');
    expect(normalizeTimeString('18:45 +03')).toBe('18:45');
  });

  it('geçersiz formatta stringi olduğu gibi döndürür', () => {
    expect(normalizeTimeString('invalid')).toBe('invalid');
  });
});

describe('getCountdown', () => {
  it('ilerideki bir saate kadar olan saniyeyi hesaplar', () => {
    const now = new Date('2025-01-01T12:00:00');
    const seconds = getCountdown('13:00', now);
    expect(seconds).toBe(60 * 60);
  });

  it('geçmiş bir saat için hedefi ertesi güne alır', () => {
    const now = new Date('2025-01-01T12:00:00');
    const seconds = getCountdown('11:00', now);
    expect(seconds).toBe(23 * 60 * 60);
  });
});

describe('formatDuration', () => {
  it('saniyeyi saat/dakika/saniye stringlerine böler', () => {
    const result = formatDuration(3661);
    expect(result).toEqual({ hours: '01', minutes: '01', seconds: '01' });
  });
});

