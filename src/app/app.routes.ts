import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { AdminHome } from './components/admin/admin-home/admin-home';
import { Profile } from './components/user/profile/profile';
import { Wallet } from './components/user/wallet/wallet';
import { ManageGame } from './components/admin/manage-game/manage-game';
import { Cart } from './components/user/cart/cart';
import { Library } from './components/user/library/library';
import { Transaction } from './components/admin/transaction/transaction';

export const routes: Routes = [
     {path: '', component: Home},
     {path: 'login', component: Login},
     {path: 'register', component: Register},
     //admin
     {path: 'admin',component:AdminHome},
     {path: 'transation', component: Transaction},
     {path: 'manage_game' ,component:ManageGame},
     //user
     {path: 'profile',component:Profile},
     {path: 'wallet' ,component:Wallet},
     {path: 'cart',component:Cart},
     {path: 'library',component:Library} 

];
