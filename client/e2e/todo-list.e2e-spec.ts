import {TodoPage} from './todo-list.po';
import {browser, protractor, element, by} from 'protractor';
import {Key} from 'selenium-webdriver';
import {Todo} from "../src/app/todos/todo";

const origFn = browser.driver.controlFlow().execute;
browser.driver.controlFlow().execute = function () {
  let args = arguments;

  origFn.call(browser.driver.controlFlow(), () => {
    return protractor.promise.delayed(100);
  });

  return origFn.apply(browser.driver.controlFlow(), args);
};


describe('Todo list', () => {
  let page: TodoPage;

  beforeEach(() => {
    page = new TodoPage();
});

  it ('should get and highlight Todos title attribute', () => {
  page.navigateTo();
  expect(page.getTodoTitle()).toEqual('Todos');
});
  it('should type something in filter owner box and check that it returned correct element', () => {
    page.navigateTo();
    page.typeAOwner('Fry');
    expect(page.getUniqueTodo('homework')).toEqual('Fry');
  });

  it ('should search using status to find true (complete) todos', () => {
    page.navigateTo();
    page.getTodoByStatus('true');
    expect(page.getUniqueTodo("software design")).toEqual('Blanche');
  });

  it ('should search todos by body content', () => {
    page.navigateTo();
    page.getBody("ipsum");
    expect(page.getUniqueTodo("software design")).toEqual('Workman');
  });

  it('should apply multiple filters', () => {
    page.navigateTo();
    page.getBody("ipsum");
    page.getTodoByStatus("false");
    page.typeAOwner("roberta");
    expect(page.getUniqueTodo('software design')).toEqual('Roberta');
  });
describe('Add Todo', () => {

  beforeEach(() => {
    page.navigateTo();
    page.click('addNewTodo');
  });

  it('Should actually add the todo with the information we put in the fields', () => {
    page.navigateTo();
    page.click('addNewTodo');
    page.field('ownerField').sendKeys('Tracy Kim');
    // Need to clear the age field because the default value is -1.
    browser.actions().sendKeys(Key.TAB).perform();
    browser.actions().sendKeys('c').perform();
    browser.actions().sendKeys(Key.ENTER).perform();
    page.field('bodyField').sendKeys('Awesome Startup, LLC');
    page.field('categoryField').sendKeys('awesome');
    expect(page.button('confirmAddTodoButton').isEnabled()).toBe(true);
    page.click('confirmAddTodoButton');

    /*
     * This tells the browser to wait until the (new) element with ID
     * 'tracy@awesome.com' becomes present, or until 10,000ms whichever
     * comes first. This allows the test to wait for the server to respond,
     * and then for the client to display this new user.
     * http://www.protractortest.org/#/api?view=ProtractorExpectedConditions
     */
    const tracy_element = element(by.id('awesome'));
    browser.wait(protractor.ExpectedConditions.presenceOf(tracy_element), 10000);

    expect(page.getUniqueTodo('awesome')).toMatch('Tracy Kim.*'); // toEqual('Tracy Kim');
  });
};
