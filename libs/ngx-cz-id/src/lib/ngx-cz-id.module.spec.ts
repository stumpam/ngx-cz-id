import { async, TestBed } from '@angular/core/testing';
import { NgxCzIdModule } from './ngx-cz-id.module';

describe('NgxCzIdModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxCzIdModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgxCzIdModule).toBeDefined();
  });
});
