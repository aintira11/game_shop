import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import{Header} from '../header/header'

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    Header],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  constructor(private router: Router,){

  }

}
