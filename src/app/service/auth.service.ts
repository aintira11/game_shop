import { Injectable } from '@angular/core';
import { DataUser } from '../config/model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: DataUser | null = null;
   
 constructor() {
  const storedUser = localStorage.getItem('user');  //ใช้ localStorage 
  if (storedUser) {
    this.user = JSON.parse(storedUser);
  }
}

  //เก็บข้อมูลผู้ใช้ที่ล็อกอินเข้าระบบไว้ในตัวแปร this.user
setUser(user: DataUser) {
  this.user = user;
  localStorage.setItem('user', JSON.stringify(user)); // เก็บถาวร
}

  // ดึงข้อมูลของผู้ใช้ที่ถูกเก็บไว้
  getUser(): DataUser | null {
    return this.user;
  }

  //ตรวจสอบว่ามีผู้ใช้ล็อกอิน
  isLoggedIn(): boolean {
    return this.user !== null;
  }

  //ออกจากระบบ 
logout() {
  console.log("Logging out...");
  this.user = null;
  localStorage.removeItem('user');
}


}