import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeSubmissionModalComponent } from './challenge-submission-modal.component';

describe('ChallengeSubmissionModalComponent', () => {
  let component: ChallengeSubmissionModalComponent;
  let fixture: ComponentFixture<ChallengeSubmissionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChallengeSubmissionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeSubmissionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
