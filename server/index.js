const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      { mongoose, Schema } = require('./db'),
      { ObjectID } = require('mongodb'),
      isValid = ObjectID.isValid,
      _ = require('lodash');

const Todo = require('./models/todo');
const User = require('./models/user');

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
  Todo.find()
    .then(
      (todos) => res.send({ todos }),
      (error) => res.status(400).send(error)
    );
});

app.get('/todos/:id', (req, res) => {
  let id = req.params.id;

  if ( !isValid(id) ) {
    return res.status(404).send();
  }

  Todo.findById(id)
    .then(
      (todo) => {
        if ( !todo ) {
          return res.status(404).send();
        }

        res.send({ todo });
      })
      .catch((error) => res.status(400).send());
});

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save()
    .then(
      (todo) => res.send(todo),
      (error) => res.status(400).send(error)
    )
});

app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let fields = _.pick(req.body, ['text', 'complete']);

  if ( !isValid(id) ) {
    return res.status(404).send();
  }

  if ( _.isBoolean(fields.complete) && fields.complete ) {
    fields.completedAt = new Date().getTime();
  } else {
    fields.complete = false;
    fields.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, { $set: fields }, { new: true })
    .then((todo) => {
      if ( !todo ) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch((error) => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
  let id = req.params.id;

  if ( !isValid(id) ) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id)
    .then(
      (todo) => {
        if ( !todo ) {
          return res.status(404).send();
        }

        res.send({ todo });
      })
      .catch((error) => res.status(400).send());
});

app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = app;
