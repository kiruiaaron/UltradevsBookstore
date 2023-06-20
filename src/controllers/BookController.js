const mssql = require('mssql');
const config=require('../config/config')

// create a new book
async function createBook(req, res) {
  try {
    const {BookID, Title, Author, PublicationYear, Status } = req.params;

    const sql = await mssql.connect(config);
    if (sql.connected) {
      
      let createBookResult = await sql.request()
        .input('BookID', BookID)
        .input('Title', Title)
        .input('Author', Author)
        .input('PublicationYear', PublicationYear)
        .input('Status', Status)
        .execute('CreateBook') // name of stored procedure


      res.status(201).json({
        status: true,
        message: 'Book created successfully',
        books: createBookResult.recordset
      });
    } else {
      res.status(400).json({
        status: false,
        message: 'Failed'

      })
    }
  } catch (error) {
    res.status(400).json({
      status: false,
      message: 'Failed to create Book',
      error: error.message
    });
  }
}


// get a book by id or ISBN
async function fetchBookById(req, res) {
    let sql = await mssql.connect(config);
    const { id } = req.params;
    if (sql.connected) {
      let result = await sql.query(
        `SELECT * FROM dbo.Books WHERE BookID = ${id}`
      );
      console.log(result);
      res.json({
        success: true,
        message: "fetched the book successfully",
        data: result.recordset,
      });
    }
  }


// list all available books
async function allAvailableBooks(req, res) {
    let sql = await mssql.connect(config);
    if (sql.connected) {
        let result = await sql.query("SELECT * FROM dbo.Books");
        console.log(result);
        res.json({
            success: true,
            message: "listed all available books ok",
            data: result.recordset,
        });
    }
}


module.exports = {
    createBook,
    allAvailableBooks,
    fetchBookById,
};