export interface PreferenceItem {
  name: string;
  value: any;
}

export interface Preferences {
  lastUpdated: number | false;
  items: PreferenceItem[];
}
