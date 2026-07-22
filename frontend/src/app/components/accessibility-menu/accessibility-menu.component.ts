import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService } from '../../services/accessibility.service';

@Component({
  selector: 'app-accessibility-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="accessibility-widget">
      <!-- Botón Flotante Elegante y Armónico -->
      <button 
        type="button" 
        class="accessibility-toggle-btn" 
        (click)="toggleOpen()" 
        aria-label="Herramientas de Accesibilidad"
        title="Herramientas de Accesibilidad"
        [attr.aria-expanded]="isOpen">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="m4.93 4.93 4.24 4.24"/>
          <path d="m14.83 9.17 4.24-4.24"/>
          <path d="m14.83 14.83 4.24 4.24"/>
          <path d="m9.17 14.83-4.24 4.24"/>
          <circle cx="12" cy="12" r="4"/>
        </svg>
        <span class="accessibility-badge" *ngIf="accessibilityService.settings.isHighContrast || accessibilityService.settings.isGrayscale || accessibilityService.settings.fontSize !== 'normal' || accessibilityService.settings.isUnderlinedLinks || accessibilityService.settings.isTextSpacing || accessibilityService.settings.isEnhancedFocus"></span>
      </button>

      <!-- Tarjeta de Ajustes con diseño unificado -->
      <div class="accessibility-panel" *ngIf="isOpen" role="dialog" aria-label="Ajustes de accesibilidad">
        <div class="acc-header">
          <h3>Accesibilidad Web</h3>
          <button type="button" class="acc-close-btn" (click)="toggleOpen()" aria-label="Cerrar menú">&times;</button>
        </div>

        <div class="acc-body">
          <!-- 1. Esquema de Contraste -->
          <div class="acc-group">
            <label class="acc-label">Modo de Contraste</label>
            <div class="acc-btn-grid cols-3">
              <button type="button" [class.active]="!accessibilityService.settings.isHighContrast && !accessibilityService.settings.isGrayscale" (click)="accessibilityService.setContrast('normal')">Estándar</button>
              <button type="button" [class.active]="accessibilityService.settings.isHighContrast" (click)="accessibilityService.setContrast('high')">Alto Contraste</button>
              <button type="button" [class.active]="accessibilityService.settings.isGrayscale" (click)="accessibilityService.setContrast('gray')">Monocromo</button>
            </div>
          </div>

          <!-- 2. Tamaño de Texto -->
          <div class="acc-group">
            <label class="acc-label">Tamaño de Texto</label>
            <div class="acc-btn-grid cols-3">
              <button type="button" [class.active]="accessibilityService.settings.fontSize === 'normal'" (click)="accessibilityService.setFontSize('normal')">Normal (A)</button>
              <button type="button" [class.active]="accessibilityService.settings.fontSize === 'medium'" (click)="accessibilityService.setFontSize('medium')">Mediano (A+)</button>
              <button type="button" [class.active]="accessibilityService.settings.fontSize === 'large'" (click)="accessibilityService.setFontSize('large')">Grande (A++)</button>
            </div>
          </div>

          <!-- 3. Ajustes Visuales Adicionales -->
          <div class="acc-group">
            <label class="acc-label">Ajustes Visuales Especiales</label>
            <div class="acc-switches">
              <button type="button" class="acc-switch-card" [class.is-on]="accessibilityService.settings.isUnderlinedLinks" (click)="accessibilityService.toggleUnderlinedLinks()">
                <span>Subrayar Enlaces</span>
                <div class="switch-pill">
                  <span class="pill-dot"></span>
                  <span class="pill-text">{{ accessibilityService.settings.isUnderlinedLinks ? 'Activado' : 'Desactivado' }}</span>
                </div>
              </button>

              <button type="button" class="acc-switch-card" [class.is-on]="accessibilityService.settings.isTextSpacing" (click)="accessibilityService.toggleTextSpacing()">
                <span>Espaciado de Texto</span>
                <div class="switch-pill">
                  <span class="pill-dot"></span>
                  <span class="pill-text">{{ accessibilityService.settings.isTextSpacing ? 'Activado' : 'Desactivado' }}</span>
                </div>
              </button>

              <button type="button" class="acc-switch-card" [class.is-on]="accessibilityService.settings.isEnhancedFocus" (click)="accessibilityService.toggleEnhancedFocus()">
                <span>Resaltar Foco Teclado</span>
                <div class="switch-pill">
                  <span class="pill-dot"></span>
                  <span class="pill-text">{{ accessibilityService.settings.isEnhancedFocus ? 'Activado' : 'Desactivado' }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="acc-footer">
          <button type="button" class="acc-reset-btn" (click)="accessibilityService.resetAccessibility()">
            Restablecer Ajustes
          </button>
        </div>
      </div>
    </div>
  `
})
export class AccessibilityMenuComponent {
  isOpen = false;

  constructor(public accessibilityService: AccessibilityService) {}

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
