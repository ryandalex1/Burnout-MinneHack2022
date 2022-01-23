import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseBurnerDialogComponent } from './close-burner-dialog.component';

describe('CloseBurnerDialogComponent', () => {
  let component: CloseBurnerDialogComponent;
  let fixture: ComponentFixture<CloseBurnerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseBurnerDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseBurnerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
