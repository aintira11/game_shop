import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { adminHeader } from "../adminHeader/header";
import { Promotion } from '../../../config/model';
import { Constants } from '../../../config/constants';

@Component({
  selector: 'app-discountcode',
  standalone: true,
  imports: [adminHeader, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './discountcode.html',
  styleUrl: './discountcode.scss'
})
export class Discountcode implements OnInit {
  promotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  filterType: 'all' | 'limited' | 'unlimited' = 'all';
  
  showAddModal = false;
  showEditModal = false;
  selectedPromotion: Promotion | null = null;
  
  promotionForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private http: HttpClient, private fb: FormBuilder, private Constants: Constants) {
    this.promotionForm = this.fb.group({
      promotion_name: ['', [Validators.required, Validators.minLength(2)]],
      limit_promotion: ['', [Validators.required, Validators.min(0)]],
      discount_type: ['%', Validators.required],
      discount_value: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.isLoading = true;
    this.http.get<Promotion[]>(`${this.Constants.API_ENDPOINT}/wallet/all/promotion`).subscribe(
      (data) => {
        this.promotions = data;
        this.applyFilter();
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลโปรโมชั่น';
        console.error('Error loading promotions:', error);
        this.isLoading = false;
      }
    );
  }

  applyFilter(): void {
    switch (this.filterType) {
      case 'limited':
        this.filteredPromotions = this.promotions.filter(p => p.limit_promotion !== 0);
        break;
      case 'unlimited':
        this.filteredPromotions = this.promotions.filter(p => p.limit_promotion === 0);
        break;
      case 'all':
      default:
        this.filteredPromotions = [...this.promotions];
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

 openAddModal(): void {
    this.showAddModal = true;
    this.promotionForm.reset({ discount_type: '%' });
    this.errorMessage = '';
  }

  openEditModal(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.showEditModal = true;
    this.promotionForm.patchValue({
      promotion_name: promotion.promotion_name,
      limit_promotion: promotion.limit_promotion,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value
    });
    this.errorMessage = '';
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.promotionForm.reset();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedPromotion = null;
    this.promotionForm.reset();
  }

  addPromotion(): void {
    if (this.promotionForm.invalid) {
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    this.isLoading = true;
    const formData = this.promotionForm.value;
    
    this.http.post(`${this.Constants.API_ENDPOINT}/wallet/add/promotion`, formData).subscribe(
      (response: any) => {
        this.successMessage = 'เพิ่มโปรโมชั่นสำเร็จ';
        this.closeAddModal();
        this.loadPromotions();
        setTimeout(() => this.successMessage = '', 3000);
      },
      (error) => {
        this.errorMessage = error.error?.message || 'เกิดข้อผิดพลาดในการเพิ่มโปรโมชั่น';
        console.error('Error adding promotion:', error);
        this.isLoading = false;
      }
    );
  }

  updatePromotion(): void {
    if (!this.selectedPromotion || this.promotionForm.invalid) {
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    this.isLoading = true;
    const formData = this.promotionForm.value;

    this.http.put(`${this.Constants.API_ENDPOINT}/wallet/edit/promotion/${this.selectedPromotion.promotion_id}`, formData).subscribe(
       (response: any) => {
        this.successMessage = 'แก้ไขโปรโมชั่นสำเร็จ';
        this.closeEditModal();
        this.loadPromotions();
        setTimeout(() => this.successMessage = '', 3000);
      },
      (error) => {
        this.errorMessage = error.error?.message || 'เกิดข้อผิดพลาดในการแก้ไขโปรโมชั่น';
        console.error('Error updating promotion:', error);
        this.isLoading = false;
      }
    );
  }

 deletePromotion(promotionId: number): void {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่นนี้?')) {
      this.isLoading = true;
      this.http.delete(`${this.Constants.API_ENDPOINT}/wallet/delete/promotion/${promotionId}`).subscribe(
       (response: any) => {
          this.successMessage = 'ลบโปรโมชั่นสำเร็จ';
          this.loadPromotions();
          setTimeout(() => this.successMessage = '', 3000);
        },
        (error) => {
          this.errorMessage = error.error?.message || 'เกิดข้อผิดพลาดในการลบโปรโมชั่น';
          console.error('Error deleting promotion:', error);
          this.isLoading = false;
        }
      );
    }
  }

  getDiscountDisplay(promotion: Promotion): string {
    return promotion.discount_type === '%' 
      ? `${promotion.discount_value}%` 
      : `฿${promotion.discount_value}`;
  }

  getLimitDisplay(limit: number): string {
    return limit === 0 ? 'Sold out' : `remaining  ${limit} `;
  }

  getStatusBadgeClass(limit: number): string {
    return limit === 0 ? 'badge-expired' : 'badge-active';
  }

  isPromotionExpired(limit: number): boolean {
    return limit === 0;
  }
}