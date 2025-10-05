import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { AdminHome } from './components/admin/admin-home/admin-home';
import { Profile } from './components/user/profile/profile';
import { Wallet } from './components/user/wallet/wallet';

export const routes: Routes = [
     {path: 'home', component: Home},
     {path: '', component: Login},
     {path: 'register', component: Register},
     //admin
     {path: 'admin',component:AdminHome},
     //user
     {path: 'profile',component:Profile},
     {path: 'wallet' ,component:Wallet},

];
