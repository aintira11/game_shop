import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Header } from "../../header/header";
import { DataUser, Transaction, TransactionResponse } from '../../../config/model';
import { AuthService } from '../../../service/auth.service';
import { Constants } from '../../../config/constants';

// Interface สำหรับโครงสร้างข้อมูลใหม่
// interface Promotion {
//   name: string;
//   discount_value: string;
// }

// interface Game {
//   buy_id: number;
//   game_id: number;
//   game_name: string;
//   game_price: string;
// }

// interface Transaction {
//   transaction_id: number;
//   amount: string;
//   type: 'deposit' | 'purchase';
//   transaction_date: string;
//   total_price?: string;
//   buy_date?: string;
//   promotion: Promotion | null;
//   games: Game[];
// }

// interface TransactionResponse {
//   transactions: Transaction[];
// }

@Component({
  selector: 'app-wallet',
  imports: [Header, CommonModule, FormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss'
})
export class Wallet implements OnInit {
  datauser: DataUser | null = null;
  walletBalance: number = 0;
  topupAmount: string = '';
  transactions: Transaction[] = [];
  expandedTransactionId: number | null = null; // เพิ่มตัวแปรนี้
  
  isProcessing: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  quickAmounts: number[] = [100, 200, 300, 500, 1000];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private constants: Constants,
  ) {}

  ngOnInit() {
    this.datauser = this.authService.getUser();
    this.loadWalletBalance();
    this.loadTransactionHistory();
  }

  loadWalletBalance() {
    if (!this.datauser?.user_id) return;

    this.http.get<{ wallet: number }>(`${this.constants.API_ENDPOINT}/wallet/user/${this.datauser.user_id}`)
      .subscribe({
        next: (data) => {
          this.walletBalance = Number(data.wallet) || 0;
          // อัปเดต datauser
          if (this.datauser) {
            // this.datauser.wallet = this.walletBalance;
            this.authService.setUser(this.datauser);
          }
        },
        error: (err) => {
          console.error('Error loading wallet balance:', err);
          this.walletBalance = Number(this.datauser?.wallet) || 0;
        }
      });
  }

  loadTransactionHistory() {
    if (!this.datauser?.user_id) return;

    this.http.get<TransactionResponse>(`${this.constants.API_ENDPOINT}/wallet/user/transactions/${this.datauser.user_id}`)
      .subscribe({
        next: (data) => {
          // ตรวจสอบว่า response มี transactions array
          if (data && Array.isArray(data.transactions)) {
            this.transactions = data.transactions;
          } else if (Array.isArray(data)) {
            this.transactions = data;
          } else {
            this.transactions = [];
          }

          console.log('Transactions:', this.transactions);
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
        }
      });
  }

  selectQuickAmount(amount: number) {
    this.topupAmount = amount.toString();
  }

  confirmTopup() {
    const amount = Number(this.topupAmount);

    // Validation
    if (!this.topupAmount || isNaN(amount) || amount <= 0) {
      this.showToastMessage('Please enter a valid amount.', 'error');
      return;
    }

    if (amount < 10) {
      this.showToastMessage('Minimum top-up amount is ฿10', 'error');
      return;
    }

    if (amount > 50000) {
      this.showToastMessage('Maximum top-up amount is ฿50,000', 'error');
      return;
    }

    this.isProcessing = true;

    const topupData = {
      user_id: this.datauser?.user_id,
      amount: amount
    };

    this.http.post<{ message: string; new_balance: number }>(
      `${this.constants.API_ENDPOINT}/wallet/wallet/deposit`,
      topupData
    ).subscribe({
      next: (response) => {
        this.walletBalance = response.new_balance;
        
        // อัปเดต datauser
        if (this.datauser) {
          this.datauser.wallet = this.walletBalance;
          this.authService.setUser(this.datauser);
        }
        this.loadWalletBalance();
        this.topupAmount = '';
        this.loadTransactionHistory();
        this.showToastMessage(`Top-up successful! ฿${amount}`, 'success');
        this.isProcessing = false;
      },
      error: (err) => {
        console.error('Topup error:', err);
        const errorMessage = err.error?.message || 'Top-up failed. Please try again.';
        this.showToastMessage(errorMessage, 'error');
        this.isProcessing = false;
      }
    });
  }

  getPurchaseTransactions() {
    return Array.isArray(this.transactions)
      ? this.transactions.filter(t => t.type === 'purchase')
      : [];
  }

  getTopupTransactions() {
    return Array.isArray(this.transactions)
      ? this.transactions.filter(t => t.type === 'deposit')
      : [];
  }

  // เรียงรายการทั้งหมดตามเวลาล่าสุด
  getAllTransactionsSorted(): Transaction[] {
    if (!Array.isArray(this.transactions)) return [];
    
    return [...this.transactions].sort((a, b) => {
      const dateA = new Date(a.transaction_date).getTime();
      const dateB = new Date(b.transaction_date).getTime();
      return dateB - dateA; // เรียงจากใหม่ไปเก่า
    });
  }

  // method สำหรับ toggle รายละเอียด
  toggleTransactionDetails(transactionId: number) {
    if (this.expandedTransactionId === transactionId) {
      this.expandedTransactionId = null; // ปิดถ้าคลิกซ้ำ
    } else {
      this.expandedTransactionId = transactionId; // เปิดรายการที่เลือก
    }
  }

  // method สำหรับเช็คว่ารายการนี้ถูกขยายหรือไม่
  isExpanded(transactionId: number): boolean {
    return this.expandedTransactionId === transactionId;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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