/* jshint esversion: 6 */
const express = require('express');
const app = express();
var http = require('http').Server(app);
var cors = require('cors');
var pgp = require('pg-promise')({promiseLib: Promise});
const bodyParser = require('body-parser');
var config = require('./config/dbc.js');
var db = pgp({
    host: config.host,
    database: config.database,
    user:  config.user,
    password: config.password
});

app.use(bodyParser.json());
app.use(cors());

app.get('/api/contacts', function(req, res) {
  console.log('get: ');
  db.any('select * from contacts order by id')
  .then((val)=> {return val;})
  .then((val) => res.json(val));
});

app.post('/api/contacts', function(req, res) {
  console.log('post: ');
  // console.log(req.body);
  db.one('insert into contacts values (default,$1,$2,$3,$4,$5) returning id',[req.body.name,req.body.phone,req.body.email,req.body.type,req.body.favorite])
  .then((val)=> {console.log(val);return val;})
  .then((val) => {
    req.body.id = val.id;
    // console.log('returning: ');
    // console.log(req.body);
    res.json(req.body)})
  .catch((err) => console.log(err.message));
});

app.delete('/api/contacts/:id', function(req, res) {
  console.log('delete: ');
  console.log(req.params.id);
  db.none('delete from contacts where id=$1',[req.params.id])
  .then((val)=> {console.log("sql says: " + val); res.send("deleted");})
  .catch((err) => console.log(err.message));
});

app.put('/api/contacts/:id', function(req, res) {
  console.log("put: ");
  // console.log(req.body);
  // console.log('name: ' + req.body.name);
  // console.log('phone: ' + req.body.phone);
  // console.log('email: ' + req.body.email);
  // console.log('type: ' + req.body.type);
  // console.log('favorite: ' + req.body.favorite);
  // console.log('id: ' + req.body.id);

  db.none('update contacts set name = $1, phone = $2, email = $3, type=$4, favorite=$5 where id=$6',[req.body.name,req.body.phone,req.body.email,req.body.type,req.body.favorite,req.params.id])
  .then((val)=> {console.log(val);res.json(req.body)})
  .catch((err) => console.log(err.message));
});

var port = 5004;
http.listen(port, function(){
  console.log('listening on port: ' + port);
});
