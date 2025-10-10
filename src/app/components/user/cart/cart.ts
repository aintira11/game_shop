// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from "../../header/header";
import { DataUser, GameCartItem, Promotion } from '../../../config/model';
import { AuthService } from '../../../service/auth.service';
import { Constants } from '../../../config/constants';
import { TruncateNumberPipe } from '../../../config/truncate-number.pipe';

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
  }

  loadCart() {
    this.http.get<GameCartItem[]>(`${this.constants.API_ENDPOINT}/cart/cartUser/${this.datauser?.user_id}`)
      .subscribe({
        next: (data) => {
          this.cartItems = data;
          console.log('Cart Items:', this.cartItems);
          this.selectedGames = new Set(data.map(item => item.game_id));
          this.calculateTotal();
        },
        error: (err) => {
          console.error('Error loading cart:', err);
          this.showToastMessage('Unable to load basket.', 'error');
        }
      });
  }

  loadPromotions() {
    this.http.get<Promotion[]>(`${this.constants.API_ENDPOINT}/cart/loadpromotion/${this.datauser?.user_id}`)
      .subscribe({
        next: (data) => {
          this.promotions = data;
          console.log('Promotions:', this.promotions);
        },
        error: (err) => {
          console.error('Error loading promotions:', err);
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
        const discountValue = Number(promotion.discount_value);
        
        if (promotion.discount_type === '%') {
          // ส่วนลดแบบเปอร์เซ็นต์
          this.discountAmount = (this.totalPrice * discountValue) / 100;
        } else if (promotion.discount_type === 'fixed') {
          // ส่วนลดแบบจำนวนเงินคงที่
          this.discountAmount = discountValue;
        }

        // ตรวจสอบไม่ให้ส่วนลดเกินราคารวม
        if (this.discountAmount > this.totalPrice) {
          this.discountAmount = this.totalPrice;
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

  get promotionDescription(): string {
    const promo = this.selectedPromotionDetails;
    if (!promo) return '';
    
    if (promo.discount_type === '%') {
      return `Discount ${promo.discount_value}%`;
    } else if (promo.discount_type === 'fixed') {
      return `Discount ฿${promo.discount_value}`;
    }
    return '';
  }

  get userBalance(): number {
    return Number(this.datauser?.wallet) || 0;
  }

  get isPromotionValid(): boolean {
    const promo = this.selectedPromotionDetails;
    if (!promo) return true;
    
    // ตรวจสอบว่ายังมีโปรโมชั่นเหลืออยู่หรือไม่
    return promo.limit_promotion > 0;
  }

  removeFromCart(gameId: number) {
    // ใช้ cart_id ตัวแรกที่เจอ (ควรส่ง cart_id ที่ถูกต้องของเกมนั้นๆ)
    const cartItem = this.cartItems.find(item => item.game_id === gameId);
    if (!cartItem) return;

    this.http.delete(`${this.constants.API_ENDPOINT}/cart/delectCart/${cartItem.cart_id}/${gameId}`)
      .subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(item => item.game_id !== gameId);
          this.selectedGames.delete(gameId);
          this.calculateTotal();
          this.showToastMessage('Game has been removed from cart.', 'success');
        },
        error: (err) => {
          console.error('Error removing item:', err);
          this.showToastMessage('Unable to delete game.', 'error');
        }
      });
  }

  proceedToCheckout() {
    if (this.selectedGames.size === 0) {
      this.showToastMessage('Please select the game you wish to purchase.', 'error');
      return;
    }

    // ตรวจสอบยอดเงิน
    if (this.userBalance < this.finalPrice) {
      this.showInsufficientBalancePopup = true;
      return;
    }

    // ตรวจสอบว่าโปรโมชั่นยังใช้ได้หรือไม่
    if (this.selectedPromotion && !this.isPromotionValid) {
      this.showToastMessage('This promotion cannot be used.', 'error');
      return;
    }

    this.isProcessing = true;

    const selectedItems = this.cartItems.filter(item => 
      this.selectedGames.has(item.game_id)
    );

    const purchaseData = {
      user_id: this.datauser?.user_id,
      cart_id: this.cartItems[0]?.cart_id,
      promotion_id: this.selectedPromotion || null,
      total_price: this.finalPrice, // ใช้ราคาหลังหักส่วนลด
      items: selectedItems.map(item => ({
        game_id: item.game_id,
        game_price: Number(item.price)
      }))
    };

    console.log('Purchase Data:', purchaseData);

    this.http.post<any>(`${this.constants.API_ENDPOINT}/cart/buyGame`, purchaseData)
      .subscribe({
        next: (response) => {
          this.showToastMessage('Order successful!', 'success');
          setTimeout(() => {
            
            // อัปเดตเฉพาะยอดเงินใน user ที่เก็บไว้
            this.authService.updateWallet(response.remaining_balance);
            // ไปหน้า Library
            this.router.navigate(['/library']);
          }, 1500);
        },
        error: (err) => {
          console.error('Purchase error:', err);
          const errorMessage = err.error?.message || 'An error occurred while ordering.';
          this.showToastMessage(errorMessage, 'error');
          this.isProcessing = false;
        }
      });
  }

  // closeInsufficientBalancePopup() {
  //   this.showInsufficientBalancePopup = false;
  // }

  // goToTopUp() {
  //   this.showInsufficientBalancePopup = false;
  //   this.router.navigate(['/wallet']);
  // }

  goToStore() {
    this.router.navigate(['/']);
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