import { Component, OnInit } from '@angular/core';
import { adminHeader } from "../adminHeader/header";
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../../config/constants';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Game } from '../../../config/model';

@Component({
  selector: 'app-admin-home',
  imports: [adminHeader, CommonModule, FormsModule],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.scss'
})
export class AdminHome implements OnInit {
  isLoading: boolean = false;
  games: Game[] = [];
  sortBy: string = 'recent';
  filteredGames: Game[] = [];
  selectedGame: Game | null = null;
  errorMessage: string = '';
  searchQuery: string = '';
  selectedCategory: string = 'all';
  uniqueCategories: string[] = [];

  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}

  ngOnInit(): void {
    this.loadGames();
  }

  async loadGames(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const apiUrl = `${this.constants.API_ENDPOINT}/game/games`;
      const response: any = await this.http.get(apiUrl).toPromise();
      this.games = response.games || response || [];
      
      // ดึง unique categories เมื่อโหลดเกมเสร็จ
      this.uniqueCategories = this.getUniqueCategories();
      
      this.applyFilters();
    } catch (error: any) {
      console.error('Load games error:', error);
      this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้';
    } finally {
      this.isLoading = false;
    }
  }

  // ดึง Category ที่ไม่ซ้ำ
  getUniqueCategories(): string[] {
    const categories = this.games
      .map(game => game.category_name)
      .filter((value, index, self) => self.indexOf(value) === index && value);
    return categories.sort();
  }

  applyFilters(): void {
    let filtered = [...this.games];

    // กรองตามหมวดหมู่
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(game =>
        game.category_name === this.selectedCategory
      );
    }

    // ค้นหาตามชื่อเกม
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(game =>
        game.game_name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // เรียงข้อมูล
    switch (this.sortBy) {
      case 'recent':
        filtered.sort((a, b) =>
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
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
      case 'best_selling':
        filtered.sort((a, b) =>
          b.purchase_count - a.purchase_count
        );
        break;
    }

    this.filteredGames = filtered;
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  selectGame(game: Game): void {
    this.selectedGame = this.selectedGame?.game_id === game.game_id ? null : game;
  }
}