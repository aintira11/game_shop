
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/constants';
import{Header} from '../header/header'

interface Game {
  game_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category?: string;
  release_date?: string;
}

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    Header,
  FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  searchQuery: string = '';
  games: Game[] = [];
  filteredGames: Game[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedCategory: string = 'all';
  categories: string[] = ['all', 'Action', 'Adventure', 'RPG', 'Strategy', 'Sports'];

  constructor(
    private http: HttpClient,
    private constants: Constants,
    private router: Router
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
      this.filteredGames = [...this.games];
    } catch (error: any) {
      console.error('Load games error:', error);
      this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้';
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(): void {
    this.filterGames();
  }

  onCategoryChange(): void {
    this.filterGames();
  }

  filterGames(): void {
    let filtered = [...this.games];

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(query) ||
        game.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(game => 
        game.category === this.selectedCategory
      );
    }

    this.filteredGames = filtered;
  }

  viewGameDetail(gameId: number): void {
    this.router.navigate(['/game', gameId]);
  }

  addToCart(game: Game, event: Event): void {
    event.stopPropagation();
    // Logic to add to cart
    console.log('Add to cart:', game);
    alert(`เพิ่ม ${game.name} ลงในตะกร้าแล้ว`);
  }
}