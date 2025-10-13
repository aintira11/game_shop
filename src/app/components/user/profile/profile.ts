import { Component,OnInit  } from '@angular/core';
import{Header} from '../../header/header'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { DataUser } from '../../../config/model';
import { Constants } from '../../../config/constants';
import { CloudinaryService } from '../../../service/cloudinary.service';
import { adminHeader } from '../../admin/adminHeader/header';

@Component({
  selector: 'app-profile',
  imports: [Header, CommonModule, FormsModule, adminHeader],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  datauser: DataUser | null = null;
  profileSrc: string = 'assets/image/cat%204.png';
  name: string = '';
  email: string = '';
  password: string = '';
  userId: number | null = null;
  selectedFile: File | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Password Modal
  showPasswordModal: boolean = false;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordErrorMessage: string = '';
  isChangingPassword: boolean = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cloudinary: CloudinaryService,
    private constants: Constants,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    // โหลดข้อมูลจาก AuthService
    this.datauser = this.authService.getUser();
    
    if (this.datauser) {
      this.userId = this.datauser.user_id;
      this.name = this.datauser.username || '';
      this.email = this.datauser.email || '';
      
      // ตั้งค่ารูปโปรไฟล์
      if (this.datauser.profile) {
        this.profileSrc = this.datauser.profile;
      }
    } else {
      // ถ้าไม่มีข้อมูล user ให้ redirect ไปหน้า login
      this.router.navigate(['/login']);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    this.selectedFile = file;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.profileSrc = result;
    };
    reader.readAsDataURL(file);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }

  async saveEdit(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.datauser) {
      this.errorMessage = 'ไม่พบข้อมูลผู้ใช้';
      return;
    }

    if (!this.name || !this.email) {
      this.errorMessage = 'กรุณากรอกชื่อและอีเมล';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      return;
    }

       // Validate password if provided
    // if (this.password && this.password.length < 6) {
    //   this.errorMessage = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    //   return;
    // }

    this.isLoading = true;

    try {
      let profileUrl: string = this.datauser.profile || ''; // ใช้รูปเดิมเป็นค่าเริ่มต้น

      // Upload photo ถ้ามีการเลือกไฟล์ใหม่
      if (this.selectedFile) {
        try {
          const uploadResult: any = await this.cloudinary.uploadImage(this.selectedFile).toPromise();
          profileUrl = uploadResult.secure_url;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          this.errorMessage = 'ไม่สามารถอัพโหลดรูปภาพได้';
          this.isLoading = false;
          return;
        }
      }

      const updateData: any = {
        username: this.name.trim(),
        email: this.email.trim().toLowerCase(),
        profile: profileUrl // ใช้รูปเดิมถ้าไม่ได้อัปโหลดใหม่
      };

      if (this.password) {
        updateData.password = this.password;
      }

      const apiUrl = `${this.constants.API_ENDPOINT}/update/${this.userId}`;
      const response: any = await this.http.put(apiUrl, updateData).toPromise();

      if (!this.datauser) return;

      const updatedUser: DataUser = {
        user_id: this.datauser.user_id,
        username: this.name,
        email: this.email,
        profile: profileUrl,
        wallet: this.datauser.wallet || 0,
        user_type: this.datauser.user_type || 'normal'
      };

      this.authService.setUser(updatedUser);

      this.successMessage = 'บันทึกข้อมูลสำเร็จ!';
      this.password = '';

      this.loadUserProfile();

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

    } catch (error: any) {
      console.error('Save error:', error);

      if (error.status === 400) {
        this.errorMessage = error.error?.message || 'ข้อมูลไม่ถูกต้อง';
      } else if (error.status === 404) {
        this.errorMessage = 'ไม่พบข้อมูลผู้ใช้';
      } else if (error.status === 500) {
        this.errorMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง';
      } else {
        this.errorMessage = error.error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      }
    } finally {
      this.isLoading = false;
    }
}


// Password Modal Methods
  openPasswordModal(): void {
    this.showPasswordModal = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordErrorMessage = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordErrorMessage = '';
  }

  async changePassword(): Promise<void> {
    this.passwordErrorMessage = '';

    // Validate inputs
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordErrorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordErrorMessage = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrorMessage = 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน';
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.passwordErrorMessage = 'รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม';
      return;
    }

    if (!this.datauser) {
      this.passwordErrorMessage = 'ไม่พบข้อมูลผู้ใช้';
      return;
    }

    this.isChangingPassword = true;

    try {
      // Call change password API
      const apiUrl = `${this.constants.API_ENDPOINT}/users/${this.userId}/change-password`;
      
      await this.http.put(apiUrl, {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      }).toPromise();

      // Success
      this.closePasswordModal();
      this.successMessage = 'เปลี่ยนรหัสผ่านสำเร็จ!';

      // Auto hide success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

    } catch (error: any) {
      console.error('Change password error:', error);
      
      if (error.status === 400) {
        this.passwordErrorMessage = error.error?.message || 'รหัสผ่านเดิมไม่ถูกต้อง';
      } else if (error.status === 404) {
        this.passwordErrorMessage = 'ไม่พบข้อมูลผู้ใช้';
      } else if (error.status === 500) {
        this.passwordErrorMessage = 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง';
      } else {
        this.passwordErrorMessage = error.error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      }
    } finally {
      this.isChangingPassword = false;
    }
  }

  goToWallet(): void {
    this.router.navigate(['/wallet']);
  }

  goToGameHistory(): void {
    this.router.navigate(['/wallet']);
  }

  goToTopUpHistory(): void {
    this.router.navigate(['/topup-history']);
  }
}