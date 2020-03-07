import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdInputComponent } from './input.component';

describe('InputComponent', () => {
  let component: IdInputComponent;
  let fixture: ComponentFixture<IdInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
