import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { Constants } from '../../config/constants';
import { DataUser } from '../../config/model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [RouterLink,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  dataLogin: DataUser[] = [];

  avatarSrc: string = 'assets/image/cat%204.png';

  constructor(private router: Router,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private constants: Constants,
    private snackBar: MatSnackBar,){

       // สร้างฟอร์มจาก FormBuilder
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });

  }

  // TypeScript Component Code
async login(): Promise<void> {
  const url = this.constants.API_ENDPOINT + '/login';
  
  if (this.loginForm.invalid) {
    this.showSnackBar('กรุณากรอก อีเมล์ และ รหัสผ่านให้ครบถ้วน');
    return;
  }

  try {
    const formData = this.loginForm.value;
    const data = await lastValueFrom(
      this.http.post<DataUser[]>(url, formData)
    );

    this.dataLogin = data as DataUser[];
    console.log(this.dataLogin);

    if (this.dataLogin.length === 1) {
      const user = this.dataLogin[0];
      this.authService.setUser(user);
      if (user.user_type === 'admin') {
        this.router.navigate(['admin']);
      } else {
        this.router.navigate(['home']);
      }
    } else {
      this.showSnackBar('ไม่พบข้อมูลผู้ใช้');
    }
  } catch (error: any) {
    // console.error('Login Failed:', error);
    if (error.status === 401) {
      this.showSnackBar('อีเมล์และรหัสผ่านไม่ตรงกัน');
    } else if (error.status === 404) {
      // console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้:", error);
      this.showSnackBar('เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง');
    }
  }
}

showSnackBar(message: string) {
  this.snackBar.open(message, 'ปิด', {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  });
}


  home(){
    this.router.navigate(['home']);
  }
}
