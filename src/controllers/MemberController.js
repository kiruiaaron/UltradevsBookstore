const mssql = require('mssql');
const config = require('../config/config');
const bcrypt = require('bcrypt');
const {generateTokens} = require('../tokens/Tokens');
const sendMail = require('../controllers/Email')
const { loginSchema, createNewMemberSchema } = require('../validators/Validations')


async function connectToDatabase() {
    try {
        await mssql.connect(config);
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection error:', error);
        console.error('Stack trace:', error.stack);
    }
}

async function getMember(req, res) {
    let sql = await mssql.connect(config)
    if (sql.connect) {
        let result = await sql.query("SELECT * FROM Members")
        res.status(400).json({
            success: "true",
            message: "All members",
            result: result.recordset
        })
    }
}
//get a member by id
async function getMemberId(req, res) {
    let sql = await mssql.connect(config)
    if (sql.connect) {
        const { id } = req.params
        let result = await sql.request()
            .input('id', Number(id))
            .execute('select_member_id');
        res.status(400).json({
            success: "true",
            message: "Member",
            result: result.recordset
        })
    }
}
//authenticaion
async function loginMember(req, res) {
    // Login validation
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
  
    let sql = await mssql.connect(config);
    if (sql.connect) {
      const { EmailAddress, Password } = req.body;
      let result = await sql.request().input('EmailAddress', EmailAddress).execute('select_member_Email');
      let user = result.recordset[0];
      if (user) {
        let password_match = await bcrypt.compare(Password, user.Password);
        if (password_match) {
          let token = await generateTokens({
            memberId: user.memberId,
            roles: "Login Member"
          });
          res.status(200).json({ success: true, message: "Login Successful", token });

          //sending mail
          sendMail(`${user.EmailAddress}`, "Logged in", "Logged in successfully");

        } else {
          res.status(404).json({
            success: false,
            message: "Password does not match"
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message: "Authentication failed"
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Internal Server problem"
      });
    }
  }
  




async function createNewMember(req, res) {

    const { error } = createNewMemberSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const sql = await mssql.connect(config);
    if (sql.connected) {
        const { Name, EmailAddress, Password } = req.body;

        const hashedPassword = await bcrypt.hash(Password, 8)

        const result = await sql.request()
            .input('Name', Name)
            .input('EmailAddress', EmailAddress)
            .input('Password', hashedPassword)
            .execute('add_New_Member');

        res.status(200).json({
            success: true,
            message: 'New member added',
            result:result.recordset
        });

        sendMail(`${user.email}`, "Logged in", "Registration  Successful");
    }
}


async function getMembersWithBorrowedBook(req, res) {
    let sql = await mssql.connect(config)
    if (sql.connect) {
        let result = await sql.request()
            .execute('getMembersWithBorrowedBook')

        res.status(200).json({
            success: 'true',
            message: 'Members with borrowed books',
            result: result.recordset
        })
    } else {
        res.status(200).json({
            success: 'false',
            message: 'Failed to fetch members with borrowed books',

        })
    }
}


module.exports = {
    connectToDatabase,
    getMember,
    getMemberId,
    createNewMember,
    getMembersWithBorrowedBook,
    loginMember
};
