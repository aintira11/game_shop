// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from "../../header/header";
import { DataUser, GameCartItem } from '../../../config/model';
import { AuthService } from '../../../service/auth.service';
import { Constants } from '../../../config/constants';
import { TruncateNumberPipe } from '../../../config/truncate-number.pipe';

interface Promotion {
  promotion_id: number;
  promotion_name: string;
  discount_percentage: number;
  discount_amount: number;
  min_purchase: number;
  max_discount: number;
  start_date: string;
  end_date: string;
}

@Component({
  selector: 'app-cart',
  imports: [Header, CommonModule, TruncateNumberPipe, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {
  datauser: DataUser | null = null;
  cartItems: GameCartItem[] = [];
  selectedGames: Set<number> = new Set();
  promotions: Promotion[] = [];
  selectedPromotion: number | null = null;
  userBalance: number = 0;
  
  totalPrice: number = 0;
  discountAmount: number = 0;
  finalPrice: number = 0;
  
  isProcessing: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  showInsufficientBalancePopup: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private constants: Constants,
  ) {}

  ngOnInit() {
    this.datauser = this.authService.getUser();
    this.loadCart();
    this.loadPromotions();
    this.loadUserBalance();
  }

  loadCart() {
    this.http.get<GameCartItem[]>(`${this.constants.API_ENDPOINT}/cart/cartUser/${this.datauser?.user_id}`)
      .subscribe({
        next: (data) => {
          this.cartItems = data;
          this.selectedGames = new Set(data.map(item => item.game_id));
          this.calculateTotal();
        },
        error: (err) => {
          console.error('Error loading cart:', err);
          this.showToastMessage('ไม่สามารถโหลดตะกร้าได้', 'error');
        }
      });
  }

  loadPromotions() {
    // เรียก API โปรโมชั่น (ปรับ endpoint ตามจริง)
    this.http.get<Promotion[]>(`${this.constants.API_ENDPOINT}/promotions/active`)
      .subscribe({
        next: (data) => {
          this.promotions = data;
        },
        error: (err) => {
          console.error('Error loading promotions:', err);
          // ไม่แสดง error เพราะโปรโมชั่นไม่จำเป็น
        }
      });
  }

  loadUserBalance() {
    // เรียก API ยอดเงิน (ปรับ endpoint ตามจริง)
    this.http.get<any>(`${this.constants.API_ENDPOINT}/user/balance/${this.datauser?.user_id}`)
      .subscribe({
        next: (data) => {
          this.userBalance = data.balance || 0;
        },
        error: (err) => {
          console.error('Error loading balance:', err);
          this.userBalance = 0;
        }
      });
  }

  toggleGameSelection(gameId: number) {
    if (this.selectedGames.has(gameId)) {
      this.selectedGames.delete(gameId);
    } else {
      this.selectedGames.add(gameId);
    }
    this.calculateTotal();
  }

  selectAll() {
    this.selectedGames = new Set(this.cartItems.map(item => item.game_id));
    this.calculateTotal();
  }

  deselectAll() {
    this.selectedGames.clear();
    this.calculateTotal();
  }

  isSelected(gameId: number): boolean {
    return this.selectedGames.has(gameId);
  }

  calculateTotal() {
    // คำนวณราคารวม
    this.totalPrice = this.cartItems
      .filter(item => this.selectedGames.has(item.game_id))
      .reduce((sum, item) => sum + Number(item.price), 0);

    // คำนวณส่วนลด
    this.calculateDiscount();
  }

  calculateDiscount() {
    this.discountAmount = 0;

    if (this.selectedPromotion && this.promotions.length > 0) {
      const promotion = this.promotions.find(p => p.promotion_id === this.selectedPromotion);
      
      if (promotion) {
        // ตรวจสอบว่าซื้อครบขั้นต่ำหรือไม่
        if (this.totalPrice >= promotion.min_purchase) {
          if (promotion.discount_percentage > 0) {
            // ส่วนลดแบบเปอร์เซ็นต์
            this.discountAmount = (this.totalPrice * promotion.discount_percentage) / 100;
            
            // จำกัดส่วนลดสูงสุด
            if (promotion.max_discount > 0 && this.discountAmount > promotion.max_discount) {
              this.discountAmount = promotion.max_discount;
            }
          } else if (promotion.discount_amount > 0) {
            // ส่วนลดแบบจำนวนเงิน
            this.discountAmount = promotion.discount_amount;
          }
        }
      }
    }

    this.finalPrice = this.totalPrice - this.discountAmount;
    if (this.finalPrice < 0) this.finalPrice = 0;
  }

  onPromotionChange() {
    this.calculateDiscount();
  }

  get selectedCount(): number {
    return this.selectedGames.size;
  }

  get selectedPromotionDetails(): Promotion | undefined {
    if (!this.selectedPromotion) return undefined;
    return this.promotions.find(p => p.promotion_id === this.selectedPromotion);
  }

  get isPromotionValid(): boolean {
    const promo = this.selectedPromotionDetails;
    if (!promo) return true;
    return this.totalPrice >= promo.min_purchase;
  }

  removeFromCart(gameId: number) {
    this.http.delete(`${this.constants.API_ENDPOINT}/cart/${this.datauser?.user_id}/${gameId}`)
      .subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(item => item.game_id !== gameId);
          this.selectedGames.delete(gameId);
          this.calculateTotal();
          this.showToastMessage('ลบเกมออกจากตะกร้าแล้ว', 'success');
        },
        error: (err) => {
          console.error('Error removing item:', err);
          this.showToastMessage('ไม่สามารถลบเกมได้', 'error');
        }
      });
  }

  proceedToCheckout() {
    if (this.selectedGames.size === 0) {
      this.showToastMessage('กรุณาเลือกเกมที่ต้องการซื้อ', 'error');
      return;
    }

    // ตรวจสอบยอดเงิน
    if (this.userBalance < this.finalPrice) {
      this.showInsufficientBalancePopup = true;
      return;
    }

    this.isProcessing = true;

    const selectedItems = this.cartItems.filter(item => 
      this.selectedGames.has(item.game_id)
    );

    const purchaseData = {
      user_id: this.datauser?.user_id,
      items: selectedItems.map(item => ({
        game_id: item.game_id,
        quantity: 1,
        price: item.price
      })),
      total_price: this.totalPrice,
      discount_amount: this.discountAmount,
      final_price: this.finalPrice,
      promotion_id: this.selectedPromotion
    };

    this.http.post<any>(`${this.constants.API_ENDPOINT}/purchase`, purchaseData)
      .subscribe({
        next: (response) => {
          this.showToastMessage('สั่งซื้อสำเร็จ!', 'success');
          setTimeout(() => {
            this.router.navigate(['/payment', response.order_id]);
          }, 1500);
        },
        error: (err) => {
          console.error('Purchase error:', err);
          this.showToastMessage('เกิดข้อผิดพลาดในการสั่งซื้อ', 'error');
          this.isProcessing = false;
        }
      });
  }

  closeInsufficientBalancePopup() {
    this.showInsufficientBalancePopup = false;
  }

  goToTopUp() {
    this.router.navigate(['/topup']);
  }

  goToStore() {
    this.router.navigate(['/store']);
  }

  showToastMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}