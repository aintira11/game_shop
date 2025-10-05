import { Injectable } from '@angular/core';
import { DataUser } from '../config/model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: DataUser | null = null;
   
  constructor() {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser); // โหลดข้อมูลกลับมา
    }
  }

  //เก็บข้อมูลผู้ใช้ที่ล็อกอินเข้าระบบไว้ในตัวแปร this.user
  setUser(user: DataUser) {
    this.user = user;
     sessionStorage.setItem('user', JSON.stringify(user));
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
    this.user = null;
    sessionStorage.removeItem('user');
  }
}