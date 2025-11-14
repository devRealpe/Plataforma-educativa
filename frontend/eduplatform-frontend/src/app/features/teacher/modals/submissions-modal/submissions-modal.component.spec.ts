import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionsModalComponent } from './submissions-modal.component';

describe('SubmissionsModalComponent', () => {
  let component: SubmissionsModalComponent;
  let fixture: ComponentFixture<SubmissionsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
