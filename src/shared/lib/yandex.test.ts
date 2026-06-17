import { describe, it, expect } from 'vitest';
import { parseYandexCoords } from './yandex';

describe('parseYandexCoords', () => {
  it('parses ll= link (lon,lat order)', () => {
    const result = parseYandexCoords(
      'https://yandex.com/maps/?ll=37.6156,55.7522&z=12',
    );
    expect(result).toEqual({ lat: 55.7522, lon: 37.6156 });
  });

  it('parses pt= link with pin style suffix', () => {
    const result = parseYandexCoords(
      'https://yandex.com/maps/?pt=37.6156,55.7522,pm2rdm&z=16',
    );
    expect(result).toEqual({ lat: 55.7522, lon: 37.6156 });
  });

  it('returns null for a malformed string', () => {
    expect(parseYandexCoords('not a url at all')).toBeNull();
  });

  it('returns null when lat is out of range [-90,90]', () => {
    // ll=lon,lat — 200 is in the lat position
    expect(parseYandexCoords('https://yandex.com/maps/?ll=37.6,200')).toBeNull();
  });
});
