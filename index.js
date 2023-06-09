const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const PORT = 3000
const User = require('./models/Customer')
const path = require('path')
const app = express()
const fs = require('fs');
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const csvtojson = require('csvtojson')
const qr = require('qr-image');
const nodemailer = require('nodemailer')
const md5 = require("md5");

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile)
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true,limit: '50mb'}));
app.use('/asset', express.static(path.join(__dirname, 'asset')))

app.get('/', function (req, res) {
  res.render("dashboard.ejs");
});
app.get('/one', function (req, res) {
  res.render("one.ejs");
});
app.get('/welcome', function (req, res) {
  res.render("welcome.ejs"); 
});

app.get('/qr', function (req, res) {
  res.render("qr.ejs"); 
});


app.use(cors())
const mongo_URI = 'mongodb+srv://SAC:G8BO4x3rWEDFSYqk@cluster0.btu1pyt.mongodb.net/hammer-users'
mongoose.connect(mongo_URI, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(result => {console.log('Connected To DB')})
  .catch(err => console.error(err))

server.listen(PORT,()=>{ console.log(`server started on ${PORT}`) })
 


io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Join a room based on user-specific data (e.g., user ID)
  const userId = socket.id  // Replace with the actual user ID
  socket.join(userId);

  socket.on('getAll' ,(e) => {
    async function asyncCall() {
      const result = await User.find( { "isAttended": false })
      .skip((e-1) * 120)
      .limit(120)
      io.emit('userList', result)
    }
    asyncCall();
  })

  socket.on('welcomeUserOne' , (e) => {
    console.log(e);
    async function asyncCall() {
      await User.updateOne({"uniqueCode":e},{$set: {"isAttended":true}})
      io.emit('welcomeOne')
    }
    asyncCall();
  })

  socket.on('getUserOne' , (e) => {
    console.log(e);
    async function asyncCall() {
      const result = await User.findOne( {"isAttended":true, "uniqueCode": e } )
      if(result.count < 4){
        var c = result.count
        await User.updateOne({"uniqueCode":e},{$set: {"count":c+1}})
        let cc = await User.findOne( { "uniqueCode": e } )
        console.log(cc.count);
        io.emit('showCount',cc.count)
      }
      if(result.count == 4){
        io.emit('over')
      }
    }
    asyncCall();
  })
  
  socket.on('saveData',(e) => {
    console.log('user', e);
    var email = e.email
    // const email = User.find( {"email":e.email} )
    // const phone = User.find( {"phone":e.phone} )
    // if(email ||phone ){
    //   console.log('yess exist');
    //   io.emit('error')
    //   return
    // }
    // else{
      function generateQRCode(data) {
        const qrCode = qr.imageSync(data, { type: 'png', size: 10 });
        const base64QRCode = qrCode.toString('base64');
        let fd = {
          base64QRCode:base64QRCode,
          data:data,
          email:email
        }
        io.to(userId).emit("saveQr",fd)
        }
      var data = `DBSI${Date.now()}`;
      generateQRCode(data);
      console.log(`Generated QR Code ${data}`);
      const user = new User({
        name: e.name,
        email: e.email,
        phone: e.phone,
        company: e.company,
        uniqueCode:data
      });
      user.save()
        .then(savedUser => {
          console.log('User saved:', savedUser);
          
        })
        .catch(error => {
          console.error('Error saving user:', error);
        });
            
    })

    socket.on('sendEmail', (e) => {
      console.log(e);
      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        secure: true,
        auth: {
            user: "craftech360@gmail.com",
            pass: "zfjdfqsspfoiqast"
        },
      })
      let mailOptions;
      mailOptions = {
        from: '"Craftech360" <accounts@craftech360.com>', // sender address
        to: "", // list of receivers
        subject: "Leave an impression behind with every interaction!", // Subject line
        html: `<h1>Here is your QR Code ${e.url}</h1>`
      };
      mailOptions.to = e.email;
        transporter.sendMail(mailOptions, (err, info) => {
          if(err) {
            return console.error(err)
          }
          console.log("message sent:", info.messageId)
        })
    })
});