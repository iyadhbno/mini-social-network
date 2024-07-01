import { Component, Input, OnInit } from '@angular/core';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatCardModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() postId: string = "";
  comments: any[] = [];
  newCommentContent: string = '';

  constructor(private commentService: CommentService, public authService: AuthService) { }

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.commentService.getPostComments(this.postId).subscribe(response => {
      this.comments = response;
    });
  }

  addComment() {
    const content = this.newCommentContent.trim();
    if (content) {
      this.commentService.addCommentToPost(this.postId, { content }).subscribe(response => {
        this.comments.unshift(response);
        this.newCommentContent = '';
      });
    }
  }

  removeComment(commentId: string) {
    this.commentService.removeCommentFromPost(this.postId, commentId).subscribe(response => {
      this.comments = this.comments.filter(comment => comment._id !== commentId);
    });
  }

  likeComment(commentId: string) {
    this.commentService.likeComment(commentId).subscribe(response => {
      const comment = this.comments.find(c => c._id === commentId);
      if (comment) {
        comment.likes = response.likes;
      }
    });
  }
}