const { ObjectID } = require('mongodb'),
      expect = require('expect'),
      request = require('supertest');

const app = require('../'),
      Todo = require('../models/todo');

const todos = [
  {
    _id: new ObjectID(),
    text: 'First todo'
  },
  {
    _id: new ObjectID(),
    text: 'Second todo',
    complete: true,
    completedAt: 333
  }
];

beforeEach((done) => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

describe('GET /todos', () => {
  it('should fetch all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todo/:id', () => {
  let todo = todos[0];

  it('should return todo', (done) => {
    request(app)
      .get(`/todos/${todo._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todo.text);
      })
      .end(done);
  });

  it('should not find a non-existent todo', (done) => {
    let id = new ObjectID().toHexString();

    request(app)
    .get(`/todos/${id}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 for invalid object id', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if ( err ) {
          return done(err);
        }

        Todo.find({ text })
          .then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch((error) => done(error));
      });
  });

  it('should not create an invalid todo', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if ( err ) {
          return done(err);
        }

        Todo.find()
          .then((todos) => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch((error) => done(error));
      });
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo text', (done) => {
    let id = todos[0]._id.toHexString();
    let text = 'Updated first todo';

    request(app)
      .patch(`/todos/${id}`)
      .send({ text, complete: true })
      .expect(200)
      .expect((res) => {
        let todo = res.body.todo;

        expect(todo.text).toBe(text);
        expect(todo.complete).toBe(true);
        expect(todo.completedAt).toBeA('number')
      })
      .end(done);
  });

  it('should null completedAt when todo is not complete', (done) => {
    let id = todos[1]._id.toHexString();
    let text = 'Updated second todo';

    request(app)
      .patch(`/todos/${id}`)
      .send({ text, complete: false })
      .expect(200)
      .expect((res) => {
        let todo = res.body.todo;

        expect(todo.text).toBe(text);
        expect(todo.complete).toBe(false);
        expect(todo.completedAt).toNotExist();
      })
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('should delete a todo', (done) => {
    let id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if ( err ) {
          return done(err);
        }

        Todo.findById(id)
          .then(
            (todo) => {
              expect(todo).toNotExist();
              done();
            }
          )
          .catch((error) => done(error));
      })
  });

  it('should not delete a non-existent todo', (done) => {
    let id = new ObjectID().toHexString();

    request(app)
    .delete(`/todos/${id}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 for invalid object id', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});
