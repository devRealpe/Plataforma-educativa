import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivationalMessagesComponent } from './motivational-messages.component';

describe('MotivationalMessagesComponent', () => {
  let component: MotivationalMessagesComponent;
  let fixture: ComponentFixture<MotivationalMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MotivationalMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotivationalMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
