import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../../environments/environment.prod";
import {OperationResponse} from "../../../models/OperationResponse";
import {Pvp} from "../../../models/Pvp";
import {Pk} from "../../../models/Pk";
import {Castle} from "../../../models/Castle";
import {Hero} from "../../../models/Hero";
import {Olympiad} from "../../../models/Olympiad";
import {Clan} from "../../../models/Clan";

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

  pvps: Pvp[] | null = null;
  pks: Pk[] | null = null;
  clans: Clan[] | null = null;
  olympiads: Olympiad[] | null = null;
  heroes: Hero[] | null = null;
  castles: Castle[] | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.rankings();
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
    let castle = this.http.get<Castle[]>(environment.api + '/rankings/castles');
    castle.subscribe((response: Castle[]) => {
      this.castles = response;
    });
  }

}
