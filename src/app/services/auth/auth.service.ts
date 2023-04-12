import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Observable, switchMap, of, catchError, finalize} from 'rxjs';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LoginService } from 'src/app/services/login/login.service';
import { ProgressDialogComponent } from 'src/app/dialog/progress-dialog/progress-dialog.component';
import { NetworkUtil } from 'src/app/util/network-util';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface User {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    user: Observable<User| null | undefined>;
    response: any;
    token!: string;
    userData!: any;
    tokenJsonData!: any;
    userRole!: any;
    userRoleJsonData!: any;

    constructor(public afAuth: AngularFireAuth,
                private afs: AngularFirestore,
                private router: Router,
                public dialog: MatDialog,
                private loginService: LoginService,
                private snackBar: MatSnackBar) {

        this.user = this.afAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    sessionStorage.setItem('user', JSON.stringify(user));
                    return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
                } else {
                    return of(null);
                }
        }));
    }

    async login() {
        this.afAuth
            .signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then((user: { user: any; }) => {
                sessionStorage.setItem('user', JSON.stringify(user.user));
                localStorage.setItem('user',JSON.stringify(user.user));
                this.shareUserDataWithBackend();
    
            })
            .catch((err: { message: any; }) => {
                this.response = err.message;
                console.log('Something went wrong:', err.message);
            });
    }

    async logout() {
        this.afAuth.signOut().then(() => {
            // sessionStorage.removeItem('user');
            // localStorage.removeItem('user');
            localStorage.removeItem('token');
            this.router.navigate(['/']);
        });
    }

    // get isLoggedIn(): boolean {
    //     const user = JSON.parse(sessionStorage.getItem('user')||'{}');
    //     return user !== null;
    // }

    shareUserDataWithBackend() {
        const dialogRef = this.dialog.open(ProgressDialogComponent);
        this.userData = JSON.parse(sessionStorage.getItem('user')|| '{}');

        let jsonData = this.createJSONDataFromUserLoginData(this.userData);
    
        this.loginService.adminUserLogin( jsonData)
        .pipe(
                catchError((err) => {
            return NetworkUtil.handleErrorForAll2(err, this.snackBar);
          }),
          finalize(() => dialogRef.close())
        ).subscribe(
          data => {
            if(data.body.status == 200) {
              this.onSubmitDataSuccessful(data.body);
            } else {
              if(data.body.ui_message != null){
                NetworkUtil.showSnackBar( this.snackBar, data.body.ui_message);
              } else if(data.body.developer_message != null){
                NetworkUtil.showSnackBar(this.snackBar, data.body.developer_message);
              } else {
                NetworkUtil.showSnackBar(this.snackBar, 'Unable to login, please try again');
              }
            }
          }
        );
      }

      createJSONDataFromUserLoginData(value: any) {
        var data = {
            'user_email': value.email,
            'display_name': value.displayName
          };
        return data;  
      }

      onSubmitDataSuccessful(data: any) {
        this.token = data.data.auth_token;
        this.tokenJsonData = {'token':this.token};
        
        this.userRole = data.data.role;
        this.userRoleJsonData = {'userRole': this.userRole};
        localStorage.setItem('userRole', JSON.stringify(this.userRoleJsonData));
        console.log(this.userRole)
        // sessionStorage.setItem('role',this.userRole)

        if (this.token==null){
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          localStorage.removeItem('userRole');
          NetworkUtil.showSnackBar(this.snackBar, 'Your email is not registerted with ApniBus Admin');
          this.router.navigate(['/']);
        } else {
          localStorage.setItem('token', JSON.stringify(this.tokenJsonData));
          if(this.userRole == "editor"){
            this.router.navigate(['/dashboard/listOperators']);
          }
          if(this.userRole == "super_admin"){
            this.router.navigate(['/dashboard/listOperators']);
          }
          if(this.userRole == "support"){
            this.router.navigate(['/dashboard/listTickets']);
          }
          if(this.userRole == "accountant"){
            this.router.navigate(['/dashboard/listOperatorInvoice']);
          }
          if(this.userRole == "accountant_and_editor"){
            this.router.navigate(['/dashboard/listOperators']);
          }
          if(this.userRole == "owner"){
            this.router.navigate(['/dashboard/listOperators']);
          }
          
        }
      }

}

