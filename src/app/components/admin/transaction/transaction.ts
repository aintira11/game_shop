import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { adminHeader } from "../adminHeader/header";
import { Constants } from '../../../config/constants';
import { DataUser, Transactionmodel, TransactionResponse } from '../../../config/model';


@Component({
  selector: 'app-transaction',
  imports: [adminHeader, CommonModule, FormsModule],
  templateUrl: './transaction.html',
  styleUrl: './transaction.scss'
})
export class Transaction implements OnInit {
  users: DataUser[] = [];
  filteredUsers: DataUser[] = [];
  transactions: Transactionmodel[] = [];
  filteredTransactions: Transactionmodel[] = [];
  
  selectedUserId: number | null = null;
  selectedUser: DataUser | null = null;
  userSearchQuery: string = '';
  transactionSearchQuery: string = '';
  filterType: string = 'all'; // all, deposit, purchase
  searchQuery: string = '';
  
  isLoading: boolean = false;
  expandedTransactionId: number | null = null;
  showUserDropdown: boolean = false;

  constructor(
    private http: HttpClient,
    private constants: Constants
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  // โหลดรายชื่อผู้ใช้ทั้งหมด
  loadUsers() {
    this.isLoading = true;
    this.http.get<any>(`${this.constants.API_ENDPOINT}/wallet/allusers`)
      .subscribe({
        next: (response) => {
          this.users = response.users || response || [];
          this.filteredUsers = [...this.users];
          console.log('Users:', this.users);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading users:', err);
          this.isLoading = false;
        }
      });
  }

// แสดงรายชื่อผู้ใช้ทั้งหมดเมื่อคลิกที่ช่องค้นหา
showAllUsersOnFocus() {
  // ถ้ายังไม่มีการค้นหา และยังไม่ได้เลือก user ให้แสดงรายชื่อทั้งหมด
  if (!this.userSearchQuery) {
    this.filteredUsers = [...this.users];
    this.showUserDropdown = true; // ✅ จุดสำคัญ: ตั้งค่าเป็น true เพื่อแสดง Dropdown
  }
}

// ค้นหาผู้ใช้
onUserSearch() {
  const query = this.userSearchQuery.toLowerCase().trim();
  
  // ถ้าช่องค้นหาว่าง (เช่น ผู้ใช้ลบข้อความจนหมด) ให้ซ่อน Dropdown
  if (!query) {
    this.showUserDropdown = false; // ซ่อนเมื่อไม่มี query
    return;
  }

  // ตรรกะการกรองเหมือนเดิม
  this.filteredUsers = this.users.filter(user => 
    user.username.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.user_id.toString().includes(query)
  );

  // แสดง Dropdown ถ้ามีผลลัพธ์
  this.showUserDropdown = this.filteredUsers.length > 0;
}

  // เลือกผู้ใช้จาก dropdown
  selectUser(user: DataUser) {
    this.selectedUser = user;
    this.selectedUserId = user.user_id;
    this.userSearchQuery = `${user.username} (${user.email})`;
    this.showUserDropdown = false;
    this.loadUserTransactions(user.user_id);
    this.transactionSearchQuery = '';
    this.filterType = 'all';
    this.expandedTransactionId = null;
  }

  // ล้างการเลือกผู้ใช้
  clearUserSelection() {
    this.selectedUser = null;
    this.selectedUserId = null;
    this.userSearchQuery = '';
    this.transactions = [];
    this.filteredTransactions = [];
    this.filteredUsers = [...this.users];
    this.showUserDropdown = false;
  }

  // โหลดประวัติการทำธุรกรรมของผู้ใช้
  loadUserTransactions(userId: number) {
    this.isLoading = true;
    this.selectedUserId = userId;
    this.selectedUser = this.users.find(u => u.user_id === userId) || null;

    this.http.get<any>(`${this.constants.API_ENDPOINT}/wallet/user/transactions/${userId}`)
      .subscribe({
        next: (response) => {
          if (response && Array.isArray(response.transactions)) {
            this.transactions = response.transactions;
          } else if (Array.isArray(response)) {
            this.transactions = response;
          } else {
            this.transactions = [];
          }
          this.applyFilters();
          this.isLoading = false;
          console.log('Transactions:', this.transactions);
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
          this.transactions = [];
          this.filteredTransactions = [];
          this.isLoading = false;
        }
      });
  }

  // กรองข้อมูลตามเงื่อนไข
  applyFilters() {
    let filtered = [...this.transactions];

    // กรองตามประเภท
    if (this.filterType !== 'all') {
      filtered = filtered.filter(t => t.type === this.filterType);
    }

    // กรองตามคำค้นหา
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        // ค้นหาจากชื่อเกม
        const gameMatch = t.games.some(g => 
          g.game_name.toLowerCase().includes(query)
        );
        // ค้นหาจาก transaction ID
        const idMatch = t.transaction_id.toString().includes(query);
        // ค้นหาจากจำนวนเงิน
        const amountMatch = t.amount.includes(query);
        
        return gameMatch || idMatch || amountMatch;
      });
    }

    // เรียงตามวันที่ล่าสุด
    filtered.sort((a, b) => {
      const dateA = new Date(a.transaction_date).getTime();
      const dateB = new Date(b.transaction_date).getTime();
      return dateB - dateA;
    });

    this.filteredTransactions = filtered;
  }

  // เมื่อเปลี่ยนผู้ใช้
  onUserChange() {
    if (this.selectedUserId) {
      this.loadUserTransactions(this.selectedUserId);
      this.searchQuery = '';
      this.filterType = 'all';
      this.expandedTransactionId = null;
    } else {
      this.transactions = [];
      this.filteredTransactions = [];
      this.selectedUser = null;
    }
  }

  // เมื่อเปลี่ยนตัวกรอง
  onFilterChange() {
    this.applyFilters();
  }

  // เมื่อค้นหา
  onSearch() {
    this.applyFilters();
  }

  // Toggle รายละเอียด
  toggleTransactionDetails(transactionId: number) {
    if (this.expandedTransactionId === transactionId) {
      this.expandedTransactionId = null;
    } else {
      this.expandedTransactionId = transactionId;
    }
  }

  // เช็คว่าขยายอยู่หรือไม่
  isExpanded(transactionId: number): boolean {
    return this.expandedTransactionId === transactionId;
  }

  // จัดรูปแบบวันที่
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

  // คำนวณยอดรวมทั้งหมด
  getTotalAmount(): number {
    return this.filteredTransactions.reduce((sum, t) => {
      return sum + parseFloat(t.amount);
    }, 0);
  }

  // นับจำนวนแต่ละประเภท
  getTransactionCount(type: string): number {
    if (type === 'all') {
      return this.transactions.length;
    }
    return this.transactions.filter(t => t.type === type).length;
  }
}