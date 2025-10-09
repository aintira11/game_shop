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
  