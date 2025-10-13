import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../header/header';
import { DataUser, gameLibrary } from '../../../config/model';
import { AuthService } from '../../../service/auth.service';
import { Constants } from '../../../config/constants';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-library',
  imports: [Header, CommonModule, FormsModule],
  templateUrl: './library.html',
  styleUrl: './library.scss'
})
export class Library implements OnInit {
  datauser: DataUser | null = null;
  libraryGames: gameLibrary[] = [];
  filteredGames: gameLibrary[] = [];
  
  selectedGame: gameLibrary | null = null;
  showGameModal: boolean = false;
  
  searchQuery: string = '';
  selectedCategory: string = 'all';
  sortBy: string = 'recent'; // recent, name, price
  
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private constants: Constants,
  ) {}

  ngOnInit(): void {
    this.datauser = this.authService.getUser();
    this.loadGames();
  }

  async loadGames() {
    this.isLoading = true;
    try {
      const apiUrl = `${this.constants.API_ENDPOINT}/cart/purchased-games/${this.datauser?.user_id}`;
      const response: any = await this.http.get(apiUrl).toPromise();
      this.libraryGames = response.games || response || [];
      this.filteredGames = [...this.libraryGames];
      this.applyFilters();
      console.log('Library Games:', this.libraryGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // กรองและเรียงข้อมูล
  applyFilters() {
    let filtered = [...this.libraryGames];

    // กรองตามคำค้นหา
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(game =>
        game.game_name.toLowerCase().includes(query) ||
        game.category_name.toLowerCase().includes(query)
      );
    }

    // กรองตาม Category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(game => 
        game.category_name === this.selectedCategory
      );
    }

    // เรียงข้อมูล
    switch (this.sortBy) {
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.buy_date).getTime() - new Date(a.buy_date).getTime()
        );
        break;
      case 'name':
        filtered.sort((a, b) => 
          a.game_name.localeCompare(b.game_name)
        );
        break;
      case 'price':
        filtered.sort((a, b) => 
          parseFloat(b.price) - parseFloat(a.price)
        );
        break;
    }

    this.filteredGames = filtered;
  }

  // เมื่อค้นหา
  onSearch() {
    this.applyFilters();
  }

  // เมื่อเปลี่ยน Category
  onCategoryChange() {
    this.applyFilters();
  }

  // เมื่อเปลี่ยนการเรียง
  onSortChange() {
    this.applyFilters();
  }

  // ดึง Category ที่ไม่ซ้ำ
  getUniqueCategories(): string[] {
    const categories = this.libraryGames.map(game => game.category_name);
    return [...new Set(categories)];
  }

  // เปิด Modal
  viewGameDetail(game: gameLibrary) {
    this.selectedGame = game;
    this.showGameModal = true;
    document.body.style.overflow = 'hidden';
  }

  // ปิด Modal
  closeGameModal() {
    this.showGameModal = false;
    this.selectedGame = null;
    document.body.style.overflow = 'auto';
  }

  // จัดรูปแบบวันที่
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // คำนวณจำนวนวันที่ครอบครอง
  getDaysOwned(buyDate: string): number {
    const today = new Date();
    const purchased = new Date(buyDate);
    const diffTime = Math.abs(today.getTime() - purchased.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}