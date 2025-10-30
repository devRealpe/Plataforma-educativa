import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeSubmissionsListModalComponent } from './challenge-submissions-list-modal.component';

describe('ChallengeSubmissionsListModalComponent', () => {
  let component: ChallengeSubmissionsListModalComponent;
  let fixture: ComponentFixture<ChallengeSubmissionsListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeSubmissionsListModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeSubmissionsListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
