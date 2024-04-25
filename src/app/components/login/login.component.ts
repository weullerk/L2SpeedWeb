import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {FormControl, FormGroup} from "@angular/forms";
import {OperationResponse} from "../../models/OperationResponse";
import {environment} from "../../../environments/environment.prod";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthenticationSuccess} from "../../models/AuthenticationSuccess";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @Output() newLogin: EventEmitter<AuthenticationSuccess> = new EventEmitter<AuthenticationSuccess>;

  loginForm = new FormGroup({
    login: new FormControl(''),
    password: new FormControl(''),
  });

  loginMessage = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  login() {
    const data = this.loginForm.value;

    let formData = new  FormData();
    formData.append('login', data.login as string);
    formData.append('password', data.password as string);

    let headers = {
    };

    let request = this.http.post<AuthenticationSuccess>(environment.api + '/login', formData, {headers: new HttpHeaders(headers)});

    request.subscribe((response: AuthenticationSuccess) => {
      if ('access_token' in response) {
      this.loginMessage = 'Login realizado com sucesso!';
        this.loginForm.reset();
        this.newLogin.emit(response);
      }
    }, (err:any) => {
      if (err.error) {
        this.loginMessage = err.error;
      }
    });
  }

}
