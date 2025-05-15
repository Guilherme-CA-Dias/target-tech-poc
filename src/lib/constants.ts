export const RECORD_ACTIONS = [
  { key: 'get-leads', name: 'Leads' },
  { key: 'get-deals', name: 'Opportunities' },
  { key: 'get-contacts', name: 'Contacts' },
  { key: 'get-companies', name: 'Companies' }
] as const;

export type RecordActionKey = typeof RECORD_ACTIONS[number]['key']; 