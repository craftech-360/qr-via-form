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
  attachments: [
    {
        filename: 'final.jpg', // <= Here: made sure file name match
        path: path.join(__dirname, './public/final/final.jpg'), // <= Here
    }
]
};

io.on('connection', (socket) => {
  console.log('a user connected');
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

  socket.on('sendEmail',(e) => {
    console.log('user', e);
    function generateQRCode(data, outputPath) {
      const qrCode = qr.imageSync(data, { type: 'png', size: 10 });
      fs.writeFileSync(outputPath, qrCode);
    }
    var data = `DBSI${Date.now()}`;
    const outputPath = `./asset/newOne/${data}.png`;
    generateQRCode(data, outputPath);
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
});