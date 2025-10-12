import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/constants';
import { Header } from '../header/header';
import { Category, Game } from '../../config/model';
import { TruncateNumberPipe } from '../../config/truncate-number.pipe';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, FormsModule, TruncateNumberPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  searchQuery: string = '';
  games: Game[] = [];
  filteredGames: Game[] = [];
  popularGames: Game[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedCategory: string = 'all';
  categories: Category[] = [];

  selectedGame: Game | null = null;
  showGameModal: boolean = false;

  constructor(
    private http: HttpClient,
    private constants: Constants,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadGames();
    this.loadPopularGames();
    this.getCategory();
  }

  // โหลดหมวดหมู่
  async getCategory() {
    const apiUrl = `${this.constants.API_ENDPOINT}/game/categories`;
    const response: any = await this.http.get(apiUrl).toPromise();
    this.categories = response.categories || response || [];
    console.log('Categories:', this.categories);
  }

  // โหลดเกมทั้งหมด
  async loadGames(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const apiUrl = `${this.constants.API_ENDPOINT}/game/games`;
      const response: any = await this.http.get(apiUrl).toPromise();

      this.games = response.games || response || [];
      this.filteredGames = [...this.games];
    } catch (error: any) {
      console.error('Load games error:', error);
      this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้';
    } finally {
      this.isLoading = false;
    }
  }

  // โหลดเกมยอดนิยม
  async loadPopularGames(): Promise<void> {
    try {
      const apiUrl = `${this.constants.API_ENDPOINT}/games/bestseller`;
      const response: any = await this.http.get(apiUrl).toPromise();
      this.popularGames = response.popularGames || response || [];
      console.log('popularGames:', this.popularGames);
    } catch (error: any) {
      console.error('Load popular games error:', error);
    }
  }

  // เมื่อเปลี่ยน Category
  onCategoryChange(): void {
    this.filterGames();
  }

  // ค้นหาเกม
  onSearch(): void {
    this.filterGames();
  }

  // ฟังก์ชันกรองข้อมูล
  filterGames(): void {
    let filtered = [...this.games];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(game =>
        game.game_name.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category_id === +this.selectedCategory);
    }

    this.filteredGames = filtered;
  }

  // คืนชื่อ Category จาก id
  getCategoryNameById(categoryId: string): string {
    const category = this.categories.find(c => c.category_id === +categoryId);
    return category ? category.category_name : '';
  }

  // เปิด Modal แสดงรายละเอียดเกม
  viewGameDetail(gameId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    const game = this.games.find(g => g.game_id === gameId) || 
                 this.popularGames.find(g => g.game_id === gameId);
    
    if (game) {
      this.selectedGame = game;
      this.showGameModal = true;
      document.body.style.overflow = 'hidden'; // ป้องกันการ scroll หน้าหลัก
    }
  }

  // ปิด Modal
  closeGameModal(): void {
    this.showGameModal = false;
    this.selectedGame = null;
    document.body.style.overflow = 'auto'; // คืนค่าการ scroll
  }

  // เพิ่มลงตะกร้าจาก Modal
  addToCartFromModal(): void {
    if (this.selectedGame) {
      this.addToCart(this.selectedGame);
      this.closeGameModal();
    }
  }

  addToCart(game: Game, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const user_id = this.authService.getUser();
    if (!user_id) {
      alert('กรุณาเข้าสู่ระบบก่อนเพิ่มลงตะกร้า');
      return;
    }

    const payload = {
      user_id: user_id.user_id,
      game_id: game.game_id
    };

    this.http.post(`${this.constants.API_ENDPOINT}/cart/gametocart`, payload).subscribe({
      next: (res: any) => {
        if (res.message === "คุณมีเกมนี้ในตะกร้าแล้ว") {
          alert('⚠️ เกมนี้อยู่ในตะกร้าของคุณแล้ว');
        } else if (res.message === "คุณได้ซื้อเกมนี้ไปแล้ว") {
          alert('⚠️ คุณได้ซื้อเกมนี้ไปแล้ว');
        } else {
          alert('✅ เพิ่มเกมลงตะกร้าสำเร็จ');
        }
      },
      error: (err) => {
        console.error('Add to cart error:', err);
        alert('❌ เกิดข้อผิดพลาดระหว่างเพิ่มลงตะกร้า');
      }
    });
  }
}