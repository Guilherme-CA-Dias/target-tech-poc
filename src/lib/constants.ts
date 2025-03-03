export const RECORD_ACTIONS = [
  { key: 'get-notes', name: 'Notes' },
  { key: 'get-deals', name: 'Deals' },
  { key: 'get-contacts', name: 'Contacts' },
  { key: 'get-companies', name: 'Companies' }
] as const;

export type RecordActionKey = typeof RECORD_ACTIONS[number]['key']; 