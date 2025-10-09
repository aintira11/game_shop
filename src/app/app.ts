import { Component, signal,OnInit  } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './service/auth.service';
import { TruncateNumberPipe } from './config/truncate-number.pipe';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet
    ,RouterModule
    ,CommonModule
    ,TruncateNumberPipe
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('gameshop_website');
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // if (!this.authService.isLoggedIn()) {
    //   this.router.navigate(['/login']);
    // }
  }
}
