export interface DataUser {
    user_id: number;
    username: string;
    email: string;
    profile?: string | null; // optional เพราะบางคนอาจไม่มีรูป
    wallet: number;
    user_type: "normal" | "admin"; // จำกัดค่าเป็น 2 ค่า
  }
  