var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

var loggedIn = [];

var port = 3001;

var con = mysql.createConnection({
  host: "serwer1895835.home.pl",
  user: "29158242_projektsql",
  password: "projektsql",
  database: "29158242_projektsql"
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
            if (err) {socket.emit('errorMsg', err.sqlMessage); return}
        if(result.length > 0) socket.emit('userLogs', JSON.stringify(result))
        });
    }

    function getAllGroups(){
        con.query(`SELECT * FROM grupa`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', err.sqlMessage); return}
        socket.emit('groupAllList', JSON.stringify(result))
        });
    }
    function getAllRooms(){
      con.query(`SELECT * FROM sala`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', err.sqlMessage); return}
        socket.emit('roomList', JSON.stringify(result))
      });
    }

    function allSubjectListRequest(){
      con.query(`SELECT numer AS sala, przedmiot, data, osoba.imie AS imie, osoba.nazwisko AS nazwisko, wykladowca.imie AS wImie, wykladowca.nazwisko AS wNazwisko FROM uczestnik JOIN grupa on g_id = idg JOIN osoba ON o_id = ido JOIN
      pracownik ON p_id = idp JOIN osoba AS wykladowca ON pracownik.o_id = wykladowca.ido JOIN sala on s_id = ids`, function (err, result, fields) {
     if (err) throw err;
     socket.emit('subjectList', JSON.stringify(result))
     });
    }

    socket.on('teacherListRequest', function(){
      con.query(`SELECT * FROM osoba JOIN pracownik on o_id = ido;`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', err.sqlMessage); return}
        socket.emit('teacherList', JSON.stringify(result))
        });
    })

    socket.on('adminLogListRequest', function(limit){
      con.query(`SELECT * FROM logi JOIN osoba ON o_id = ido ORDER BY data DESC LIMIT ${limit}`, function (err, result, fields) {
      if (err) {socket.emit('errorMsg', err.sqlMessage); return}
      socket.emit('adminLogList', JSON.stringify(result))
      });
    });

    socket.on('subjectListRequest', function(limit){
      allSubjectListRequest();
    });

    socket.on('userListRequest', function(){
        con.query(`SELECT * FROM osoba`, function (err, result, fields) {
          if (err) {socket.emit('errorMsg', err.sqlMessage); return}
        socket.emit('userList', JSON.stringify(result))
        });
      });

      socket.on('getRooms', function(){
        getAllRooms();
      });

      socket.on('addRoom', function(data){
        var roomData = JSON.parse(data);
        con.query(`INSERT INTO sala (numer, st_dostepu) VALUES ('${roomData.number}', '${roomData.accessLevel}')`, function (err, result, fields) {
          if (err) {socket.emit('errorMsg', err.sqlMessage); return}
          getAllRooms();
        });
      });
      
//SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = "29158242_projektsql" AND TABLE_NAME = "osoba";

     socket.on('addStudent', function(data){
        var userData = JSON.parse(data);
        con.query(`INSERT INTO osoba (imie, nazwisko, st_dostepu) VALUES ('${userData.name}', '${userData.surname}', '${userData.accessLevel}')`, function (err, result, fields) {
          if (err) {socket.emit('errorMsg', err.sqlMessage); return}
          con.query(`INSERT INTO student (o_id, nr_indeksu) VALUES ('${result.insertId}', '${userData.indexNumber}')`, function (err, result, fields) {
				if (err) {socket.emit('errorMsg', err.sqlMessage); return}
			});
        });
      });
      
      socket.on('addTeacher', function(data){
        var userData = JSON.parse(data);
        con.query(`INSERT INTO osoba (imie, nazwisko, st_dostepu) VALUES ('${userData.name}', '${userData.surname}', '${userData.accessLevel}')`, function (err, result, fields) {
          if (err) {socket.emit('errorMsg', err.sqlMessage); return}
          con.query(`INSERT INTO pracownik (o_id, stanowisko) VALUES ('${result.insertId}', '${userData.position}')`, function (err, result, fields) {
				if (err) {socket.emit('errorMsg', err.sqlMessage); return}
			});
        });
      });

      socket.on('addGroup', function(data){
        var groupData = JSON.parse(data);
        con.query(`INSERT INTO grupa (przedmiot, data, licznosc, s_id, p_id) VALUES ('${groupData.subject}', '${groupData.date}',
        '${groupData.count}', '${groupData.roomId}', '${groupData.teacherId}')`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', err.sqlMessage); return}
        getAllGroups();
        });
      });

      socket.on('addParticipant', function(data){
        var partData = JSON.parse(data);
        con.query(`INSERT INTO uczestnik (g_id, o_id) VALUES ('${partData.g_id}', '${partData.s_id}')`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', err.sqlMessage); return}
        allSubjectListRequest();
        });
      });
      
      socket.on('getAllGroups', function(){
        getAllGroups();
      });

      socket.on('userPermissionsRequest', function(userId){
        con.query(`SELECT ids FROM osoba JOIN sala WHERE ido='${userId}' AND osoba.st_dostepu >= sala.st_dostepu;`, function (err, result, fields) {
              if (err) {socket.emit('errorMsg', err.sqlMessage); return}
          con.query(`SELECT ids FROM osoba JOIN uczestnik ON o_id = ido JOIN grupa ON g_id = idg JOIN sala ON s_id = ids WHERE ido='${userId}'`, function (err, secResult, fields) {
                if (err) {socket.emit('errorMsg', err.sqlMessage); return}
            result = JSON.parse(JSON.stringify(result))
            secResult = JSON.parse(JSON.stringify(secResult))
            for(var i = 0; i<secResult.length; i++){
              result[result.length] = secResult[i];
            }
            socket.emit('userPermissions', JSON.stringify(result))
            });
          });
      });

      socket.on('userLogsRequest', function(userId, limit){
        emitLogs(userId, limit);
      });

      socket.on('getRooms', function(){
        con.query(`SELECT * FROM sala`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', err.sqlMessage); return}
        socket.emit('roomList', JSON.stringify(result))
        });
      });

      
      
      socket.on('openDoor', function(jData){

        var data = JSON.parse(jData);
        var action = "Tried to open door, no access"

        con.query(`SELECT ids FROM osoba JOIN sala WHERE ido='${data.userId}' AND osoba.st_dostepu >= sala.st_dostepu;`, function (err, result, fields) {
              if (err) {socket.emit('errorMsg', err.sqlMessage); return}
          con.query(`SELECT ids FROM osoba JOIN uczestnik ON o_id = ido JOIN grupa ON g_id = idg JOIN sala ON s_id = ids WHERE ido='${data.userId}'`, function (err, secResult, fields) {
                if (err) {socket.emit('errorMsg', err.sqlMessage); return}
            result = JSON.parse(JSON.stringify(result))
            secResult = JSON.parse(JSON.stringify(secResult))
            for(var i = 0; i<secResult.length; i++){
              result[result.length] = secResult[i];
            }
            if(result == 0) ;
            if(result.filter(e => e.ids == data.doorId).length > 0) {action = "Open door"}
            con.query(`INSERT INTO logi (data, akcja, s_id, o_id) VALUES (now(), '${action}', ${data.doorId}, ${data.userId})`, function (err, result, fields) {
                  if (err) {socket.emit('errorMsg', err.sqlMessage); return}
              else emitLogs(data.userId,data.limit);
            })
            });
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
