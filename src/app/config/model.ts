export interface DataUser {
    user_id: number;
    username: string;
    email: string;
    profile?: string | null; // optional เพราะบางคนอาจไม่มีรูป
    wallet: number;
    user_type: "normal" | "admin"; // จำกัดค่าเป็น 2 ค่า
  }

export interface Game {
  game_id: number
  game_name: string
  price: string
  category_id: number
  category_name: string
  game_image: string
  description: string
  release_date: string
  purchase_count: number
}

export interface Category {
  category_id: number
  category_name: string
  created_at: string
}

export interface GameCartItem {
  cart_item_id: number
  cart_id: number
  game_id: number
  game_name: string
  price: string
  game_image: string
}

export interface Promotion {
  promotion_id: number
  promotion_name: string
  limit_promotion: number
  discount_value: string
  promotion_date: string
  discount_type: string
}
  
// Interfaces for Wallet Component
export interface PromotionTransaction {
  name: string;
  discount_value: string;
}

export interface GameTransaction {
  buy_id: number;
  game_id: number;
  game_name: string;
  game_price: string;
}

export interface Transactionmodel {
  transaction_id: number;
  amount: string;
  type: 'deposit' | 'purchase';
  transaction_date: string;
  total_price?: string;
  buy_date?: string;
  promotion: PromotionTransaction | null;
  games: GameTransaction[];
}

export interface TransactionResponse {
  transactions: Transactionmodel[];
}

export interface gameLibrary {
  game_id: number
  game_name: string
  description: string
  price: string
  game_image: string
  release_date: string
  category_name: string
  purchase_count: number
  buy_date: string
}