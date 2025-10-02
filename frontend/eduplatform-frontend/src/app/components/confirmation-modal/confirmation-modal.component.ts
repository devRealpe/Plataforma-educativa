import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Icon -->
        <div class="modal-icon" [ngClass]="type">
          <svg *ngIf="type === 'danger'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <svg *ngIf="type === 'warning'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg *ngIf="type === 'info'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <h3 class="modal-title">{{ title }}</h3>
          <p class="modal-message">{{ message }}</p>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="modal-btn cancel-btn" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button class="modal-btn confirm-btn" [ngClass]="type" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;

      &.danger {
        background: #fef2f2;
        color: #dc2626;
      }

      &.warning {
        background: #fef3c7;
        color: #f59e0b;
      }

      &.info {
        background: #eff6ff;
        color: #2563eb;
      }
    }

    .modal-content {
      text-align: center;
      margin-bottom: 2rem;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.75rem;
    }

    .modal-message {
      font-size: 0.95rem;
      color: #6b7280;
      line-height: 1.6;
      white-space: pre-line;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
    }

    .modal-btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
      }
    }

    .cancel-btn {
      background: #f3f4f6;
      color: #374151;

      &:hover {
        background: #e5e7eb;
      }
    }

    .confirm-btn {
      color: white;

      &.danger {
        background: #dc2626;

        &:hover {
          background: #b91c1c;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
      }

      &.warning {
        background: #f59e0b;

        &:hover {
          background: #d97706;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
      }

      &.info {
        background: #2563eb;

        &:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
      }
    }

    @media (max-width: 480px) {
      .modal-container {
        padding: 1.5rem;
      }

      .modal-actions {
        flex-direction: column-reverse;
      }

      .modal-btn {
        width: 100%;
      }
    }
  `]
})
export class ConfirmationModalComponent {
  @Input() title: string = '¿Estás seguro?';
  @Input() message: string = '';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'warning';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}