
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
    var timer = 7
    var cleartime = setInterval(
        function (){
        timer--
        if(timer == 0){
            clearInterval(cleartime)
            document.getElementById('msg').style.display = 'none'
            document.getElementById('preview').style.display = 'block'
            document.getElementById('start').style.display = 'block'
        }
    }
    ,1000)
})