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
  let successMsg ='';
  const msg ='Redigera nedan';

  if (!id) {
    return res.status(400).send('ID is required');
  }

  const sql = `SELECT * FROM ${table} WHERE id = ${id}; `;


  try {
    const dbData = await db.query(sql);
    res.render('editData', { table, id, dbData, msg, successMsg });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/editData', async (req, res) => {
  let id = req.body.editBtn.split(",")[1];
  let table = req.body.editBtn.split(",")[0];

  const msg ='Redigera nedan';
  let successMsg ='';
  let sql = '';
  let dbData = null;

  for (const [key, value] of Object.entries(req.body)) {
    if (key !== 'editBtn' && key !== 'id'){
      sql = `UPDATE ${table} SET ${key}="${value}" WHERE id=${id}`;
      try {
        dbData = await db.query(sql, id);
        successMsg ='Posten har blivit redigerad';
    
      } catch (error) {
        console.error('Error executing SQL query:', error);
        res.status(500).send('Internal Server Error');
      }
    }
  }
    

    sql = `SELECT * FROM ${table} WHERE id = ${id}; `;
    dbData = await db.query(sql, id);
    
    res.render('editData', { msg, successMsg, id, table, dbData });

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
  
  const studentSql = `SELECT fname, lname FROM students WHERE id = ${id}; `;
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
    console.log('student');
    console.log(student);
    const pageTitle = ` ${student.fname} ${student.lname} `;

    res.render('student', { pageTitle, dbData: coursesData, dbData2: studentData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error i nya');
  }
});



//Alla stundenter med vald parameter och deras kurser
app.get('/students/:col/:value/:table', async (req, res) => { 
  const { col, value, table } = req.params;

  let title = '';
  if (col == 'town'){
    title = `bor i ${value}`;
  } 
  else if (col == 'fName'){
    title = `heter ${value} i förnamn`;
  } 
  else if (col == 'lName'){
    title = `heter ${value} i efternamn`;
  } 
  const titleStart = 'Alla studenter som';
  const titleEnd = 'och deras kurser';
  const pageTitle = `${titleStart} ${title} ${titleEnd}`;


  // Fetch students based on the given column and value
  const studentSql = `SELECT id, fname, lname, town FROM students WHERE ${col} = "${value}" `;
  
  // Fetch courses based on student ids
  const coursesSql = `SELECT students_courses.students_id, courses.name FROM courses
  JOIN students_courses ON courses.id = students_courses.courses_id
  WHERE students_courses.students_id IN ( SELECT id FROM students WHERE ${col} = "${value}")`;

  try {
    const studentData = await db.query(studentSql, [value]);
    const coursesData = await db.query(coursesSql, [value]);

    // Group courses by student id
    const coursesByStudent = coursesData.reduce((acc, course) => {
      if (!acc[course.students_id]) {
        acc[course.students_id] = [];
      }
      acc[course.students_id].push(course.name);
      return acc;
    }, {});

    // Attach courses to each student
    const studentsWithCourses = studentData.map(student => ({
      ...student,
      courses: coursesByStudent[student.id] || []
    }));

    res.render('studentsCourses', { studentsWithCourses, pageTitle });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});
  



/****************************
      Courses
*********************/


//ALL kursdata 
app.get('/courses', async (req, res) => {
  const pageTitle = "All courses data";
  const sql = `SELECT id, name AS Kursnamn, description AS Kursbeskrivning FROM courses`;

  try {
    const dbData = await db.query(sql); 
    res.render('courses', { pageTitle, dbData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});


//Course ID från URL - visar vilka studenter som går i en specifik kurs
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






