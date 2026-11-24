import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styles: `
    .topbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(13, 14, 17, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
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
    .logo-mark {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--accent);
      display: grid;
      place-items: center;
      font-size: 13px;
      color: #fff;
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
    nav a.ativo { color: var(--text-primary); background: var(--surface-2); }
    @media (max-width: 720px) {
      .topbar-inner { gap: 12px; padding: 0 12px; overflow-x: auto; }
      .logo span:last-child { display: none; }
      .novo { display: none; }
    }
  `,
})
export class AppComponent {}
