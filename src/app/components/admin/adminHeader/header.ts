import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { DataUser } from '../../../config/model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-header',
  imports: [RouterLink,CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class adminHeader implements OnInit {

  datauser: DataUser | null = null;

  constructor(private router: Router, private authService: AuthService){
  }
  ngOnInit(): void {
    this.datauser = this.authService.getUser();

  }

  Transaction(): void {
    this.router.navigate(['/transation']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  manage_game(): void {
    // this.authService.logout();
    this.router.navigate(['/manage_game']);
  }
  adminhome(): void {
    // this.authService.logout();
    this.router.navigate(['/admin']);
  }
  gotodiscount() {
    this.router.navigate(['/discount']);
}
  
}
