const express= require("express");
const bodyParses= require("body-parser");
const sqlite = require('sqlite3').verbose();

let db = my_database('./gallery.db');
var app = express();
const router=express.Router();

app.use(express.json());

app.listen(3000, () => {
	console.log('listening on port 3000');
  });

router.get("/", function(req, res) {
	db.all("SELECT id,author, alt, tags, image, description FROM gallery", function(err,rows){
		if(err)
			res.status(500).send(err);
		else
			res.status(200).json(rows);
	});
});

router.get('/id/:id', function(req, res) {
    
	db.get("SELECT * FROM gallery where id=?", req.params.id, function(err, rows) {
	if(err)
		res.status(503).send(err);
	else
		if(!rows)
			res.status(404).send("Author with id "+req.params.id+" couldn't be found!");
		else
    		return res.status(200).json(rows);
    });
});

router.post('/users', function(req, res) {
	db.run(
		"INSERT INTO gallery(author,alt,tags,image,description) VALUES(?,?,?,?,?)",
		[
		req.body.author,
		req.body.alt,
		req.body.tags,
		req.body.image,
		req.body.description
		],
	function(err) {
		if (err) 
		  res.status(400).send(err);
		 else {
		  res.status(201).set('Content-Type', 'application/json');
		}
	  }
	);
});

router.delete('/id/:id',function(req,res){
	let	clearId=req.params.id;
		db.get("SELECT * FROM gallery where id=?", clearId, function(err, rows) {
		if(err)
			res.status(503).send(err);
	else{
		if(!rows)
			res.status(404).send("Author with id "+clearId+" couldn't be found!");
		else{
    		db.run("DELETE FROM gallery where id=?",clearId,function(err){
				if(err)
					res.status(500).send(err);
				else
					res.status(200).send("Deleted author with id "+req.params.id);
			});
		}
	}
    });
});

router.put('/id/:id', function(req, res) {
	db.run(
		"UPDATE gallery SET author=?, alt=?,tags=? ,image=?, description=? where id=?",
		[
		req.body.author,
		req.body.alt,
		req.body.tags,
		req.body.image,
		req.body.description,
		req.params.id
		],
	function(err) {
		if (err) 
		  res.status(400).send(err);
		 else {
		  res.status(201).json("Update author with id "+req.params.id);
		}
	  }
	);
});

// ###############################################################################
// This should start the server, after the routes have been defined, at port 3000:



// ###############################################################################
// Some helper functions called above
function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
  		if (err) {
			console.error(err.message);
  		}
  		console.log('Connected to the phones database.');
	});
	// Create our phones table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS gallery
        	 (
                    id INTEGER PRIMARY KEY,
                    author CHAR(100) NOT NULL,
                    alt CHAR(100) NOT NULL,
                    tags CHAR(256) NOT NULL,
                    image char(2048) NOT NULL,
                    description CHAR(1024) NOT NULL
		 )
		`);
		db.all(`select count(*) as count from gallery`, function(err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
        			"Tim Berners-Lee",
        			"Image of Berners-Lee",
        			"html,http,url,cern,mit",
        			"https://upload.wikimedia.org/wikipedia/commons/9/9d/Sir_Tim_Berners-Lee.jpg",
        			"The internet and the Web aren't the same thing."
    				]);
				db.run(`INSERT INTO gallery (author, alt, tags, image, description) VALUES (?, ?, ?, ?, ?)`, [
        			"Grace Hopper",
        			"Image of Grace Hopper at the UNIVAC I console",
        			"programming,linking,navy",
        			"https://upload.wikimedia.org/wikipedia/commons/3/37/Grace_Hopper_and_UNIVAC.jpg",
				"Grace was very curious as a child; this was a lifelong trait. At the age of seven, she decided to determine how an alarm clock worked and dismantled seven alarm clocks before her mother realized what she was doing (she was then limited to one clock)."
    				]);
				console.log('Inserted dummy photo entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	});
	return db;
}
app.use("/api",router);
