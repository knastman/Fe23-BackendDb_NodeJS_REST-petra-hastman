import mysql from "mysql2";

// Create a pool of database connections
const pool = mysql.createPool({
// export default const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'GritAcademy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // rowsAsArray: true, //Detta gör det till en lista (därför inte orginallooparna funkade)
  });

  // Export a function to execute SQL queries
  export function 
  query(sql, values){
    return new Promise((resolve, reject) => {
      pool.query(sql, values, (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      });
    });
  }


// Export a function to execute SQL queries
// module.exports = {
//     query: (sql, values) => {
//       return new Promise((resolve, reject) => {
//         pool.query(sql, values, (err, results) => {
//           if (err) {
//             return reject(err);
//           }
//           return resolve(results);
//         });
//       });
//     }
//   };