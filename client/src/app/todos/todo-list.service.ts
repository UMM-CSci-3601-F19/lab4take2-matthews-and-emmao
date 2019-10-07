import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';

import {Todo} from './todo';
import {environment} from '../../environments/environment';


@Injectable()
export class TodoListService {
  readonly baseUrl: string = environment.API_URL + 'todos';
  private todoUrl: string = this.baseUrl;

  constructor(private http: HttpClient) {
  }

  getTodos(todoOwner?: string): Observable<Todo[]> {
    this.filterByOwner(todoOwner);
    return this.http.get<Todo[]>(this.todoUrl);
  }

  getTodoById(id: string): Observable<Todo> {
    return this.http.get<Todo>(this.todoUrl + '/' + id);
  }

  public filterTodos(todos: Todo[], searchOwner: string, searchStatus: boolean, searchBody: string, searchCategory: string): Todo[] {

    let filteredTodos = todos;

    // Filter by owner
    if (searchOwner != null) {
      searchOwner = searchOwner.toLocaleLowerCase();

      filteredTodos = filteredTodos.filter(todo => {
        return !searchOwner || todo.owner.toLowerCase().indexOf(searchOwner) !== -1;
      });
    }

    // Filter by status
    if (searchStatus != null) {
      filteredTodos = filteredTodos.filter(todo => {
        return todo.status == searchStatus;
      });
    }

    // Filter by body
    if (searchBody != null) {
      filteredTodos = filteredTodos.filter(todo => {
        return !searchBody || todo.body.toLowerCase().indexOf(searchBody) !== -1;
      });
    }

    // Filter by category
    if (searchCategory != null) {
      filteredTodos = filteredTodos.filter(todo => {
        return !searchCategory || todo.category == searchCategory;
      });
    }

    return filteredTodos;
  }

  /*
  //This method looks lovely and is more compact, but it does not clear previous searches appropriately.
  //It might be worth updating it, but it is currently commented out since it is not used (to make that clear)
  getTodosByCompany(todoCompany?: string): Observable<To-do> {
      this.todoUrl = this.todoUrl + (!(todoCompany == null || todoCompany == "") ? "?company=" + todoCompany : "");
      console.log("The url is: " + this.todoUrl);
      return this.http.request(this.todoUrl).map(res => res.json());
  }
  */

  filterByOwner(todoOwner?: string): void {
    if (!(todoOwner == null || todoOwner === '')) {
      if (this.parameterPresent('owner=')) {
        // there was a previous search by owner that we need to clear
        this.removeParameter('owner=');
      }
      if (this.todoUrl.indexOf('?') !== -1) {
        // there was already some information passed in this url
        this.todoUrl += 'owner=' + todoOwner + '&';
      } else {
        // this was the first bit of information to pass in the url
        this.todoUrl += '?owner=' + todoOwner + '&';
      }
    } else {
      // there was nothing in the box to put onto the URL... reset
      if (this.parameterPresent('owner=')) {
        let start = this.todoUrl.indexOf('owner=');
        const end = this.todoUrl.indexOf('&', start);
        if (this.todoUrl.substring(start - 1, start) === '?') {
          start = start - 1;
        }
        this.todoUrl = this.todoUrl.substring(0, start) + this.todoUrl.substring(end + 1);
      }
    }
  }

  private parameterPresent(searchParam: string) {
    return this.todoUrl.indexOf(searchParam) !== -1;
  }

  // remove the parameter and, if present, the &
  private removeParameter(searchParam: string) {
    let start = this.todoUrl.indexOf(searchParam);
    let end = 0;
    if (this.todoUrl.indexOf('&') !== -1) {
      end = this.todoUrl.indexOf('&', start) + 1;
    } else {
      end = this.todoUrl.indexOf('&', start);
    }
    this.todoUrl = this.todoUrl.substring(0, start) + this.todoUrl.substring(end);
  }

  addNewTodo(newTodo: Todo): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        // We're sending JSON
        'Content-Type': 'application/json'
      }),
      // But we're getting a simple (text) string in response
      // The server sends the hex version of the new to-do back
      // so we know how to find/access that to-do again later.
      responseType: 'text' as 'json'
    };

    // Send post request to add a new to-do with the to-do data as the body with specified headers.
    return this.http.post<string>(this.todoUrl + '/new', newTodo, httpOptions);
  }
}
