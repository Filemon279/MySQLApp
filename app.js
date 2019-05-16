var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

var loggedIn = [];

var port = 3001;

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "resett",
  database: "projektSQL"
});

con.connect(function(err) {
  if (err) throw err;
});

app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.render(__dirname + '/index');
});

app.get('/register', function(req, res){
  res.render(__dirname + '/register');
});

app.get('/user', function(req, res){
  res.render(__dirname + '/user');
});

app.get('/admin', function(req, res){
  res.render(__dirname + '/admin');
});

app.get('/user/:userId', function(req, res){

  con.query(`SELECT * FROM osoba WHERE ido='${req.params.userId}'`, function (err, result, fields) {
  if (err) throw err;
  console.log(result);
  if(result.length>0) res.render(__dirname + '/user', {locals: {success: true, user: result[0]}} );
  else res.render(__dirname + '/user', {locals: {success: false, userName: "No name"}} );
  });
});

app.use(express.static('public'));

io.on('connection', function(socket){
    console.log('a user connected');

    function emitLogs(userId, limit) {
      con.query(`SELECT * FROM logi WHERE o_id='${userId}' ORDER BY data DESC LIMIT ${limit}`, function (err, result, fields) {
        if (err) throw err;
        if(result.length > 0) io.emit('userLogs', JSON.stringify(result))
        });
    }

    function getAllGroups(){
     
        con.query(`SELECT * FROM grupa`, function (err, result, fields) {
        if (err) throw err;
        io.emit('groupAllList', JSON.stringify(result))
        });

    }

    socket.on('userListRequest', function(){
        con.query(`SELECT * FROM osoba`, function (err, result, fields) {
        if (err) throw err;
        //console.log(JSON.stringify(result))
        io.emit('userList', JSON.stringify(result))
        });
      });

      socket.on('getRooms', function(){
        con.query(`SELECT * FROM sala`, function (err, result, fields) {
        if (err) throw err;
        //console.log(JSON.stringify(result))
        io.emit('roomList', JSON.stringify(result))
        });
      });



      socket.on('addGroup', function(data){
        var groupData = JSON.parse(data);
        con.query(`INSERT INTO grupa (przedmiot, data, licznosc, s_id, p_id) VALUES ('${groupData.subject}', now(),
        '${groupData.count}', '${groupData.roomId}', '${groupData.teacherId}')`, function (err, result, fields) {
        if (err) throw err;
        getAllGroups();
        });
      });

      
      socket.on('getAllGroups', function(){
        getAllGroups();
      });
      socket.on('userPermissionsRequest', function(userId){
        con.query(`SELECT ids FROM osoba JOIN sala WHERE ido='${userId}' AND osoba.st_dostepu >= sala.st_dostepu;`, function (err, result, fields) {
          if (err) throw err;
          console.log(JSON.stringify(result))
          io.emit('userPermissions', JSON.stringify(result))
          });
      });

      socket.on('userLogsRequest', function(userId, limit){
        emitLogs(userId, limit);
      });

      socket.on('getRooms', function(){
        con.query(`SELECT * FROM sala`, function (err, result, fields) {
        if (err) throw err;
        //console.log(JSON.stringify(result))
        io.emit('roomList', JSON.stringify(result))
        });
      });

      
      socket.on('openDoor', function(jData){
        var data = JSON.parse(jData);
        var action = "Tried to open door, no access"
        con.query(`SELECT ids FROM osoba JOIN sala WHERE ido='${data.userId}' AND osoba.st_dostepu >= sala.st_dostepu;`, function (err, result, fields) {
          if (err) throw err;
          if(result == 0) ;
          if(result.filter(e => e.ids == data.doorId).length > 0) {action = "Open door"}
          con.query(`INSERT INTO logi (data, akcja, s_id, o_id) VALUES (now(), '${action}', ${data.doorId}, ${data.userId})`, function (err, result, fields) {
            if (err) throw err;
            else emitLogs(data.userId);
          })
          });
        

        console.log(`Door ${data.doorId} opened by ${data.userId}`)
      });
      

    

  socket.on('disconnect', function(){
  console.log('user disconnected');
  });

});

http.listen(port, function(){
  console.log('listening on :'+port);
});
