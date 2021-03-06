import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from './user';
import swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any; // Save logged in user data

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.user);
      }
    });
  }

  // Sign in with email/password
  async SignIn(email: string, password: string) {
    await this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.SetUserData(result.user);
      })
      .catch((error) => {
        swal.fire('Error', 'Usuario o contraseña incorrecto.', 'warning');
      })
      .then(() => {
        this.router.navigate(['dashboard']);
      });
  }

  // Reset Forggot password
  async ForgotPassword(passwordResetEmail: string) {
    return await this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        swal.fire(
          'Te hemos enviado un correo',
          'REvisa tu bandeja de entrada y sigue las instrucciones para recuperar tu cuenta.',
          'success'
        );
      })
      .catch((error) => {
        swal.fire('Error', 'El correo no se encuentra registrado.', 'warning');
      });
  }
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  // Sign out
  async SignOut() {
    return await this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage?.user);
    return user !== null ? true : false;
  }
}
