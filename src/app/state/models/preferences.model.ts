export interface PreferenceItem {
  name: string;
  value: boolean | number | string;
}

export interface Preferences {
  lastUpdated: number | false;
  items: PreferenceItem[];
}

export interface ClientPreferences {
  autoSort: boolean;
  autoSortInterval: number;
  autoNext: boolean;
  almostDonePrompt: boolean;
  autoPlay: boolean;
  keepPlaylist: string;
  stickyPlaylist: string;
}

export const defaultClientPreferences = {
  autoSort: true,
  autoSortInterval: 60,
  autoNext: true,
  almostDonePrompt: true,
  autoPlay: true,
  keepPlaylist: '',
  stickyPlaylist: ''
}
