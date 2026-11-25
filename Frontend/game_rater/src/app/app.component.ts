import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { VoidLogoComponent } from './shared/components/void-logo/void-logo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, VoidLogoComponent],
  templateUrl: './app.component.html',
  styles: `
    .topbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(7, 7, 11, 0.72);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 0 rgba(var(--accent-rgb), 0.08);
    }
    .topbar-inner {
      max-width: var(--page-max);
      margin: 0 auto;
      padding: 0 24px;
      height: 60px;
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .logo {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-texto { letter-spacing: -0.02em; }
    .logo-texto .void {
      background: linear-gradient(90deg, #e7deff, var(--accent-claro));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    nav {
      display: flex;
      gap: 4px;
      flex: 1;
    }
    nav a {
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 14px;
      transition: color 0.15s, background 0.15s;
    }
    nav a:hover { color: var(--text-primary); background: var(--surface-2); }
    nav a.ativo { color: var(--text-primary); background: var(--surface-2); box-shadow: inset 0 -2px 0 var(--accent); }
    @media (max-width: 720px) {
      .topbar-inner { gap: 12px; padding: 0 12px; overflow-x: auto; }
      .logo-texto { display: none; }
      .novo { display: none; }
    }
  `,
})
export class AppComponent {}
