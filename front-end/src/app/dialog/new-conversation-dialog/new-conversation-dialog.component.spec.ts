import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewConversationDialogComponent } from './new-conversation-dialog.component';

describe('NewConversationDialogComponent', () => {
  let component: NewConversationDialogComponent;
  let fixture: ComponentFixture<NewConversationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewConversationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewConversationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
