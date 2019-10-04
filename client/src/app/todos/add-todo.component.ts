import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Todo} from './todo';
import {FormControl, Validators, FormGroup, FormBuilder} from "@angular/forms";

@Component({
  selector: 'add-todo.component',
  templateUrl: 'add-todo.component.html',
})
export class AddTodoComponent implements OnInit {

  addTodoForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { todo: Todo }, private fb: FormBuilder) {
  }

  // not sure if this is magical and making it be found or if I'm missing something,
  // but this is where the red text that shows up (when there is invalid input) comes from
  add_todo_validation_messages = {
    'owner': [
      {type: 'required', message: 'Owner is required'},
      {type: 'minlength', message: 'Owner must be at least 2 characters long'},
      {type: 'maxlength', message: 'Owner cannot be more than 25 characters long'},
      {type: 'pattern', message: 'Owner must contain only numbers and letters'}
    ],

    // Status doesn't need validation because Angular build validates entry for us (also it's a dropdown menu so options
    // are limited).
    // 'status': [
    //   {type: 'pattern', message: 'Status must be "Complete" or "Incomplete"'},
    //   {type: 'required', message: 'Status is required'}
    // ],

    'body': [
      {type: 'required', message: 'ToDo body is required'}
    ],

    'category': [
      {type: 'pattern', message: 'Category must be: homework, groceries, video games, or software design'},
      {type: 'required', message: 'Category is required'}
    ]
  };

  createForms() {

    // add to-do form validations
    this.addTodoForm = this.fb.group({
      // We allow alphanumeric input and limit the length for owner.
      owner: new FormControl('owner', Validators.compose([
        Validators.minLength(2),
        Validators.maxLength(25),
        Validators.pattern('^[A-Za-z0-9\\s]+[A-Za-z0-9\\s]+$(\\.0-9+)?'),
        Validators.required
      ])),

      // // A to-do only has two states, complete or incomplete.
      // status: new FormControl('status', Validators.compose([
      //   Validators.pattern('Complete' || 'Incomplete'),
      //   Validators.required
      //   ])),

      // We don't care much about what is in the body field, but there should be something
      body: new FormControl('body', Validators.required),

      // We don't need a special validator just for our app here, but there is a default one for email.
      category: new FormControl('email', Validators.compose( [
        Validators.pattern('homework' || 'software design' || 'groceries' || 'video games'),
        Validators.required
      ]))
    });

  }

  ngOnInit() {
    this.createForms();
  }

}
