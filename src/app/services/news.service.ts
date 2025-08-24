import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export interface News {
  id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  category?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  constructor(private afs: AngularFirestore) {}

  // Get all published news
  getNews(): Observable<News[]> {
    return this.afs.collection<News>('news', ref => 
      ref.where('published', '==', true)
         .orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  // Get all news (admin only)
  getAllNews(): Observable<News[]> {
    return this.afs.collection<News>('news', ref => 
      ref.orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  // Get single news item
  getNewsById(id: string): Observable<News | undefined> {
    return this.afs.doc<News>(`news/${id}`).valueChanges();
  }

  // Add new news
  async addNews(news: Omit<News, 'id' | 'createdAt' | 'updatedAt'>) {
    const timestamp = new Date();
    const newsData: News = {
      ...news,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    const docRef = await this.afs.collection('news').add(newsData);
    return docRef.id;
  }

  // Update news
  async updateNews(id: string, news: Partial<News>) {
    const updateData = {
      ...news,
      updatedAt: new Date()
    };
    
    return this.afs.doc(`news/${id}`).update(updateData);
  }

  // Delete news
  deleteNews(id: string) {
    return this.afs.doc(`news/${id}`).delete();
  }

  // Get news by category
  getNewsByCategory(category: string): Observable<News[]> {
    return this.afs.collection<News>('news', ref => 
      ref.where('category', '==', category)
         .where('published', '==', true)
         .orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  // Get featured news
  getFeaturedNews(limit: number = 3): Observable<News[]> {
    return this.afs.collection<News>('news', ref => 
      ref.where('published', '==', true)
         .orderBy('createdAt', 'desc')
         .limit(limit)
    ).valueChanges({ idField: 'id' });
  }
}
