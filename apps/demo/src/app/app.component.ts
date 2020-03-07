import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-cz-id-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Ngx-CZ-id';

  ctrl = new FormControl('', [Validators.required]);

  ngOnInit() {
    this.ctrl.valueChanges.subscribe(val =>
      console.log('appCmp: ', val, this.ctrl.errors),
    );
  }
}
