import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLoginMode = true;
  email = '';
  password = '';
  username = '';

  constructor(public authService: AuthService, private router: Router) { }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
    if (this.isLoginMode) {
      this.authService.login({ email: this.email, password: this.password }).subscribe(response => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/posts']);
      });
    } else {
      this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe(response => {
        this.isLoginMode = true;
        this.authService.login({ email: this.email, password: this.password }).subscribe(response => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/posts']);
        });
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}