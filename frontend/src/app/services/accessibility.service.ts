import { Injectable } from '@angular/core';
import { AccessibilitySettings } from '../models/factura.model';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private STORAGE_KEY = 'dian_accessibility_settings';

  settings: AccessibilitySettings = {
    isHighContrast: false,
    isGrayscale: false,
    fontSize: 'normal',
    isUnderlinedLinks: false,
    isTextSpacing: false,
    isEnhancedFocus: false
  };

  constructor() {
    this.loadSettings();
  }

  setContrast(mode: 'normal' | 'high' | 'gray') {
    if (mode === 'high') {
      this.settings.isHighContrast = true;
      this.settings.isGrayscale = false;
    } else if (mode === 'gray') {
      this.settings.isHighContrast = false;
      this.settings.isGrayscale = true;
    } else {
      this.settings.isHighContrast = false;
      this.settings.isGrayscale = false;
    }
    this.applySettings();
  }

  setFontSize(size: 'normal' | 'medium' | 'large') {
    this.settings.fontSize = size;
    this.applySettings();
  }

  toggleUnderlinedLinks() {
    this.settings.isUnderlinedLinks = !this.settings.isUnderlinedLinks;
    this.applySettings();
  }

  toggleTextSpacing() {
    this.settings.isTextSpacing = !this.settings.isTextSpacing;
    this.applySettings();
  }

  toggleEnhancedFocus() {
    this.settings.isEnhancedFocus = !this.settings.isEnhancedFocus;
    this.applySettings();
  }

  resetAccessibility() {
    this.settings = {
      isHighContrast: false,
      isGrayscale: false,
      fontSize: 'normal',
      isUnderlinedLinks: false,
      isTextSpacing: false,
      isEnhancedFocus: false
    };
    this.applySettings();
  }

  applySettings() {
    const body = document.body;

    if (this.settings.isHighContrast) {
      body.classList.add('accessibility-high-contrast');
      body.classList.remove('accessibility-grayscale');
    } else if (this.settings.isGrayscale) {
      body.classList.add('accessibility-grayscale');
      body.classList.remove('accessibility-high-contrast');
    } else {
      body.classList.remove('accessibility-high-contrast');
      body.classList.remove('accessibility-grayscale');
    }

    body.classList.remove('font-size-medium', 'font-size-large');
    if (this.settings.fontSize === 'medium') {
      body.classList.add('font-size-medium');
    } else if (this.settings.fontSize === 'large') {
      body.classList.add('font-size-large');
    }

    if (this.settings.isUnderlinedLinks) {
      body.classList.add('underlined-links');
    } else {
      body.classList.remove('underlined-links');
    }

    if (this.settings.isTextSpacing) {
      body.classList.add('text-spacing');
    } else {
      body.classList.remove('text-spacing');
    }

    if (this.settings.isEnhancedFocus) {
      body.classList.add('enhanced-focus');
    } else {
      body.classList.remove('enhanced-focus');
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
        this.applySettings();
      }
    } catch (e) {
      console.error('Error al cargar ajustes de accesibilidad', e);
    }
  }
}
