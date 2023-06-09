
// QR Scanner Code
const socket = io();
let scanner = new Instascan.Scanner(
    {
        video: document.getElementById('preview')
    }
);
var a = [];
scanner.addListener('scan', function(content) {
   console.log(content)
   var a = content;
    socket.emit('welcomeUserOne',(content)); 
    document.getElementById('preview').style.display = 'none'  
    document.getElementById('container').style.display = 'block'  
    document.getElementById('scan').style.display = 'none'  
});

Instascan.Camera.getCameras().then(cameras => 
{
    if(cameras.length > 0){
        scanner.start(cameras[0]);
    } else {
        console.error("camera not started");
    }
});

socket.on('welcomeOne', (e) => {
    console.log(e);
    document.getElementById('container').style.display = 'none'  
    document.getElementById('msg').style.display = 'block'
    document.getElementById('scan').style.display = 'none'
    document.getElementById('name').innerText = e
    var timer = 7
    var cleartime = setInterval(
        function (){
        timer--
        if(timer == 0){
            clearInterval(cleartime)
            document.getElementById('msg').style.display = 'none'
            document.getElementById('preview').style.display = 'block'
            document.getElementById('scan').style.display = 'block'
        }
    }
    ,1000)
})

socket.on('welcomeEmail', (e) =>{
    socket.emit('sendWelcomeEmail', e)
})