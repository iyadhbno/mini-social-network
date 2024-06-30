import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private baseUrl = 'http://localhost:5000/api/posts';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  }

  createPost(post: any): Observable<any> {
    return this.http.post(this.baseUrl, post, { headers: this.getHeaders() });
  }

  getAllPosts(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/paginated?page=${page}&limit=${limit}`, { headers: this.getHeaders() });
  }

  likePost(postId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${postId}/like`, {}, { headers: this.getHeaders() });
  }

  deletePost(postId: string): Observable<any> { 
    return this.http.delete(`${this.baseUrl}/${postId}`, { headers: this.getHeaders() });
  }
}