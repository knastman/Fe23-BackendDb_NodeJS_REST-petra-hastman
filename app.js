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

app.get('/', async (req, res) => {
  let pageTitle = "Databas - GritAcademy";
  const dbTables = await getTables();
  let tableName = "select table";
  res.render('index', {pageTitle, tableName, dbTables} );
});

//Hämtar info beroende på användarens val av tabell
app.post('/', async (req, res) => {
  const dbTables = await getTables();
  let pageTitle = 'Databas - GritAcademy'; 
  let errorMsg = "";
  let tableName = "";
  let dbData=[];

  if(req.body.tableMenuBtn){ 
    let tableName = req.body.tableMenuBtn;
    let sql = `SELECT * FROM ${tableName}`;
    dbData = await db.query(sql);
    res.render('index', {pageTitle,tableName, dbData, dbTables, errorMsg});
  } 
  else if(req.body.delRowBtn){ 
    let tableName = req.body.delRowBtn.split(",")[0];
    let id = req.body.delRowBtn.split(",")[1];

    //remove row
    await db.query(`DELETE FROM ${tableName} WHERE id=${id}`);

    let sql = `SELECT * FROM ${tableName}`;
    dbData = await db.query(sql);
    res.render('index', {pageTitle,tableName, dbData, dbTables, errorMsg});

  }

  else{
    errorMsg = "table name missing";
    dbData = [{}];
    res.render('index', {pageTitle,tableName, dbData, dbTables, errorMsg});
  }

});


/****************************
 EDIT POST 
*********************/

//ID från URL
app.get('/editData', async (req, res) => {
  const {id, table} = req.query;
  let successMsg ='Redigera nedan';

  if (!id) {
    return res.status(400).send('ID is required');
  }

  const sql = `SELECT * FROM ${table} WHERE id = ${id}; `;
  // console.log('sql i get editdata get');
  // console.log(sql);

  try {
    const dbData = await db.query(sql);
    res.render('editData', { table, id, dbData, successMsg });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/editData', async (req, res) => {
  let id = req.body.editBtn.split(",")[1];
  let table = req.body.editBtn.split(",")[0];

  let successMsg ='Edit data';
  let sql = '';
  let dbData = null;
    for (const [key, value] of Object.entries(req.body)) {
      if (key !== 'editBtn' && key !== 'id'){
        sql = `UPDATE ${table} SET ${key}="${value}" WHERE id=${id}`;
        try {
          dbData = await db.query(sql, id);
      
        } catch (error) {
          console.error('Error executing SQL query:', error);
          res.status(500).send('Internal Server Error');
        }
      }
    }

    sql = `SELECT * FROM ${table} WHERE id = ${id}; `;
    dbData = await db.query(sql, id);
    successMsg ='Posten har blivit redigerad';
    res.render('editData', { successMsg, id, table, dbData });

});



/****************************
      Students 
*********************/

//ALL data - students
app.get('/students', async (req, res) => {
  const table =  "students";
  const pageTitle = "All student data";
  const sql = `SELECT * FROM ${table}`;

  try {
    const dbData = await db.query(sql); 
    res.render('students', { pageTitle, dbData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});


//Kurser för student via ID 
app.get('/students/:id/courses', async (req, res) => {
  const {id} = req.params;

  if (!id) {
    return res.status(400).send('ID is required');
  }

  const coursesSql= `SELECT courses.name FROM courses
  JOIN students_courses ON courses.id = students_courses.courses_id
  JOIN students ON students_courses.students_id = students.id
  WHERE students.id = ${id}; `;
  
  const studentSql = `SELECT fname, lname, town FROM students WHERE id = ${id}; `;
  // const sql = `SELECT * FROM students WHERE id=${id}`;
  console.log('studentSql');
  console.log(studentSql);

  try {
    const studentData = await db.query(studentSql, id);
    const coursesData = await db.query(coursesSql, id);

    if (studentData.length === 0) {
      return res.status(404).send('Student not found');
    }

    if (coursesData.length === 0) {
      return res.status(404).send('No courses found for this student');
    }

    const student = studentData[0];

    const studentInfo = `${student.fname} ${student.lname}, ${student.town}`;
    const pageTitle = ` studentens namn ${student.fname} ${student.lname} `;
    const studentId = ` ${id}`;

    // res.render('student', { id, col, dbData: coursesData });
    res.render('student', { pageTitle, studentId, studentInfo, dbData: coursesData, dbData2: studentData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error i nya');
  }
});


//Alla stundenter med vald parameter och deras kurser
app.get('/students/:col/:value/:table', async (req, res) => {  
  const {col, value, table} = req.params;

  const coursesSql= `SELECT courses.name FROM courses
  JOIN students_courses ON courses.id = students_courses.courses_id
  JOIN students ON students_courses.students_id = students.id
  WHERE students.${col} = "${value}"; `;
  
  const studentSql = `SELECT fname, lname, town FROM students WHERE ${col} = "${value}"; `;

  try {
    const studentData = await db.query(studentSql, value);
    const coursesData = await db.query(coursesSql, value);

    if (studentData.length === 0) {
      return res.status(404).send('Student not found');
    }

    if (coursesData.length === 0) {
      return res.status(404).send('No courses found for this student');
    }

    const student = studentData[0];


    const studentInfo = `${student.fname} ${student.lname}, ${student.town}`;
    const pageTitle = ` studentens namn ${student.fname} ${student.lname} `;
    const studentValue = ` ${value}`;

    // res.render('student', { id, col, dbData: coursesData });
    res.render('student', { pageTitle, studentValue, studentInfo, dbData: coursesData, dbData2: studentData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error i col nya');
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


//Course ID från URL - visar vilka studenter som går vilken kurs
app.get('/course', async (req, res) => {
  const {id} = req.query; // Extract the id from the query parameters

  if (!id) {
    return res.status(400).send('ID is required');
  }

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



/********************
server configuration
*********************/
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});






