var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

var loggedIn = [];

var port = 3000;

var db_config = {
  host: "serwer1895835.home.pl",
  user: "29158242_projektsql",
  password: "projektsql",
  database: "29158242_projektsql"
};

var errorsTranslator = [];
for(var i = 0; i<2000; i++)

errorsTranslator[1062] = "W bazie znajduje się już taki klucz"
errorsTranslator[1451] = "Nie można usunąć rekordu ponieważ jest powiązany z innym rekordem"

function dissplayError(error)  {
  if(errorsTranslator[error.errno]) return errorsTranslator[error.errno]
  else return "Niestety wystąpił niezdefiniowany błąd MySQL, który głosi: "+error.sqlMessage;
}



var con;

function handleDisconnect() {
  con = mysql.createConnection(db_config);
                                                  
  con.connect(function(err) {              
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    }                                     
  });                                     
                                          
  con.on('error', function(err) {
    //console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                      
      throw err;                                 
    }
  });
}

handleDisconnect()



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
            if (err) {socket.emit('errorMsg', dissplayError(err)); return}
        if(result.length > 0) socket.emit('userLogs', JSON.stringify(result))
        });
    }

    function getAllGroups(){
        con.query(`SELECT * FROM grupa JOIN sala on s_id = ids JOIN pracownik on p_id = idp JOIN osoba on o_id = ido;`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', dissplayError(err)); return}
        socket.emit('groupAllList', JSON.stringify(result))
        });
    }
    function getAllRooms(){
      con.query(`SELECT * FROM sala`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', dissplayError(err)); return}
        socket.emit('roomList', JSON.stringify(result))
      });
    }

    function allSubjectListRequest(){
      con.query(`SELECT numer AS sala, przedmiot, idu, data, osoba.imie AS imie, osoba.nazwisko AS nazwisko, wykladowca.imie AS wImie, wykladowca.nazwisko AS wNazwisko FROM uczestnik JOIN grupa on g_id = idg JOIN osoba ON o_id = ido JOIN
      pracownik ON p_id = idp JOIN osoba AS wykladowca ON pracownik.o_id = wykladowca.ido JOIN sala on s_id = ids`, function (err, result, fields) {
     if (err) throw err;
     socket.emit('subjectList', JSON.stringify(result))
     });
    }
    socket.on('teacherListRequest', function(){
      con.query(`SELECT * FROM osoba JOIN pracownik on o_id = ido;`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', dissplayError(err)); return}
        socket.emit('teacherList', JSON.stringify(result))
        });
    })

    socket.on('adminLogListRequest', function(limit){
      con.query(`SELECT * FROM logi JOIN osoba ON o_id = ido JOIN sala on s_id = ids ORDER BY data DESC LIMIT ${limit}`, function (err, result, fields) {
      if (err) {socket.emit('errorMsg', dissplayError(err)); return}
      socket.emit('adminLogList', JSON.stringify(result))
      });
    });

    socket.on('subjectListRequest', function(limit){
      allSubjectListRequest();
    });

    socket.on('userListRequest', function(){
        con.query(`SELECT * FROM osoba`, function (err, result, fields) {
          if (err) {socket.emit('errorMsg', dissplayError(err)); return}
        socket.emit('userList', JSON.stringify(result))
        });
      });

      socket.on('removeParticipant', function(id){
        con.query(`DELETE FROM uczestnik WHERE idu = ${id}`, function (err, result, fields) {
            console.log(err)
              if (err) {socket.emit('errorMsg', dissplayError(err)); return}
              allSubjectListRequest();
          });
      })

      socket.on('removeRoom', function(id){
        con.query(`DELETE FROM sala WHERE ids = ${id}`, function (err, result, fields) {
            console.log(err)
              if (err) {socket.emit('errorMsg', dissplayError(err)); return}
              getAllRooms();
          });
      })

      socket.on('getRooms', function(){
        getAllRooms();
      });

      socket.on('addRoom', function(data){
        var roomData = JSON.parse(data);
        con.query(`INSERT INTO sala (numer, st_dostepu) VALUES ('${roomData.number}', '${roomData.accessLevel}')`, function (err, result, fields) {
          if (err) {
            console.log(err);
            socket.emit('errorMsg', dissplayError(err)); return
          }
          getAllRooms();
        });
      });
      
//SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = "29158242_projektsql" AND TABLE_NAME = "osoba";

     socket.on('addStudent', function(data){
        var userData = JSON.parse(data);
        con.query(`INSERT INTO osoba (imie, nazwisko, st_dostepu) VALUES ('${userData.name}', '${userData.surname}', '${userData.accessLevel}')`, function (err, result, fields) {
          if (err) {socket.emit('errorMsg', dissplayError(err)); return}
          con.query(`INSERT INTO student (o_id, nr_indeksu) VALUES ('${result.insertId}', '${userData.indexNumber}')`, function (err, result, fields) {
				if (err) {socket.emit('errorMsg', dissplayError(err)); return}
			});
        });
      });
      
      socket.on('addTeacher', function(data){
        var userData = JSON.parse(data);
        con.query(`INSERT INTO osoba (imie, nazwisko, st_dostepu) VALUES ('${userData.name}', '${userData.surname}', '${userData.accessLevel}')`, function (err, result, fields) {
          if (err) {socket.emit('errorMsg', dissplayError(err)); return}
          con.query(`INSERT INTO pracownik (o_id, stanowisko) VALUES ('${result.insertId}', '${userData.position}')`, function (err, result, fields) {
				if (err) {socket.emit('errorMsg', dissplayError(err)); return}
			});
        });
      });

      socket.on('addGroup', function(data){
        var groupData = JSON.parse(data);
        con.query(`INSERT INTO grupa (przedmiot, data, licznosc, s_id, p_id) VALUES ('${groupData.subject}', '${groupData.date}',
        '${groupData.count}', '${groupData.roomId}', '${groupData.teacherId}')`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', dissplayError(err)); return}
        getAllGroups();
        });
      });

      socket.on('addParticipant', function(data){
        var partData = JSON.parse(data);
        con.query(`INSERT INTO uczestnik (g_id, o_id) VALUES ('${partData.g_id}', '${partData.s_id}')`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', dissplayError(err)); return}
        allSubjectListRequest();
        });
      });
      
      socket.on('getAllGroups', function(){
        getAllGroups();
      });

      socket.on('userPermissionsRequest', function(userId){
        con.query(`(SELECT ids FROM osoba JOIN sala WHERE ido='${userId}' AND osoba.st_dostepu >= sala.st_dostepu) UNION
        (SELECT ids FROM osoba JOIN uczestnik ON o_id = ido JOIN grupa ON g_id = idg JOIN sala ON s_id = ids WHERE ido='${userId}')`, function (err, result, fields) {
              if (err) {socket.emit('errorMsg', dissplayError(err)); return}
            result = JSON.parse(JSON.stringify(result))
            socket.emit('userPermissions', JSON.stringify(result))
          });
      });

      socket.on('userLogsRequest', function(userId, limit){
        emitLogs(userId, limit);
      });

      socket.on('getRooms', function(){
        con.query(`SELECT * FROM sala`, function (err, result, fields) {
            if (err) {socket.emit('errorMsg', dissplayError(err)); return}
        socket.emit('roomList', JSON.stringify(result))
        });
      });

      
      
      socket.on('openDoor', function(jData){

        var data = JSON.parse(jData);
        var action = "Tried to open door, no access"

        con.query(`(SELECT ids FROM osoba JOIN sala WHERE ido='${data.userId}' AND osoba.st_dostepu >= sala.st_dostepu) UNION
        (SELECT ids FROM osoba JOIN uczestnik ON o_id = ido JOIN grupa ON g_id = idg JOIN sala ON s_id = ids WHERE ido='${data.userId}')`, function (err, result, fields) {
              if (err) {socket.emit('errorMsg', dissplayError(err)); return}
            result = JSON.parse(JSON.stringify(result))
            if(result == 0) ;
            if(result.filter(e => e.ids == data.doorId).length > 0) {action = "Open door"}
            con.query(`INSERT INTO logi (data, akcja, s_id, o_id) VALUES (now(), '${action}', ${data.doorId}, ${data.userId})`, function (err, result, fields) {
                  if (err) {socket.emit('errorMsg', dissplayError(err)); return}
              else emitLogs(data.userId,data.limit);
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
