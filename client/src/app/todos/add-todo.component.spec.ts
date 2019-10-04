import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {AddTodoComponent} from './add-todo.component';
import {CustomModule} from '../custom.module';
import {By} from '@angular/platform-browser';
import {NgForm} from '@angular/forms';
import {AddUserComponent} from '../users/add-user.component';

describe('Add todo component', () => {

  let addTodoComponent: AddTodoComponent;
  let calledClose: boolean;
  const mockMatDialogRef = {
    close() {
      calledClose = true;
    }
  };
  let fixture: ComponentFixture<AddTodoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CustomModule],
      declarations: [AddUserComponent],
      providers: [
        {provide: MatDialogRef, useValue: mockMatDialogRef},
        {provide: MAT_DIALOG_DATA, useValue: null}]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    calledClose = false;
    fixture = TestBed.createComponent(AddTodoComponent);
    addTodoComponent = fixture.componentInstance;
  });

  it('should not allow an owner to contain a symbol'), async(() => {
    const fixture = TestBed.createComponent(AddTodoComponent);
    const debug = fixture.debugElement;
    const input = debug.query(By.css('[owner=category]'));

    fixture.detectChanges();
      input.nativeElement.value = '@@@sadboihour@@@';
      dispatchEvent(input.nativeElement);
      fixture.detectChanges();

      const form: NgForm = debug.children[0].injector.get(NgForm);
      const control = form.control.get('owner');
      expect(control.hasError('notPeeskillet')).toBe(true);
      expect(form.control.valid).toEqual(false);
      expect(form.control.hasError('notPeeskillet', ['owner'])).toEqual(true);

      input.nativeElement.value = 'bigboigreg';
      dispatchEvent(input.nativeElement);
      fixture.detectChanges();

    expect(control.hasError('notPeeskillet')).toBe(false);
    expect(form.control.valid).toEqual(true);
    expect(form.control.hasError('notPeeskillet', ['email'])).toEqual(false);
  });
});
