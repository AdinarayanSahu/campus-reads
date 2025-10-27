import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManageBooksTabComponent } from './admin-manage-books-tab';

describe('AdminManageBooksTabComponent', () => {
  let component: AdminManageBooksTabComponent;
  let fixture: ComponentFixture<AdminManageBooksTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManageBooksTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManageBooksTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
