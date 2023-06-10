var qrname
var useremail
var username
var spinner = document.getElementById('container')
document.getElementById('form').addEventListener('input', function() {
  var form = event.target.form;
  var emailInput = document.getElementById('email');
  var submitButton = document.getElementById('submitButton');

  if (emailInput.validity.valid) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
});


const socket = io()
function sendData(){
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;
  var phone = document.getElementById('phone').value;
  var company = document.getElementById('company').value;
  let data = {
    name:name,
    email:email,
    phone:phone,
    company:company
  }
  socket.emit('saveData', data)
  document.getElementById('error').style.display = 'none'
  name.value = ''
  email.value = ''
  phone.value = ''
  company.value = ''
  submitButton.disabled = true
  form.style.display = 'none'
  spinner.style.display = 'block'
  }
  const firebaseConfig = {
    apiKey: "AIzaSyBZnFJQJlCQEFdvmFLI0gkSCHHiH1lUAWo",
    authDomain: "node-file-uploader.firebaseapp.com",
    projectId: "node-file-uploader",
    storageBucket: "node-file-uploader.appspot.com",
    messagingSenderId: "345185058962",
    appId: "1:345185058962:web:8629baa36820a3c410a64b",
    measurementId: "G-GSV81VWQE1"
  };
  socket.on('saveQr', (e) => {
    qrname = e.data
    useremail = e.email
    username = e.name
    uploadImage(e.base64QRCode)
  })

  firebase.initializeApp(firebaseConfig);
  function uploadImage(your_base64_image) {
  const base64Data = your_base64_image.replace(/^data:image\/\w+;base64,/, '');

  const metadata = {
    contentType: 'image/jpeg', // Update the content type if needed (e.g., 'image/png')
  };

  firebase
    .storage()
    .ref('qrCodes')
    .child(`${qrname}`)
    .putString(base64Data, 'base64', metadata)
    .then((snapshot) => snapshot.ref.getDownloadURL())
    .then((url) => {
      let data = {
        url:url,
        email:useremail,
        name:username
      }
      socket.emit('sendEmail',data)
      useremail = ''
      spinner.style.display = 'none'
      document.getElementById('msg').style.display = 'block'
    })
    .catch(console.error);
}

function goToForm(){
  document.getElementById('msg').style.display = 'none'
  form.style.display = 'block'
}

socket.on('error', (e) => {
  submitButton.disabled = true
  form.style.display = 'block'
  document.getElementById('error').style.display = 'block'
  spinner.style.display = 'none'
  document.getElementById('email').value = ''
  document.getElementById('name').value = e.name
  document.getElementById('company').value = e.company
  document.getElementById('phone').value = e.phone
})