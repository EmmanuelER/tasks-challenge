import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { format } from 'date-fns';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  public listTasks: any = [];
  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  colorScheme = {
    domain: ['#2dce89', '#ffd600', '#fb6340', '#AAAAAA'],
  };
  constructor(public af: AngularFirestore, public authService: AuthService) {}

  ngOnInit() {
    this.getTasks();
  }
  async getTasks() {
    var listT: any = [];
    await this.af
      .collection('tasks', (ref) => ref.where('status', '==', 'finalized'))
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.listTasks.push(doc.data());
        });
      });
    this.listTasks = listT;
  }
  formatDate(data: any) {
    let t: any = new Date(data.seconds * 1000);
    t = format(t, 'dd/MMM/yyyy hh:mm aaa');
    return t;
  }
  sortTable(prop: string) {
    if (prop === 'status') {
      this.listTasks = this.listTasks.sort((a: any, b: any) => {
        if (a.status < b.status) {
          return 1;
        }
        if (a.status > b.status) {
          return -1;
        }
        return 0;
      });
    } else if (prop === 'duration') {
      this.listTasks = this.listTasks.sort((a: any, b: any) => {
        if (a.duration < b.duration) {
          return 1;
        }
        if (a.duration > b.duration) {
          return -1;
        }
        return 0;
      });
    } else if (prop === 'title') {
      this.listTasks = this.listTasks.sort((a: any, b: any) => {
        if (a.title < b.title) {
          return 1;
        }
        if (a.title > b.title) {
          return -1;
        }
        return 0;
      });
    }
  }
}
