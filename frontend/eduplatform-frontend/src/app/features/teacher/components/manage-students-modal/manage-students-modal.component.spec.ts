import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStudentsModalComponent } from './manage-students-modal.component';

describe('ManageStudentsModalComponent', () => {
  let component: ManageStudentsModalComponent;
  let fixture: ComponentFixture<ManageStudentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStudentsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageStudentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
