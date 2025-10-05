import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CloudinaryService } from '../../service/cloudinary.service';
import { Constants } from '../../config/constants';

@Component({
  selector: 'app-register',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  avatarSrc: string = 'assets/image/cat%204.png';
  imageUrl: string | null = null;
  
  // Form data
  username: string = '';
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private cloudinary: CloudinaryService,
    private http: HttpClient,
    private constants: Constants
  ) {}

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    this.selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.avatarSrc = result;
    };
    reader.readAsDataURL(file);
  }

  async register(): Promise<void> {
    // Reset error message
    this.errorMessage = '';
    
    // Validate form
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      return;
    }

    // Validate password length
    if (this.password.length < 6) {
      this.errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      return;
    }

    this.isLoading = true;

    try {
      let profileUrl: string | null = null;

      // Upload avatar to Cloudinary if selected
      if (this.selectedFile) {
        try {
          const uploadResult: any = await this.cloudinary.uploadImage(this.selectedFile).toPromise();
          profileUrl = uploadResult.secure_url;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue without profile image
        }
      }

      // Call register API using Constants
      const apiUrl = `${this.constants.API_ENDPOINT}/register`;
      
      const response: any = await this.http.post(apiUrl, {
        username: this.username.trim(),
        email: this.email.trim().toLowerCase(),
        password: this.password,
        profile: profileUrl,
        user_type: 'normal'
      }).toPromise();

      // Registration successful
      console.log('Registration successful:', response);
      alert('สมัครสมาชิกสำเร็จ!');
      this.router.navigate(['/']);

    } catch (error: any) {
      console.error('Register error:', error);
      
      if (error.status === 400) {
        this.errorMessage = error.error?.message || 'ข้อมูลไม่ถูกต้อง';
      } else if (error.status === 500) {
        this.errorMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง';
      } else if (error.status === 0) {
        this.errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่';
      } else {
        this.errorMessage = error.error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      }
    } finally {
      this.isLoading = false;
    }
  }

  login(): void {
    this.router.navigate(['/']);
  }
}