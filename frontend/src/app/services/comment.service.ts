import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = 'http://localhost:5000/api/comments';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  }

  addCommentToPost(postId: string, comment: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${postId}`, comment, { headers: this.getHeaders() });
  }

  getPostComments(postId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${postId}`, { headers: this.getHeaders() });
  }

  removeCommentFromPost(postId: string, commentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${postId}/${commentId}`, { headers: this.getHeaders() });
  }

  likeComment(commentId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${commentId}/like`, {}, { headers: this.getHeaders() });
  }
}