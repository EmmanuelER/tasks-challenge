import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public user: any;
  constructor(public authService: AuthService) {}

  title = 'tasks-challenge';
  ngOnInit(): void {
    this.user = localStorage.getItem('user');
  }
}
