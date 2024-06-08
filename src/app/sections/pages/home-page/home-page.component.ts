import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../../environments/environment.prod";
import {OperationResponse} from "../../../models/OperationResponse";
import {Pvp} from "../../../models/Pvp";
import {Pk} from "../../../models/Pk";
import {Castle} from "../../../models/Castle";
import {Hero} from "../../../models/Hero";
import {Olympiad} from "../../../models/Olympiad";
import {Clan} from "../../../models/Clan";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {map, Observable} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {LoginComponent} from "../../../components/login/login.component";
import {AuthenticationSuccess} from "../../../models/AuthenticationSuccess";
import {AuthenticationData} from "../../../models/AuthenticationData";
import {CheckToken} from "../../../models/CheckToken";
import {Characters} from "../../../models/Characters";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  createAccountForm = new FormGroup({
    login: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    repeatPassword: new FormControl(''),
  });

  createAccountMessage: OperationResponse | null = null;

  selectCharVoteForm = new FormGroup({
    char_name: new FormControl('', Validators.required)
  });

  voteMessage: string | null = null;

  pvps: Pvp[] | null = null;
  pks: Pk[] | null = null;
  clans: Clan[] | null = null;
  olympiads: Olympiad[] | null = null;
  heroes: Hero[] | null = null;
  castles: Castle[] | null = null;

  characters: Characters[] | null = null;

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              public dialog: MatDialog) { }

  accountScreen:string = '';

  authToken: string | null = null;
  login: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const allowedScreens = [
        'change_password',
        'update_password',
        'recover_password',
        'new_password',
      ];
      if ('account' in params) {
        if (allowedScreens.includes(params['account'])) {
          this.accountScreen = params['account'];
        } else {
          this.accountScreen = '';
        }
      }
    });

    const accessToken: string | null = localStorage.getItem('access_token');
    const login: string | null = localStorage.getItem('login');
    if (accessToken && login) {
      this.checkAccessToken(accessToken).subscribe((success) => {
        this.authToken = accessToken;
        this.login = login;
        this.listCharacters(accessToken).subscribe((data: Characters[]) => {
          this.characters = data;
        });

      }, error => {
        this.authToken = null;
        this.login = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('login');
      });
    }

    this.rankings();
    this.serverStatus();
  }

  createAccount() {
    let data = this.createAccountForm.value;

    let formData = new  FormData();
    formData.append('login', data.login as string);
    formData.append('email', data.email as string);
    formData.append('password', data.password as string);
    formData.append('repeat-password', data.repeatPassword as string);

    let headers = {
    };

    let request = this.http.post<OperationResponse>(environment.api + '/account/create', formData, {headers: new HttpHeaders(headers)});

    request.subscribe((response: OperationResponse) => {
      this.createAccountMessage = response;
      if (response.status == 'success') {
        this.createAccountForm.reset();
      }
    }, (err) => {
      if (err.error) {
        this.createAccountMessage = err.error;
      }
    });
  }

  rankings() {
    let pvp = this.http.get<Pvp[]>(environment.api + '/rankings/pvps');
    pvp.subscribe((response: Pvp[]) => {
      this.pvps = response;
    });
    let pk = this.http.get<Pk[]>(environment.api + '/rankings/pks');
    pk.subscribe((response: Pk[]) => {
      this.pks = response;
    });
    let clan = this.http.get<Clan[]>(environment.api + '/rankings/clans');
    clan.subscribe((response: Clan[]) => {
      this.clans = response;
    });
    let olympiad = this.http.get<Olympiad[]>(environment.api + '/rankings/olympiads');
    olympiad.subscribe((response: Olympiad[]) => {
      this.olympiads = response;
    });
    let hero = this.http.get<Hero[]>(environment.api + '/rankings/heroes');
    hero.subscribe((response: Hero[]) => {
      this.heroes = response;
    });
    let castle = this.http.get<Castle[]>(environment.api + '/castles');
    castle.subscribe((response: Castle[]) => {
      this.castles = response;
    });
  }

  serverStatus() {
    let castle = this.http.get<string>(environment.api + '/server/users-online');
    castle.subscribe((response: string) => {
      const onlineCount: HTMLElement | null = document.getElementById('online_count');
      if (onlineCount) {
        onlineCount.innerText = response;
      }
    });
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginComponent);
    dialogRef.componentInstance.newLogin.subscribe((authData: AuthenticationSuccess) => {
      this.authToken = authData.access_token;
      this.login = authData.login;

      localStorage.setItem('access_token', authData.access_token);
      localStorage.setItem('login', authData.login);

      this.listCharacters(authData.access_token).subscribe((data: Characters[]) => {
        this.characters = data;
      });

      dialogRef.close();
    });
  }

  listCharacters(accessToken: string) {
    let headers = {
      'Authorization': 'Bearer ' + accessToken
    };

    return this.http.get<Characters[]>(environment.api + '/account/characters', {headers: new HttpHeaders(headers)});

  }

  checkAccessToken(token: string) {
    let headers = {
      'Authorization': 'Bearer ' + token
    };

    return this.http.post<CheckToken>(environment.api + '/check-access', {}, {headers: new HttpHeaders(headers)});
  }

  validarVoteL2jBrasil() {
    if (this.selectCharVoteForm.value.char_name != '') {
      let data = this.selectCharVoteForm.value;

      let formData = new  FormData();
      formData.append('char_name', data.char_name as string);

      let headers = {
        'Authorization': 'Bearer ' + this.authToken
      };

      let request = this.http.post<OperationResponse>(environment.api + '/vote/l2jbrasil', formData, {headers: new HttpHeaders(headers)});

      request.subscribe((response: OperationResponse) => {
        this.voteMessage = "[L2jBrasil] " + response.message;
      });
    } else {
      this.voteMessage = '[L2jBrasil] Selecione um char para receber a recompensa!';
    }
  }

  validarVoteTop100Arena() {
    if (this.selectCharVoteForm.value.char_name != '') {
      let data = this.selectCharVoteForm.value;

      let formData = new  FormData();
      formData.append('char_name', data.char_name as string);

      let headers = {
        'Authorization': 'Bearer ' + this.authToken
      };

      let request = this.http.post<OperationResponse>(environment.api + '/vote/top100arena', formData, {headers: new HttpHeaders(headers)});

      request.subscribe((response: OperationResponse) => {
        this.voteMessage = "[Top100Arena] " + response.message;
      });
    } else {
      this.voteMessage = '[Top100Arena] Selecione um char para receber a recompensa!';
    }
  }

  validarVoteL2Votes() {
    if (this.selectCharVoteForm.value.char_name != '') {
      let data = this.selectCharVoteForm.value;

      let formData = new  FormData();
      formData.append('char_name', data.char_name as string);

      let headers = {
        'Authorization': 'Bearer ' + this.authToken
      };

      let request = this.http.post<OperationResponse>(environment.api + '/vote/l2votes', formData, {headers: new HttpHeaders(headers)});

      request.subscribe((response: OperationResponse) => {
        this.voteMessage = "[L2Votes] " + response.message;
      });
    } else {
      this.voteMessage = '[L2Votes] Selecione um char para receber a recompensa!';
    }
  }

  logout() {
    let formData = new  FormData();

    let headers = {
      'Authorization': 'Bearer ' + this.authToken
    };

    let request = this.http.post<OperationResponse>(environment.api + '/logout', formData, {headers: new HttpHeaders(headers)});

    request.subscribe((response: OperationResponse) => {
        this.authToken = null;
        this.login = null;
        localStorage.removeItem('access_token');
    });
  }
}
