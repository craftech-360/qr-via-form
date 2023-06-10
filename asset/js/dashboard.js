const socket = io();
var btn = 1
function myFunction(){

    var email = document.getElementById("search").value
    if(!email){
        alert('please fill the input!')
        return
    }
    else{
        socket.emit('getEmails', email)
    }
}

function onLoad(){
    // location.reload()
    socket.emit('getAll',1)
}

function getPage(e){
    // location.reload()
    // alert(e)
    socket.emit('getAll',e)
    if(e == 1){
        btn = 1
    }
    if(e == 2){
        btn = 111
    }
    if(e == 3){
        btn = 221
    }
    if(e == 4){
        btn = 331
    }
    if(e == 5){
        btn = 441
    }
    if(e == 6){
        btn = 551
    }
    if(e == 7){
        btn = 661
    }
    if(e == 8){
        btn = 771
    }
    if(e == 9){
        btn = 881
    }
    if(e == 10){
        btn = 991
    }
}

socket.on('userList',(e) => {
    document.getElementsByTagName("table")[0].innerHTML= "<tr><th>"+`#`+"</th><th>"+`Name`+"</th><th>"+`Count`+"</th><th>"+`Code`+"</th><th>"+`Attended`+"</th></tr>"
    for (let i = 0; i < e.length; i++) {
        document.getElementsByTagName("table")[0].innerHTML+= "<tr><td>"+(i+btn)+"</td><td>"+e[i].name+"</td><td>"+e[i].count+"</td><td>"+e[i].uniqueCode+"</td><td>"+e[i].isAttended+"</td></tr>"
}
})