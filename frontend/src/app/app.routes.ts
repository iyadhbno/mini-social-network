import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { PostsComponent } from './components/posts/posts.component';
import { AuthGuard } from './guards/auth.guard';

export const APP_ROUTES: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'posts', component: PostsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' }
];