export interface Avatar {
  avatar_id: string;
  avatar_link: string;
  name: string;
  rarity: string;
  minimum_listed_price: number;
  avatar_xp: number;
  avatar_level: number;
  is_owned: boolean;
  is_on_marketplace: boolean;
  lease_end_date: Date | string | undefined;
}

export interface Governor {
  governor_id: string;
  governor_link: string;
  name: string;
  rarity: string;
  minimum_listed_price: number;
  is_blocked: boolean;
  is_on_marketplace: boolean;
  unlocks_on: Date | string | undefined;
}
