import express from "express";
import ejs from "ejs";
import * as db from "./db.js"
import bodyParser from "body-parser";

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 


async function getTables(){
  const sql = 'SHOW tables';
  const dbTables = await db.query(sql);
  return dbTables
}



/******************
Routing
******************/


// STARTAR HÄR - välja tabell och visa innehållet
app.get('/', async (req, res) => {
  const pageTitle = "SQL - Databas GritAcademy";
  const dbTables = await getTables();
  let tableName = "select table";
  res.render('index', {pageTitle, tableName, dbTables, tableName} );
});


let currentTable;
app.post('/', async (req, res) => {
  console.log(req.body); 
  const dbTables = await getTables();

  const pageTitle = "Select row"; 
  let errorMsg = "";
  let tableName = "";
  let dbData=[];


  if(req.body.tableMenuBtn){
    let tableName = req.body.tableMenuBtn;
    let sql = `SELECT * FROM ${req.body.tableMenuBtn}`;
    dbData = await db.query(sql);
    res.render('index', {pageTitle,tableName, dbData, dbTables, errorMsg});
  } 
  else if(req.body.delRowBtn){
    let tableName = req.body.delRowBtn.split(",")[0];
    let sql = `SELECT * FROM ${req.body.delRowBtn.split(",")[0]}`;  
    dbData = await db.query(sql);
    res.render('index', {pageTitle,tableName, dbData, dbTables, errorMsg});
  }
  else{
    errorMsg = "table name missing";
    dbData = [{}];
    res.render('index', {pageTitle,tableName, dbData, dbTables, errorMsg});
  }

  //remove row
  if(req.body.delRowBtn){
    await db.query(`DELETE FROM ${req.body.delRowBtn.split(",")[0]} WHERE id=${req.body.delRowBtn.split(",")[1]}`);
  }

});





/****************************
      Students 
*********************/

//ALL data - students
app.get('/students', async (req, res) => {
  const pageTitle = "All student data";
  const sql = `SELECT * FROM students`;

  try {
    const dbData = await db.query(sql); 
    res.render('students', { pageTitle, dbData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});



//Studentinfo ID från URL - what courses
app.get('/student', async (req, res) => {
  const {id} = req.query; // Extract the id from the query parameters

  if (!id) {
    return res.status(400).send('ID is required');
  }

  const studentSql = `SELECT fname, lname, town FROM students WHERE id = ${id}; `;

  const coursesSql= `SELECT courses.id, courses.name FROM courses
  JOIN students_courses ON courses.id = students_courses.courses_id
  JOIN students ON students_courses.students_id = students.id
  WHERE students.id = ${id}; `;

  try {
    const studentData = await db.query(studentSql, id);
    const coursesData = await db.query(coursesSql, id);

    if (studentData.length === 0) {
      return res.status(404).send('Student not found i app');
    }

    if (coursesData.length === 0) {
      return res.status(404).send('No courses found for this student i app');
    }

    const student = studentData[0];
    const studentInfo = ` ${student.fname} ${student.lname}, ${student.town}`;
    const studentName = ` ${student.fname} ${student.lname} `;
    const studentFname = ` ${student.fname}  `;
    const studentLname = ` ${student.lname} `;
    const studentTown = ` ${student.town} `;
    const pageTitle = ` studentens namn ${student.fname} ${student.lname} `;
    const studentId = ` ${id}`;

    res.render('student', { pageTitle, studentId, studentName, studentFname, studentLname, studentTown, studentInfo, dbData: coursesData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});



/****************************
      Courses
*********************/


//ALL data 
app.get('/courses', async (req, res) => {
  const pageTitle = "All courses data";
  const sql = `SELECT * FROM courses`;

  try {
    const dbData = await db.query(sql); 
    res.render('courses', { pageTitle, dbData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});



//Course ID från URL - visar vila studenter som går vilken kurs
app.get('/course', async (req, res) => {
  const {id} = req.query; // Extract the id from the query parameters

  if (!id) {
    return res.status(400).send('ID is required');
  }

  // const sql = `SELECT * FROM courses WHERE id = ${id}; `;

  const studentSql= `SELECT students.id, students.fName, students.lName FROM students
  JOIN students_courses ON students.id = students_courses.students_id
  JOIN courses ON students_courses.courses_id = courses.id
  WHERE courses.id = ${id}; `;

  const coursesSql = `SELECT name FROM courses WHERE id = ${id}; `;

  try {
    const studentData = await db.query(studentSql, id);
    const courseData = await db.query(coursesSql, id);

    if (studentData.length === 0) {
      return res.status(404).send('Student not found i app');
    }

    if (courseData.length === 0) {
      return res.status(404).send('No courses found for this student i app');
    }

    const course = courseData[0];
    const pageTitle = ` ${course.name} `;
    const pageTitle2 = `with ID = ${id}`;

    res.render('course', { pageTitle, dbData: studentData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});



/*****EDIT */

//ID från URL
app.get('/editData', async (req, res) => {
  const {id, table} = req.query;
 
  if (!id) {
    return res.status(400).send('ID is required');
  }

  const sql = `SELECT * FROM ${table} WHERE id = ${id}; `;


  // const coursesSql= `SELECT courses.id, courses.name FROM courses
  // JOIN students_courses ON courses.id = students_courses.courses_id
  // JOIN students ON students_courses.students_id = students.id
  // WHERE students.id = ${id}; `;

  try {
    const dbData = await db.query(sql, id);
    const pageTitle = `Edit data`;
    const tableName = `${table}`;
    const rowId = `${id}`;
    res.render('editData', { pageTitle, tableName, rowId, dbData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});




//EJ KLAR
app.post('/editData', async (req, res) => {
  console.log('req.body'); 
  console.log(req.body); 
  const {id, table} = req.query;
  // const id = `${req.body.split(",")[1]};`

  if (!id) {
    return res.status(400).send('ID is required');
  }

  // console.log(id);
  // const sql = `UPDATE ${table} SET ${value} = ${newValue}  WHERE id = ${id}; `;
  // const sql = `UPDATE ${table} SET ${value} = ${newValue}  WHERE id = ${req.body.split(",")[1]}; `;
  // const sql = `UPDATE ${table} SET ${value} = ${newValue}  WHERE id = ${rowID}; `;
  
  
  try {
    console.log('sql');
    console.log(sql);

    const dbData = await db.query(sql, id);
    const pageTitle = `Edit data`;
    const tableName = `${table}`;
    // const id = `${id}`;

    res.render('editData', { pageTitle, tableName, dbData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }

});





// //edit and info page EJ KLAR
// app.post('/editData', async (req, res) => {
//   const { id, town, fname, lname } = req.query;

//   let sql = '';
//   let queryParams = [];

//   if (id) {
//     sql = `SELECT * FROM students WHERE id = ${id}`;
//     queryParams.push(id);
//   } else if (town) {
//     sql = `SELECT * FROM students WHERE town = '${town}'`;
//     queryParams.push(town);
//   } else if (fname) {
//     sql = `SELECT * FROM students WHERE fname = '${fname}'`;
//     queryParams.push(fname);
//   } else if (lname) {
//     sql = `SELECT * FROM students WHERE lname = '${lname}'`;
//     queryParams.push(lname);
//   } else {
//     return res.status(400).send('A valid query parameter (id, town, fname, lname) is required');
//   }

//   try {
//     const dbData = await db.query(sql, queryParams);

//     if (dbData.length === 0) {
//       return res.status(404).send('No matching records found');
//     }

//     const pageTitle = 'More Information';
//     console.log('dbData');
//     console.log(dbData);
//     res.render('moreinfo', { pageTitle, dbData });

//   } catch (error) {
//     console.error('Error executing SQL query:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


// //info from fname, lname and town
app.get('/moreinfo', async (req, res) => {
  const { id, town, fname, lname } = req.query;

  let sql = '';
  let queryParams = [];
  let paramName = '';

  if (id) {
    sql = `SELECT * FROM students WHERE id = ${id}`;
    queryParams.push(id);
  } else if (town) {
    sql = `SELECT * FROM students WHERE town = '${town}'`;
    queryParams.push(town);
    paramName = 'bor i ' + town;
  } else if (fname) {
    sql = `SELECT * FROM students WHERE fname = '${fname}'`;
    queryParams.push(fname);
    paramName = 'heter ' + fname + ' i förnamn';
  } else if (lname) {
    sql = `SELECT * FROM students WHERE lname = '${lname}'`;
    queryParams.push(lname);
    paramName = 'heter ' + lname + ' i efternamn';
  } else {
    return res.status(400).send('A valid query parameter (id, town, fname, lname) is required');
  }

  try {
    const dbData = await db.query(sql, queryParams);

    if (dbData.length === 0) {
      return res.status(404).send('No matching records found');
    }

    const pageTitle = 'More Information on parameter';
    console.log('dbData');
    console.log(dbData);
    res.render('moreinfo', { pageTitle, dbData, paramName });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});





//Säger att den ska till kursen som har x id och x col (och det blir en url utifrån req.params? )
app.get('/courses/:id/:col', async (req, res) => {
  // let sql = `SELECT ${req.params.col} FROM courses WHERE id = ${req.params.id}`;
  let sql = `SELECT ${req.params.col} FROM courses WHERE id = 1`;
  const dbData = await db.query(sql);
  res.json(dbData);
});






/********************
server configuration
*********************/
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});






