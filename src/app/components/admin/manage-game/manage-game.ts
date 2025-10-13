import { Component, OnInit } from '@angular/core';
import { adminHeader } from "../adminHeader/header";
import { Constants } from '../../../config/constants';
import { CloudinaryService } from '../../../service/cloudinary.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Category, Game } from '../../../config/model';
import { TruncateNumberPipe } from '../../../config/truncate-number.pipe';



@Component({
  selector: 'app-manage-game',
  imports: [adminHeader, FormsModule, CommonModule, TruncateNumberPipe],
  templateUrl: './manage-game.html',
  styleUrl: './manage-game.scss'
})
export class ManageGame implements OnInit {
  games: Game[] = [];
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedFile: File | null = null;
  profileSrc: string = '';
  searchQuery: string = '';
  isLoading: boolean = false;
  categories: Category[] = [];

  currentGame: Partial<Game> = {
    game_name: '',
    price: '',
    category_id: undefined,
    category_name: '',
    game_image: '',
    description: '',
    release_date: ''
  };

  constructor(
    private http: HttpClient,
    private cloudinary: CloudinaryService,
    private Constants: Constants
  ) {}

  ngOnInit(): void {
    this.loadGames();
    this.getCategory();
  }

  loadGames(): void {
    this.isLoading = true;
    this.http.get<{ games: Game[] }>(`${this.Constants.API_ENDPOINT}/game/games`).subscribe({
      next: (response) => {
        this.games = response.games;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading games:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลเกม');
        this.isLoading = false;
      }
    });
  }

  async getCategory() {
    const apiUrl = `${this.Constants.API_ENDPOINT}/game/categories`;
    const response: any = await this.http.get(apiUrl).toPromise();
    this.categories = response.categories || response || [];
    console.log('Categories:', this.categories);
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.showModal = true;
    this.resetForm();
  }

  openEditModal(game: Game): void {
    this.isEditMode = true;
    this.showModal = true;
    this.currentGame = { ...game };
    this.profileSrc = game.game_image || '';
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.currentGame = {
      game_name: '',
      price: '',
      category_id: 0,
      category_name: '',
      game_image: '',
      description: '',
      release_date: ''
    };
    this.selectedFile = null;
    this.profileSrc = '';
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    this.selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.profileSrc = result;
    };
    reader.readAsDataURL(file);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  async saveGame(): Promise<void> {
    // ตรวจสอบข้อมูลที่ต้องกรอก
    if (!this.currentGame.game_name?.trim()) {
      alert('กรุณากรอกชื่อเกม');
      return;
    }

    if (this.currentGame.price === null || this.currentGame.price === undefined) {
      alert('กรุณากรอกราคาเกม');
      return;
    }

    if (Number(this.currentGame.price) < 0) {
      alert('ราคาต้องมากกว่าหรือเท่ากับ 0');
      return;
    }

    if (!this.currentGame.category_id) {
      alert('กรุณาเลือกหมวดหมู่เกม');
      return;
    }

    if (!this.currentGame.description?.trim()) {
      alert('กรุณากรอกรายละเอียดเกม');
      return;
    }

    // ถ้าเป็น "เพิ่มเกมใหม่" ต้องมีรูป
    if (!this.isEditMode && !this.selectedFile) {
      alert('กรุณาเลือกรูปภาพเกม');
      return;
    }

    try {
      this.isLoading = true;

      // อัปโหลดรูปภาพใหม่ (เฉพาะถ้ามีการเลือกไฟล์ใหม่)
      if (this.selectedFile) {
        const uploadResult: any = await this.cloudinary.uploadImage(this.selectedFile).toPromise();
        this.currentGame.game_image = uploadResult.secure_url;
      } else if (this.isEditMode && !this.selectedFile) {
        console.log('ใช้รูปภาพเดิม:', this.currentGame.game_image);
      }

      // สร้าง payload ที่จะส่งไปยัง API
      const gameData = {
        game_name: this.currentGame.game_name,
        price: this.currentGame.price,
        category_id: this.currentGame.category_id,
        game_image: this.currentGame.game_image,
        description: this.currentGame.description,
        release_date: this.currentGame.release_date || null
      };

      // อัปเดตหรือเพิ่มเกม
      if (this.isEditMode) {
        this.http.put(`${this.Constants.API_ENDPOINT}/game/gameUpdate/${this.currentGame.game_id}`, gameData).subscribe({
          next: (response) => {
            alert('อัพเดตเกมสำเร็จ');
            this.loadGames();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating game:', error);
            alert(error.error?.message || 'เกิดข้อผิดพลาดในการอัพเดตเกม');
            this.isLoading = false;
          }
        });
      } else {
        this.http.post(`${this.Constants.API_ENDPOINT}/game/newgame`, gameData).subscribe({
          next: (response) => {
            alert('เพิ่มเกมสำเร็จ');
            this.loadGames();
            this.closeModal();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating game:', error);
            alert(error.error?.message || 'เกิดข้อผิดพลาดในการเพิ่มเกม');
            this.isLoading = false;
          }
        });
      }

    } catch (error) {
      console.error('Error saving game:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      this.isLoading = false;
    }
  }

  deleteGame(gameId: number): void {
    if (confirm('คุณต้องการลบเกมนี้หรือไม่?')) {
      this.isLoading = true;
      this.http.delete(`${this.Constants.API_ENDPOINT}/game/delete/${gameId}`).subscribe({
        next: (response) => {
          console.log('Game deleted successfully:', response);
          alert('ลบเกมสำเร็จ');
          this.loadGames();
          this.closeModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting game:', error);
          alert(error.error?.message || 'เกิดข้อผิดพลาดในการลบเกม');
          this.isLoading = false;
        }
      });
    }
  }

  getFilteredGames(): Game[] {
  // ถ้าไม่มีการค้นหา (searchQuery เป็นค่าว่าง) ให้แสดงเกมทั้งหมด
  if (!this.searchQuery || !this.searchQuery.trim()) {
    return this.games;
  }

  // แปลงคำค้นหาเป็นตัวพิมพ์เล็กเพื่อการเปรียบเทียบที่ไม่สน case-sensitive
  const lowerCaseQuery = this.searchQuery.toLowerCase();

  // กรอง (filter) อาร์เรย์ games
  return this.games.filter(game => {
    // ตรวจสอบว่าชื่อเกม (game_name) มีคำค้นหาอยู่หรือไม่
    const nameMatch = game.game_name && game.game_name.toLowerCase().includes(lowerCaseQuery);
    
    // ตรวจสอบว่าชื่อหมวดหมู่ (category_name) มีคำค้นหาอยู่หรือไม่
    const categoryMatch = game.category_name && game.category_name.toLowerCase().includes(lowerCaseQuery);

    // คืนค่าเกมที่ตรงเงื่อนไข (ชื่อเกม หรือ ชื่อหมวดหมู่)
    return nameMatch || categoryMatch;
  });
}

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}