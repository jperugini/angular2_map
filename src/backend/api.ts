var util = require('util');
var {Router} = require('express');
import * as path from 'path';
var mv = require('mv');

// Our API for demos only
import {fakeDataBase} from './db';
import {fakeDemoRedisCache} from './cache';

// you would use cookies/token etc
var USER_ID = 'f9d98cf1-1b96-464e-8755-bcc2a5c09077'; // hardcoded as an example

// Our API for demos only
export function serverApi(req, res) {
  let key = USER_ID + '/data.json';
  let cache = fakeDemoRedisCache.get(key);
  if (cache !== undefined) {
    console.log('/data.json Cache Hit');
    return res.json(cache);
  }
  console.log('/data.json Cache Miss');

  fakeDataBase.get()
    .then(data => {
      fakeDemoRedisCache.set(key, data);
      return data;
    })
    .then(data => res.json(data));
}


// todo API

var COUNT = 4;
var TODOS = [
  { id: 0, value: 'finish example', created_at: new Date(), completed: false },
  { id: 1, value: 'add tests',      created_at: new Date(), completed: false },
  { id: 2, value: 'include development environment', created_at: new Date(), completed: false },
  { id: 3, value: 'include production environment',  created_at: new Date(), completed: false }
];

export function createTodoApi() {

  var router = Router()

  router.route('/todos')
    .get(function(req, res) {
      console.log('GET');
      // 70ms latency
      setTimeout(function() {
        res.json(TODOS);
      }, 0);

    })
    .post(function(req, res) {
      console.log('POST', util.inspect(req.body, {colors: true}));
      var todo = req.body;
      if (todo) {
        TODOS.push({
          value: todo.value,
          created_at: new Date(),
          completed: todo.completed,
          id: COUNT++
        });
        return res.json(todo);
      }

      return res.end();
    });

  router.param('todo_id', function(req, res, next, todo_id) {
    // ensure correct prop type
    var id = Number(req.params.todo_id);
    try {
      var todo = TODOS[id];
      req.todo_id = id;
      req.todo = TODOS[id];
      next();
    } catch (e) {
      next(new Error('failed to load todo'));
    }
  });

  router.route('/todos/:todo_id')
    .get(function(req, res) {
      console.log('GET', util.inspect(req.todo, {colors: true}));

      res.json(req.todo);
    })
    .put(function(req, res) {
      console.log('PUT', util.inspect(req.body, {colors: true}));

      var index = TODOS.indexOf(req.todo);
      var todo = TODOS[index] = req.body;

      res.json(todo);
    })
    .delete(function(req, res) {
      console.log('DELETE', req.todo_id);

      var index = TODOS.indexOf(req.todo);
      TODOS.splice(index, 1);

      res.json(req.todo);
    });

  return router;
};

export function uploadJson() {

  var router = Router()
  var multer = require('multer');
  var fs = require('fs')

  var DIR = './uploads/';

  router.route('/upload')
    .post(multer({dest: "./uploads/"}).single("uploads"), function(req, res) {
      if(req['file'].originalname.endsWith('.json')) {
        fs.readFile(req['file'].path, 'utf8', function (err, data) {
          if (err) {
            res.status(500).send('Upload failed');
          }
          res.status(200).json(data);
        });
      } else {
        res.status(500).send('Upload must be json file');
      }
    });

  return router;
};
