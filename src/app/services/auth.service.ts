import { Injectable } from '@angular/core';
import { Auth, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  role?: 'user' | 'admin';
  lastLogin?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const userDocRef = doc(this.firestore, `users/${user.uid}`);
        docData(userDocRef).subscribe((userData: any) => {
          this.userSubject.next(userData as User);
        });
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    if (result.user) {
      await this.updateUserData(result.user);
    }
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName });
      await this.updateUserData(result.user);
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/auth/login']);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    await updateDoc(userDocRef, { role });
  }

  private async updateUserData(user: FirebaseUser): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      role: 'user',
      lastLogin: new Date()
    };
    await setDoc(userDocRef, data, { merge: true });
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }
}