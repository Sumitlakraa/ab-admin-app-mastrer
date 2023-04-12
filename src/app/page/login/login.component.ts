import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  userData!: any;
  displayName!: any;
  userRole!: any;

  constructor(private router: Router, private readonly authService: AuthService) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('user')|| '{}');
    this.displayName = this.userData.displayName;


    let data = JSON.parse(localStorage.getItem('userRole') || '{}');
    this.userRole = data.userRole;
    console.log(this.userRole)
  }

  onSignInWithGoogleClick() {

    let data = JSON.parse(localStorage.getItem('token') || '{}');
    var token = data.token;

    if(token != null){

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

    }else{
      this.authService.login();    
    }
    
      
  }

}
