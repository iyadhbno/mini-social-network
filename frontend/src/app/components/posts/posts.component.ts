import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommentsComponent } from '../comments/comments.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    CommentsComponent,
    HeaderComponent
  ],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  newPostContent = '';
  currentPage = 1;
  totalPages = 1;
  limit = 10;

  constructor(private postService: PostService, public authService: AuthService) { }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getAllPosts(this.currentPage, this.limit).subscribe(response => {
      this.posts = response.posts;
      this.currentPage = response.currentPage;
      this.totalPages = response.totalPages;
      console.log('Loaded posts:', this.posts);
    }, error => {
      console.error('Error loading posts:', error);
    });
  }

  loadNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPosts();
    }
  }

  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPosts();
    }
  }

  createPost() {
    if (this.newPostContent.trim()) {
      this.postService.createPost({ content: this.newPostContent }).subscribe(response => {
        this.posts.unshift(response);
        this.newPostContent = '';
      }, error => {
        console.error('Error creating post:', error);
      });
    }
  }

  likePost(postId: string) {
    this.postService.likePost(postId).subscribe(response => {
      const post = this.posts.find(p => p._id === postId);
      if (post) {
        post.likes = response.likes;
      }
    }, error => {
      console.error('Error liking post:', error);
    });
  }

  deletePost(postId: string) {
    this.postService.deletePost(postId).subscribe(response => {
      this.posts = this.posts.filter(post => post._id !== postId);
    }, error => {
      console.error('Error deleting post:', error);
    });
  }

  logout() {
    this.authService.logout();
    window.location.href = '/auth';
  }
}