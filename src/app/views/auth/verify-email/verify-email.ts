import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './verify-email.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VerifyEmail implements OnInit {
  verifyForm: FormGroup;
  isLoading = false;
  error = '';
  success = '';
  email = '';
  isResending = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    // Get email from query params
    this.email = this.route.snapshot.queryParams['email'] || '';

    if (!this.email) {
      this.error = 'Email address is required';
    }
  }

  onSubmit() {
    if (this.verifyForm.valid && this.email) {
      this.isLoading = true;
      this.error = '';
      this.success = '';

      const code = this.verifyForm.value.code;

      this.authService.verifyEmail(this.email, code).subscribe({
        next: (user) => {
          this.isLoading = false;
          this.success = 'Email verified successfully! Redirecting to dashboard...';

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/contacts']);
          }, 2000);
        },
        error: (error) => {
          console.error('Verification error:', error);
          this.error = typeof error === 'string' ? error : (error?.message || error?.toString() || 'Verification failed. Please try again.');
          this.isLoading = false;
        }
      });
    } else {
      this.verifyForm.get('code')?.markAsTouched();
      if (!this.email) {
        this.error = 'Email address is required';
      }
    }
  }

  resendCode() {
    if (!this.email) {
      this.error = 'Email address is required';
      return;
    }

    this.isResending = true;
    this.error = '';
    this.success = '';

    this.authService.resendVerificationCode(this.email).subscribe({
      next: (message) => {
        this.isResending = false;
        this.success = message || 'Verification code sent successfully!';
      },
      error: (error) => {
        console.error('Resend error:', error);
        this.error = typeof error === 'string' ? error : (error?.message || error?.toString() || 'Failed to resend code. Please try again.');
        this.isResending = false;
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.verifyForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) return 'Verification code is required';
      if (field.errors?.['minlength']) return 'Code must be 6 characters';
      if (field.errors?.['maxlength']) return 'Code must be 6 characters';
    }
    return null;
  }
}
