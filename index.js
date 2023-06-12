const express = require('express'),
      mongoose = require('mongoose'),
      cors = require('cors'),
      PORT = 3000,
      User = require('./models/Customer'),
      path = require('path'),
      app = express(),
      fs = require('fs'),
      server = require("http").createServer(app),
      io = require("socket.io")(server),
      csvtojson = require('csvtojson'),
      qr = require('qr-image'),
      nodemailer = require('nodemailer'),
      md5 = require("md5");

app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile)
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true,limit: '50mb'}));
app.use('/asset', express.static(path.join(__dirname, 'asset')))
app.use(cors())

app.get('/', function (req, res) {
  res.render("dashboard.ejs");
});
app.get('/home', function (req, res) {
  res.render("home.ejs");
});
app.get('/welcome', function (req, res) {
  res.render("welcome.ejs"); 
});
app.get('/qr', function (req, res) {
  res.render("qr.ejs"); 
});

const mongo_URI = 'mongodb+srv://SAC:G8BO4x3rWEDFSYqk@cluster0.btu1pyt.mongodb.net/hammer-users';

mongoose.connect(mongo_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log('Connected to the MongoDB database');
  })
  .catch(error => {
    console.error('Error connecting to the MongoDB database:', error);
  });
  
server.listen(PORT,() =>{ console.log(`server started on ${PORT}`) })

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);
  const userId = socket.id 
  socket.join(userId);

  socket.on('getAll' ,(e) => {
    async function asyncCall() {
      const result = await User.find()
      .skip((e-1) * 120)
      .limit(120)
      io.emit('userList', result)
    }
    asyncCall();
  })

  socket.on('welcomeUserOne' , (e) => {
    console.log(e);
    async function asyncCall() {
      const result = await User.findOne( { "uniqueCode": e } )
      await User.updateOne({"uniqueCode":e},{$set: {"isAttended":true}})
      io.emit('welcomeOne',result.name)
      let details = {
        email:result.email,
        name:result.name
      }
      io.emit('welcomeEmail',details)
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
    var name = e.name
    // const isEmailExist = User.findOne( {"email":e.email} )
    // console.log(isEmailExist,"ee");
    // if(isEmailExist.email == email){
    //   console.log('yess exist');
    //   let removeEmail = {
    //     name:e.name,
    //     email:'',
    //     phone:e.phone,
    //     company:e.company
    //   }
    //   io.emit('error',removeEmail)
    //   return
    // }
    // else{
      function generateQRCode(data) {
        const qrCode = qr.imageSync(data, { type: 'png', size: 10 });
        const base64QRCode = qrCode.toString('base64');
        let fd = {
          base64QRCode:base64QRCode,
          data:data,
          email:email,
          name:name
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
      // }       
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
        subject: "Simplify Event Registration with Our QR Code Application", // Subject line
        html: `  <body style="width: 100vw;height: 100vh;display: flex;justify-content: center; align-items: center;">
        <div style=" border: 2px solid black; text-align:left; width: 50vw; height:50vh;letter-spacing: 1px; padding: 20px 20px; word-wrap: break-word;@media(min-width: 768px) {
          width: 80vw;
          height: auto;
          border: 2px solid white;
        }">
        <p>Dear ${e.name},</p>
        <p>Thank you for exploring our QR code registration application! We appreciate your interest in simplifying event registration and enhancing attendee experiences.</p>
        <p>Our company, Craftech360, is dedicated to revolutionizing the event industry through innovative technology solutions. With a passion for creating seamless and engaging experiences, we have developed a cutting-edge QR code registration application that streamlines the check-in process, eliminates physical tickets, and ensures a hassle-free registration experience.</p>
        <p>To give you a firsthand experience of the convenience and efficiency our application offers, we invite you to try our demo by accessing the following QR code link: <a href="${e.url}">Click here</a>.</p>
        <p>By leveraging the power of QR codes, we enable event organizers like you to deliver a seamless registration process and create memorable events that leave a lasting impression on attendees.</p>
        <p>Should you have any questions or require further assistance, please feel free to reach out. We are here to support you and ensure your events are a resounding success.</p>
        <p>Thank you once again for your interest and trust in our QR code registration application.</p.
        <p>Warm regards,</p>
        <p>Pradeep Zille </p>
        <p>Co-founder and CBO</p>
        <p>Craftech360</p>
        </div>
    <body>
        `
      };
      mailOptions.to = e.email;
        transporter.sendMail(mailOptions, (err, info) => {
          if(err) {
            return console.error(err)
          }
          console.log("message sent:", info.messageId)
        })
    })

    socket.on('sendWelcomeEmail', (e) => {
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
        subject: "Thank You for Trying Our QR Code Demo", // Subject line
        html: `<p>Dear ${e.name},</p>
        <p>We wanted to express our heartfelt gratitude for trying out our QR code registration demo. As India's leading tech experiential marketing company, Craftech 360 is dedicated to delivering innovative, interactive, and immersive experiences that captivate audiences.</p>
        <p>We take immense pride in our team of passionate engineers and tech makers who bring a unique engineering mindset to every project. Their dedication and expertise have earned us prestigious awards and accolades in the industry.</p>
        <p>Your interest in our QR code application demonstrates your commitment to simplifying event registration and creating unforgettable experiences for attendees. We are thrilled to have the opportunity to support you in achieving these goals.</p>
        <p>Thank you once again for your time and support. We look forward to the possibility of collaborating with you and delivering exceptional event experiences together.</p>
        <p>Should you have any questions or require further assistance, please feel free to reach out. We are here to support you and ensure your events are a resounding success.</p>
        <p>Thank you once again for your interest and trust in our QR code registration application.</p.
        <p>Best regards,</p>
        <p>Pradeep Zille </p>
        <p>Co-founder and CBO</p>
        <p>Craftech360</p>
        `
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