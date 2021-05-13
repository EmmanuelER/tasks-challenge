import { Component, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { getMinutes } from 'date-fns';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public closeResult = '';
  public task: any = {
    title: '',
    description: '',
    duration: '',
    minutes: '',
  };
  public listTasks: any = [];
  public editTask: any = [];
  constructor(
    private modalService: NgbModal,
    public af: AngularFirestore,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getTasks();
  }

  async getTasks() {
    let listT: any = [];
    await this.af
      .collection('tasks', (ref) => ref.orderBy('status', 'asc'))
      .get()
      .subscribe((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          listT.push(doc.data());
        });
      });

    this.listTasks = listT;
  }

  activateButton() {
    let bool = false;
    if (
      this.task.title != '' &&
      this.task.description != '' &&
      this.task.duration != ''
    ) {
      bool = true;
      if (this.task.duration === 'custom' && this.task.minutes != '') {
        bool = true;
      }
    } else {
      bool = false;
    }
    return bool;
  }
  addTask() {
    const duration =
      this.task.duration == 'custom'
        ? parseInt(this.task.minutes)
        : parseInt(this.task.duration);
    const formatData = {
      title: this.task.title,
      description: this.task.description,
      duration: duration,
      status: 'todo',
    };
    let id: string;
    this.af
      .collection('tasks')
      .add({
        title: this.task.title,
      })
      .then((docRef) => {
        id = docRef.id;
        this.updateDoc({ ...formatData, uid: id });
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  }
  updateTask() {
    const duration =
      this.editTask.duration == 'custom'
        ? parseInt(this.editTask.minutes)
        : parseInt(this.editTask.duration);
    let formatData = {
      ...this.editTask,
      duration: duration,
    };
    this.updateDoc(formatData);
  }
  playTask(data: any) {
    const now = new Date();
    const formatData = {
      ...data,
      startDate: data.startDate ? data.startDate : now,
      status: 'ainprogress',
    };
    this.updateDoc(formatData);
  }
  rebootTask(data: any) {
    const now = new Date();
    const formatData = {
      ...data,
      startDate: now,
      status: 'ainprogress',
    };
    this.updateDoc(formatData);
  }
  pauseTask(data: any) {
    let weekMiliseconds = 1000 * 60 * 60 * 24 * 7 + new Date().getTime();
    let t = data.startDate.seconds * 1000;
    weekMiliseconds = getMinutes(weekMiliseconds - t);
    const formatData = {
      ...data,
      startDate: weekMiliseconds,
      status: 'paused',
      timeRemaining: weekMiliseconds,
    };
    this.updateDoc(formatData);
  }
  stopTask(data: any) {
    const formatData = {
      ...data,
      startDate: 0,
      status: 'todo',
      timeRemaining: data.duration,
    };
    this.updateDoc(formatData);
  }
  finalizeTask(data: any) {
    const now = new Date();
    const formatData = {
      ...data,
      status: 'finalized',
      endDate: now,
    };
    this.updateDoc(formatData);
  }

  deleteTask() {
    this.af
      .collection('tasks')
      .doc(this.editTask.uid)
      .delete()
      .then(() => {
        window.alert('Tarea eliminada exitosamente');
        this.getTasks();
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  }

  openEditModal(content: any, data: any) {
    this.editTask = data;
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
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
  async updateDoc(params: any) {
    await this.af
      .collection('tasks')
      .doc(params.uid)
      .update(params)
      .then((docRef) => {
        window.alert('Tarea modificada exitosamente');
        this.getTasks();
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
