
var img = document.getElementById('img')
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
    socket.emit('getUserOne',(content)); 
    document.getElementById('preview').style.display = 'none'  
    document.getElementById('scan').style.display = 'none'  
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
   
// Manual QR Enter
// let plzField = document.getElementById("btn2");
// plzField.addEventListener("click", function() {
//     let e = document.getElementById("qr").value
//     socket.emit('getUserOne',e);
// });  

socket.on('showCount', (e) => {
    console.log(e);
    document.getElementById('container').style.display = 'none' 
    document.getElementById('img').style.display = 'block' 
    img.src =`../asset/Screens/${e}.png`
    var timer = 7
    var cleartime = setInterval(
        function (){
        timer--
        if(timer == 0){
            clearInterval(cleartime)
            img.src = ''
            document.getElementById('img').style.display = 'none'
            document.getElementById('preview').style.display = 'block'
            document.getElementById('scan').style.display = 'block'  
        }
    }
    ,1000)
})


socket.on('over', () => {
    document.getElementById('container').style.display = 'none' 
    document.getElementById('img').style.display = 'block' 
    img.src =`../asset/Screens/5.png`
    var timer = 3
    var cleartime = setInterval(
        function (){
        timer--
        if(timer == 0){
            clearInterval(cleartime)
            img.src = ''
            document.getElementById('img').style.display = 'none'
            document.getElementById('preview').style.display = 'block'
        }
    }
    ,1000)
})
