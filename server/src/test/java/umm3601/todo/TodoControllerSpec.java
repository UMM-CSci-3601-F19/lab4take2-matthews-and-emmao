package umm3601.todo;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.*;
import org.bson.codecs.*;
import org.bson.codecs.configuration.CodecRegistries;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.json.JsonReader;
import org.bson.types.ObjectId;
import org.junit.Before;
import org.junit.Test;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

/**
 * JUnit tests for the TodoController.
 * <p>
 * Created by mcphee on 22/2/17.
 */
public class TodoControllerSpec {
  private TodoController todoController;
  private ObjectId samsId;

  @Before
  public void clearAndPopulateDB() {
    MongoClient mongoClient = new MongoClient();
    MongoDatabase db = mongoClient.getDatabase("test");
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Chris\",\n" +
      "                    status: true,\n" +
      "                    body: \"UMM\",\n" +
      "                    category: \"chriscategorythis.that\"\n" +
      "                }"));
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Pat\",\n" +
      "                    status: false,\n" +
      "                    body: \"IBM\",\n" +
      "                    category: \"patcategorysomething.com\"\n" +
      "                }"));
    testTodos.add(Document.parse("{\n" +
      "                    owner: \"Jamie\",\n" +
      "                    status: false,\n" +
      "                    body: \"Frogs, Inc.\",\n" +
      "                    category: \"jamiecategoryfrogs.com\"\n" +
      "                }"));

    samsId = new ObjectId();
    BasicDBObject sam = new BasicDBObject("_id", samsId);
    sam = sam.append("owner", "Sam")
      .append("status", true)
      .append("body", "Frogs, Inc.")
      .append("category", "samcategoryfrogs.com");


    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(Document.parse(sam.toJson()));

    // It might be important to construct this _after_ the DB is set up
    // in case there are bits in the constructor that care about the state
    // of the database.
    todoController = new TodoController(db);
  }

  // http://stackoverflow.com/questions/34436952/json-parse-equivalent-in-mongo-driver-3-x-for-java
  private BsonArray parseJsonArray(String json) {
    final CodecRegistry codecRegistry
      = CodecRegistries.fromProviders(Arrays.asList(
      new ValueCodecProvider(),
      new BsonValueCodecProvider(),
      new DocumentCodecProvider()));

    JsonReader reader = new JsonReader(json);
    BsonArrayCodec arrayReader = new BsonArrayCodec(codecRegistry);

    return arrayReader.decode(reader, DecoderContext.builder().build());
  }

  private static String getOwner(BsonValue val) {
    BsonDocument doc = val.asDocument();
    return ((BsonString) doc.get("owner")).getValue();
  }

  @Test
  public void getAllTodos() {
    Map<String, String[]> emptyMap = new HashMap<>();
    String jsonResult = todoController.getTodos(emptyMap);
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 4 todos", 4, docs.size());
    List<String> owners = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwners = Arrays.asList("Chris", "Jamie", "Pat", "Sam");
    assertEquals("Owners should match", expectedOwners, owners);
  }

  @Test
  public void getTodosWhoAreFalse() {
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("status", new String[]{"false"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);

    assertEquals("Should be 2 todos", 2, docs.size());
    List<String> owners = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwners = Arrays.asList("Jamie", "Pat");
    assertEquals("Owners should match", expectedOwners, owners);
  }

  @Test
  public void getSamById() {
    String jsonResult = todoController.getTodo(samsId.toHexString());
    Document sam = Document.parse(jsonResult);
    assertEquals("Owner should match", "Sam", sam.get("owner"));
    String noJsonResult = todoController.getTodo(new ObjectId().toString());
    assertNull("No owner should match", noJsonResult);

  }

  @Test
  public void addTodoTest() {
    String newId = todoController.addNewTodo("Brian", true, "umm", "brian@yahoo.com");

    assertNotNull("Add new todo should return true when todo is added,", newId);
    Map<String, String[]> argMap = new HashMap<>();
    argMap.put("status", new String[]{"true"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);

    List<String> owner = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    assertEquals("Should return owner of new todo", "Brian", owner.get(0));
  }

  @Test
  public void getTodoByBody() {
    Map<String, String[]> argMap = new HashMap<>();
    //Mongo in TodoController is doing a regex search so can just take a Java Reg. Expression
    //This will search the body starting with an I or an F
    argMap.put("body", new String[]{"[I,F]"});
    String jsonResult = todoController.getTodos(argMap);
    BsonArray docs = parseJsonArray(jsonResult);
    assertEquals("Should be 3 todos", 3, docs.size());
    List<String> owner = docs
      .stream()
      .map(TodoControllerSpec::getOwner)
      .sorted()
      .collect(Collectors.toList());
    List<String> expectedOwner = Arrays.asList("Jamie", "Pat", "Sam");
    assertEquals("Owners should match", expectedOwner, owner);

  }


}
