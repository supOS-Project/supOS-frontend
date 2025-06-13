export const getDefaultFields = (qualityName: string, timestampName: string) => [
  { name: qualityName, type: 'LONG', isDefault: true },
  { name: timestampName, type: 'DATETIME', isDefault: true },
];
