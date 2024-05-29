//With errorhandling  - DETTA FUNKAR 
// app.get('/students2', async (req, res) => {
//   const pageTitle = "All student data";
//   const sql = `SELECT * FROM students`;

//   try {
//     const dbData = await db.query(sql); 
//     // res.render('students', { pageTitle, dbData });
//     res.json(dbData);
//   } catch (error) {
//     console.error('Error executing SQL query:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });


//Students - all data - orginal utan error 
app.get('/students', async (req, res) => {
  const pageTitle = "All student data";
  const sql = `SELECT * FROM students`;
  const dbData = await db.query(sql);
  console.log(dbData);
  res.render('students', {pageTitle, dbData} );
  // res.json(dbData);
});


app.get('/databases', async (req, res) => {
  // res.send("hello World");//serves index.html
  const pageTitle = "Show databases";
  const sql = 'SHOW tables';
  const dbData = await db.query(sql);
  console.log(dbData);
  res.render('index', {pageTitle, dbData} );
  
});



//Student by id - Json table data
app.get('/students', async (req, res) => {
  const pageTitle = "Students as jsondata";
  let sql = "";
  const {id} = req.query;
  console.log(id);
  if(id){
      sql = `SELECT * FROM students WHERE id = ${id}`;
  }else{
      sql = `SELECT * FROM students`;
  }
  const dbData = await db.query(sql);
  console.log(dbData);
  res.json(dbData);
});





/******** CHATGTP EXEMPEL FATTAR EJ */
//Get info from database
app.get('/api/students', async (req, res) => {
  const sql = `SELECT * FROM students`;
  try {
    const dbData = await db.query(sql); 
    res.json(dbData);
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});

//Routing
app.get('/students', (req, res) => {
  const pageTitle = "All student data";
  res.render('students', { pageTitle });
});

/******** CHATGTP EXEMPEL FATTAR EJ */


// //With errorhandling  - DETTA FUNKAR 
// app.get('/students', async (req, res) => {
//   const pageTitle = "All student data";
//   const sql = `SELECT * FROM students`;

//   try {
//     const dbData = await db.query(sql); 
//     res.render('students', { pageTitle, dbData });
//   } catch (error) {
//     console.error('Error executing SQL query:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });



//FROM STUDENT


chatgtps version:
<h2><%= pageTitle %></h2>
<p>First Name: <%= student.fName %></p>
<p>Last Name: <%= student.lName %></p>
<p>ID: <%= student.id %></p>



//Min orginal student

<div class="tableList">
<!-- Puts data from database in table -->
<h2><%= pageTitle; %></h2>
<% if(typeof dbData != 'undefined'){ %> 
<table class="databaseTable">
  <thead>
    <tr>
      <% for (const header of Object.keys(dbData[0]) ) { %> 
        <th><h3><%= header; %></h3></th>
      <% } %> 
    </tr>
  </thead>
  <tbody>
    <% for (const row of dbData ){%>
    <tr>
      <% for (const value of Object.values(row) ){%>
      <td><%= value; %></td>
      <% } %> 
    </tr>
    <% }; %> 
  </tbody>
</table>
<% }; %>
</div>

IDAG*******IDAG*******IDAG*******IDAG*******IDAG*******IDAG*******IDAG*******IDAG*******IDAG*******IDAG*******



<h1>All courses for student x</h1>


<div class="tableList">
  <!-- Puts data from database in table -->
  <h2><%= pageTitle; %></h2>
  <% if(typeof dbData != 'undefined'){ %> 
  <table class="databaseTable">
    <thead>
      <tr>
head
      </tr>
    </thead>
    <tbody>
      <% for (const row of dbData ){%>
      <tr>
        <% for (const value of Object.values(row) ){%>
        <td><%= value; %></td>
        <% } %> 
      </tr>
      <% }; %> 
    </tbody>
  </table>
  <% }; %>
  </div>

<hr>


<div class="tableList">  
<tbody>
  <% for (const row of dbData) { %>
    <tr>
      <% const studentId = row.id; %>
      <% const fName = row.fName; %>
      <% const lName = row.lName; %>
      <% const fnamnet = `fname=${fName}`; %>

      <% const fnamny = `${fName}`; %>
      <% const lnamny = `${lName}`; %>
      <% const namy = `${fName} ${lName}`; %> 
      namny: <%  fnamny  %> <% lnamny %> stop
      <% for (const value of Object.entries(row)) { %>
        <td>
          Fnamny: <%= fnamny %>  <%= lnamny %><br>

        </td>
      <% } %>
    </tr>
  <% } %>
</tbody>



  /********* NYTT ************/
  <h1>Studentinfo</h1>
  <h2><%= pageTitle; %> går i följande kurser:</h2>

   <div class="tableList">
      <% if(typeof dbData != 'undefined'){ %> 
      <table class="databaseTable">
        <thead>
          <tr>
            <% for (const header of Object.keys(dbData[0]) ) { %> 
              <th><h3><%= header; %></h3></th>
            <% } %> 
          </tr>
        </thead>
        <tbody>
          <% for (const row of dbData ){%>
          <tr>
            <% for (const value of Object.values(row) ){%>
            <td><%= value; %></td>
            <% } %> 
          </tr>
          <% }; %> 
        </tbody>
      </table>
      <% }; %>
   </div>




/************************** */

// //ID från URL
// app.get('/student', async (req, res) => {
//   const {id} = req.query; // Extract the id from the query parameters
//   // const { id, fName, lName } = req.query; //Fick ej det att funka
//   console.log(id);
//   // c-version
//   if (!id) {
//     return res.status(400).send('ID is required');
//   }
//   // const sql = `SELECT * FROM students WHERE id = ?`;
//   // const sql = `SELECT * FROM students WHERE id = ${id}`;

//   const sql= `SELECT courses.id, courses.name FROM courses
//   JOIN students_courses ON courses.id = students_courses.courses_id
//   JOIN students ON students_courses.students_id = students.id
//   WHERE students.id = ${id}; `;

  
//   console.log(sql);

//   // //Lucas version
//   // let sql = "";
//   // if(id){
//   //   sql = `SELECT * FROM students WHERE id = ${id}`;
//   // } else {
//   //   sql = `SELECT * FROM students`;
//   // }

//   try {
    
//     const dbData = await db.query(sql, id);
//     // const [dbData] = await db.query(sql, id, fName, lName);
//     // const student = dbData[0];
//     // const pageTitle = `Information about student ${student.fName} ${student.lName} with the ID = ${id}`;
//     const pageTitle = `Information about student  with the ID = ${id}`;
//     //const dbData = await db.query(sql); 

//     // if (dbData.length === 0) {
//     //   return res.status(404).send('Student not found');
//     // }


//     // res.render('student', { pageTitle, student });
//     res.render('student', { pageTitle, dbData });

//   } catch (error) {
//     console.error('Error executing SQL query:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });




//ID från URL STÄDAD
app.get('/student', async (req, res) => {
  const {id} = req.query; // Extract the id from the query parameters

  if (!id) {
    return res.status(400).send('ID is required');
  }

  const studentSql = `SELECT fname, lname FROM students WHERE id = ${id}; `;

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
    const pageTitle = ` ${student.fname} ${student.lname} `;
    const pageTitle2 = `with ID = ${id}`;


    // const pageTitle = `Courses for student with ID = ${id}`;
    // res.render('student', { pageTitle, dbData });
    res.render('student', { pageTitle, dbData: coursesData });

  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).send('Internal Server Error');
  }
});