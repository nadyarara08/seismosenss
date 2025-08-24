/**
 * User interface representing a user in the application
 */
export interface User {
  /** Unique identifier for the user */
  uid: string;
  
  /** User's email address */
  email: string | null;
  
  /** User's display name */
  displayName: string | null;
  
  /** URL to the user's profile photo */
  photoURL: string | null;
  
  /** Whether the user's email is verified */
  emailVerified: boolean;
  
  /** User's role in the application */
  role?: 'user' | 'admin';
  
  /** Timestamp of the user's last login */
  lastLogin?: Date;
  
  /** Timestamp of when the user account was created */
  createdAt?: Date;
  
  /** Additional user metadata */
  metadata?: {
    [key: string]: any;
  };
}
