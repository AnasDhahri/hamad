interface CountryCoordinates {
  [key: string]: { lat: number; lng: number; code: string };
}

export const countryCoordinates: CountryCoordinates = {
  us: { lat: 37.0902, lng: -95.7129, code: 'USA' },
  es: { lat: 40.4637, lng: -3.7492, code: 'ESP' },
  fr: { lat: 46.2276, lng: 2.2137, code: 'FRA' },
  de: { lat: 51.1657, lng: 10.4515, code: 'DEU' },
  it: { lat: 41.8719, lng: 12.5674, code: 'ITA' },
  pt: { lat: 39.3999, lng: -8.2245, code: 'PRT' },
  cn: { lat: 35.8617, lng: 104.1954, code: 'CHN' },
  jp: { lat: 36.2048, lng: 138.2529, code: 'JPN' },
  kr: { lat: 35.9078, lng: 127.7669, code: 'KOR' },
  qa: { lat: 25.3548, lng: 51.1839, code: 'QAT' }
};