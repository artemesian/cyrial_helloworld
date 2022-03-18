export class CreateCardDto {
  card_value: string;
  card_suit_id: string;
}

export class CreateCardSuitDto {
  suit_value: 'C' | 'H' | 'S' | 'D';
  suit_name: 'club' | 'heart' | 'spade' | 'diamond';
}

export class CreateHandCardDto {
  hand_id: string;
  card_id: string;
  card_position: number;
}

export class CreateHandDetailDto {
  hand_id: string;
  game_double: string;
  active_player: string;
}

export class CreateGamePlayerDto {
  pseudo: string;
  balance: number;
  game_id: string;
  player_id: string;
  player_position: number;
  is_in_active_hand: boolean;
}

export class CreateGameDto {
  game_table_id: string;
  type: 'limit' | 'no-limit' | 'pot-limit' | 'mixed';
}

export class CreatePlayerHoleDto {
  hand_card_id: string;
  game_player_id: string;
}

export class CreeateHandActionDto {
  hand_id: string;
  amount_placed: number;
  game_player_id: string;
  action: 'fold' | 'check' | 'bet' | 'call' | 'raise' | 'all_in' | 'skip';
  hand_status: 'pre-flop' | 'flop' | 'turn' | 'river' | 'show-down';
}

export class CreateHandWinnerDto {
  hand_id: string;
  game_player_id: string;
}

export class CreateHandCommunityDto {
  hand_card_id: string;
  hand_id: string;
}

export class CreateHandDto {
  pot_value: number;
  hand_number: number;
  game_id: string;
}

export class CreateXpClaimDto {
  player_id: string;
  claim_value: number
}
