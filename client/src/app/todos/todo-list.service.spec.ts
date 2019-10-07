import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';

import {Todo} from './todo';
import {TodoListService} from './todo-list.service';

describe('Todo list service: ', () => {
  // A small collection of test users
  const testTodos: Todo[] = [
    {
      _id: 'chris_id',
      owner: 'Chris',
      status: true,
      body: 'latin things',
      category: 'software design'
    },
    {
      _id: 'pat_id',
      owner: 'Pat',
      status: false,
      body: 'Other latin things',
      category: 'groceries'
    },
    {
      _id: 'jamie_id',
      owner: 'Jamie',
      status: false,
      body: 'MoRe LaTiN',
      category: 'video games'
    }
  ];
  const mTodos: Todo[] = testTodos.filter(todo =>
    todo.owner.toLowerCase().indexOf('a') !== -1
  );

  // We will need some url information from the userListService to meaningfully test owner filtering;
  // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-2-typescript-for-private-methods-with-ja
  let todoListService: TodoListService;
  let currentlyImpossibleToGenerateSearchUserUrl: string;

  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    // Construct an instance of the service with the mock
    // HTTP client.
    todoListService = new TodoListService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('getTodos() calls api/todos', () => {
    // Assert that the users we get from this call to getUsers()
    // should be our set of test users. Because we're subscribing
    // to the result of getUsers(), this won't actually get
    // checked until the mocked HTTP request "returns" a response.
    // This happens when we call req.flush(testUsers) a few lines
    // down.
    todoListService.getTodos().subscribe(
      todos => expect(todos).toBe(testTodos)
    );

    // Specify that (exactly) one request will be made to the specified URL.
    const req = httpTestingController.expectOne(todoListService.baseUrl);
    // Check that the request made to that URL was a GET request.
    expect(req.request.method).toEqual('GET');
    // Specify the content of the response to that request. This
    // triggers the subscribe above, which leads to that check
    // actually being performed.
    req.flush(testTodos);
  });

  it('getTodos(todoCompany) adds appropriate param string to called URL', () => {
    todoListService.getTodos('m').subscribe(
      todos => expect(todos).toEqual(mTodos)
    );

    const req = httpTestingController.expectOne(todoListService.baseUrl + '?owner=m&');
    expect(req.request.method).toEqual('GET');
    req.flush(mTodos);
  });

  it('filterByOwner(todoOwner) deals appropriately with a URL that already had a owner', () => {
    currentlyImpossibleToGenerateSearchUserUrl = todoListService.baseUrl + '?owner=f&something=k&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchUserUrl;
    todoListService.filterByOwner('a');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '?something=k&owner=a&');
  });

  it('filterByOwner(todoOwner) deals appropriately with a URL that already had some filtering, but no owner', () => {
    currentlyImpossibleToGenerateSearchUserUrl = todoListService.baseUrl + '?something=k&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchUserUrl;
    todoListService.filterByOwner('a');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '?something=k&owner=a&');
  });

  it('filterByOwner(todoOwner) deals appropriately with a URL has the keyword owner, but nothing after the =', () => {
    currentlyImpossibleToGenerateSearchUserUrl = todoListService.baseUrl + '?owner=&';
    todoListService['todoUrl'] = currentlyImpossibleToGenerateSearchUserUrl;
    todoListService.filterByOwner('');
    expect(todoListService['todoUrl']).toEqual(todoListService.baseUrl + '');
  });

  it('getTodoById() calls api/todos/id', () => {
    const targetTodo: Todo = testTodos[1];
    const targetId: string = targetTodo._id;
    todoListService.getTodoById(targetId).subscribe(
      todo => expect(todo).toBe(targetTodo)
    );

    const expectedUrl: string = todoListService.baseUrl + '/' + targetId;
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(targetTodo);
  });

  it('todo list filters by owner', () => {
    expect(testTodos.length).toBe(3);
    let todoOwner = 'a';
    expect(todoListService.filterTodos(testTodos, todoOwner, null, null, null).length).toBe(2);
  });

  it('todo list filters by status', () => {
    expect(testTodos.length).toBe(3);
    let todoStatus = true;
    expect(todoListService.filterTodos(testTodos, null, todoStatus, null, null).length).toBe(1);
  });

  it('todo list filters by owner and status', () => {
    expect(testTodos.length).toBe(3);
    let todoStatus = false;
    let todoOwner = 'i';
    expect(todoListService.filterTodos(testTodos, todoOwner, todoStatus, null, null).length).toBe(1);
  });

  it('contains an owner named \'Chris\'', () => {
    expect(testTodos.some((todo: Todo) => todo.owner === 'Chris')).toBe(true);
  });

  it('contain an owner named \'Jamie\'', () => {
    expect(testTodos.some((todo: Todo) => todo.owner === 'Jamie')).toBe(true);
  });

  it('doesn\'t contain an owner named \'Santa\'', () => {
    expect(testTodos.some((todo: Todo) => todo.owner === 'Santa')).toBe(false);
  });

  it('has two todos that are false', () => {
    expect(testTodos.filter((todo: Todo) => todo.status === false).length).toBe(2);
  });

  it('contains all the todos', () => {
    expect(testTodos.length).toBe(3);
  });

  it('adding a todo calls api/todos/new', () => {
    const jesse_id = 'jesse_id';
    const newTodo: Todo = {
      _id: '',
      owner: 'Jesse',
      status: true,
      body: 'latin',
      category: 'groceries'
    };

    todoListService.addNewTodo(newTodo).subscribe(
      id => {
        expect(id).toBe(jesse_id);
      }
    );

    const expectedUrl: string = todoListService.baseUrl + '/new';
    const req = httpTestingController.expectOne(expectedUrl);
    expect(req.request.method).toEqual('POST');
    req.flush(jesse_id);
  });


});
