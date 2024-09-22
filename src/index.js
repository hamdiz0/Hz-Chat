import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

const chat = document.querySelector(".chat");
const log = document.querySelector(".log");
const boi = document.querySelector(".boi");
const send = document.querySelector(".sd");
let input = document.querySelector('.input');
const sout = document.querySelector('.sbtn');
const us = document.querySelector('.us');
const ubtn = document.querySelector('.ubtn');
const users = document.querySelector('.users');
const uploadbtn = document.querySelector('.upload');
const uploadfile = document.querySelector('#inf');
const pop1 = new Audio('pop1.mp3')
const pop2 = new Audio('pop2.mp3')
const pop3 = new Audio('pop3.mp3')
const plist = [pop1,pop2,pop3]



const firebaseConfig = {
  apiKey: "AIzaSyAr4sQmGni9XwA-SU3mLGsl0x_lFcVn7fE",
  authDomain: "chat-app-72443.firebaseapp.com",
  databaseURL: "https://chat-app-72443-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chat-app-72443",
  storageBucket: "chat-app-72443.appspot.com",
  messagingSenderId: "198310897605",
  appId: "1:198310897605:web:3ec18e7adfb0e159250dac",
  measurementId: "G-D8JN5T3V47"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();
const provider = new GoogleAuthProvider();


//pop up sign in 
if(log){
log.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log(`Welcome, ${user.displayName}!`);
      window.location.href='loged.html'
    })
    .catch((error) => {
      console.error(error.message);
    });
});
}
//sign out
if(sout){
sout.onclick = function(){
  off();
  signOut(auth)
  window.location.href='index.html'
}
window.addEventListener('unload', function (event) {
  off()
});
}
function off(){
  onAuthStateChanged(auth,user => {
    if(user){
      const userId = user.uid;
      const userName = user.displayName;
      const userPhotoURL = user.photoURL;
      const email = user.email;
      const userRef = ref(db, `users/${userId}`);
      set(userRef, {
        name: userName,
        photoURL: userPhotoURL,
        userid: userId,
        email: email, 
        state :"offline"
      });
    }
  })
}
// main boi
onAuthStateChanged(auth, (user) => {
  if (user) {
    let usermsg;
    const userName = user.displayName;
    const userPhotoURL = user.photoURL;
    const userId = user.uid;
    const email = user.email;
    const state = 'online';
    const pim = document.querySelector('.you');
    pim.style.backgroundImage=`url(${userPhotoURL})`
    userdata(userName,userPhotoURL,userId,email,state)
    // creating user list
    ulist(userId)
    usersearch()
    msgs("groupChat");
    // cheking if the input is valid and sending
    document.addEventListener('keydown',u=>{
      if (u.key == 'Enter'){sent()} 
    });

    if(send){send.onclick = function(){
      sent()
    }}

    function sent(){  
      const current = document.querySelector('.current')
      if (input.value != ''){
        if(current.lastChild.textContent == "groupChat"){
          usermsg = input.value
          sendMessage('groupChat',usermsg)
          plist[ Math.floor(Math.random()*3)].play()
          input.value = ''
        }else{
          usermsg = input.value
          let id=userId+'_'+current.lastChild.textContent
          sendMessage(`rooms/${id}/messages`,usermsg)
          msgs(`rooms/${id}/messages`)
          plist[ Math.floor(Math.random()*3)].play()
          input.value = ''
        }
      }else{
      return
    }
  }
  } else {
    if(chat){chat.innerHTML = "User is not signed in.";}
  }
}); 
// styling msgs
function style(ph,un,msg) {
  let cont;
  let img;
  let intxt;
  let tdiv;
  let nam;
  let text;
  img = document.createElement('img');
  img.src = ph
  img.classList.add('img')
  //text
  tdiv=document.createElement('div')
  intxt = document.createElement('p');
  text = document.createElement('div');
  nam = document.createElement('div');
  nam.textContent = un
  intxt.textContent = msg 
  tdiv.classList.add('tdiv')
  nam.classList.add('name')
  text.classList.add('text')
  intxt.classList.add('intxt')
  //container
  cont = document.createElement('div');
  cont.classList.add('msgcont')
  cont.classList.add('msg')
  tdiv.appendChild(text)
  tdiv.appendChild(img)
  text.appendChild(intxt)
  cont.appendChild(nam)
  cont.appendChild(tdiv)
  if(boi){ boi.appendChild(cont);}
}
function recstyle(ph,un,msg) {
  let cont;
  let img;
  let intxt;
  let tdiv;
  let nam;
  let text;
  
  img = document.createElement('img');
  img.src = ph
  img.classList.add('img')
  //text
  tdiv=document.createElement('div')
  intxt = document.createElement('p');
  text = document.createElement('div');
  nam = document.createElement('div');
  nam.textContent = un
  intxt.textContent = msg 
  nam.classList.add('namerec')
  text.classList.add('text')
  intxt.classList.add('intxt')
  text.classList.add('rtext')
  tdiv.classList.add('tdivrec')
  //container
  cont = document.createElement('div');
  cont.classList.add('msgrec')
  cont.classList.add('msg')
  tdiv.appendChild(img)
  tdiv.appendChild(text)
  text.appendChild(intxt)
  cont.appendChild(nam)
  cont.appendChild(tdiv)
  if(boi){boi.appendChild(cont)}
}
function stu(current,x){
  current.innerHTML=""
  const img = document.createElement('img');
  const na = document.createElement('p');
  const id = document.createElement('p');
  img.src=x.firstChild.src
  na.textContent=x.childNodes[1].textContent
  id.textContent=x.lastChild.textContent
  id.classList.add('em')
  na.classList.add('currentxt')
  img.classList.add('cimg')
  current.appendChild(img)
  current.appendChild(na)
  current.appendChild(id)
}
//creating user list in the database
function userdata(un, up, ui,em,st) {
  const userRef = ref(db, `users/${ui}`);
  set(userRef, {
    name: un,
    photoURL: up,
    userid: ui,
    email :em, 
    state :st
  });
}
//user list
function ulist(x) {
  // ref users in database
  const usersRef = ref(db, 'users');
  onValue(usersRef, (snapshot) => {
    if(us){us.innerHTML = ''; }
    const usersData = snapshot.val();
    const g=document.createElement('button')
    const gun = document.createElement('p');
    const gid = document.createElement('p');
    const gimg = document.createElement('img');
    g.classList.add('group','selec')
    gun.classList.add('uname')
    gimg.classList.add('uimg')
    gimg.classList.add('gimg')
    gid.classList.add('em')
    gun.textContent="Group Chat"
    gid.textContent="groupChat"
    gimg.src="group.png"
    if(us){us.appendChild(g);}
    g.appendChild(gimg)
    g.appendChild(gun)
    g.appendChild(gid)
    const group=document.querySelector('.group')
    if(group){
    group.onclick = function (){
      current.innerHTML=''
      ul.forEach(u => u.classList.remove('selec'))
      group.classList.add('selec')
      boi.innerHTML=''
      stu(current,group)
      msgs("groupChat")
    }
  }
    if (usersData) {
      for (const userId in usersData) {
        const user = usersData[userId];
        if(userId != x){
        const username = user.name;
        const userimg = user.photoURL;
        const uid = user.userid;
        const status = user.state;
        const ucont = document.createElement('button');
        const img = document.createElement('img');
        const un = document.createElement('p');
        const em = document.createElement('p');
        const state = document.createElement('p');
        state.classList.add('state')
        img.classList.add('uimg')
        un.classList.add('uname')
        ucont.classList.add('ucon')
        em.classList.add('em')
        img.src = userimg
        un.textContent = username
        em.textContent = uid
        if (status=="online"){
          state.textContent= "🟢"
        }else if(status=="offline"){
          state.textContent= "🔴"
        }
        ucont.appendChild(img)
        ucont.appendChild(un)
        ucont.appendChild(state)
        ucont.appendChild(em)
        if(us){us.appendChild(ucont);}
      }
    }
  }
    const ul=document.querySelectorAll('.ucon')

    const boi=document.querySelector('.boi')
    const current = document.querySelector('.current')
    ul.forEach(user=>{
      let rec=user.lastChild.textContent
      user.onclick=function(){
        ul.forEach(u => u.classList.remove('selec'))
        group.classList.remove('selec')
        user.classList.add('selec') 
        boi.innerHTML=""
        stu(current,user)
        rooms(x,rec)
        const ref = rooms(x,rec)
        msgs(`rooms/${ref}/messages`)
      }
    });
  });
}
// search
function usersearch() {
  const search = document.querySelector('.search');
  if(search){
  search.addEventListener('input', function () {
      const ul = document.querySelectorAll('.ucon');
      let regl = new RegExp(search.value.toLowerCase());
      ul.forEach(name => {
          if ( !regl.test(name.childNodes[1].textContent.toLowerCase()) ) {
              name.style.display = 'none';
          } else {
              name.style.display = 'grid';
          }
      });
  });
}
}
//pchat
function rooms(uid1,uid2) {
  const room = ref(db, `rooms/${uid1}_${uid2}/both`);
  set(room, {
    roomid  : uid1+'_'+uid2,
  });
  var rid = uid1+'_'+uid2
  return rid
}
function sendMessage(dbref,messagetxt) {
  const user = auth.currentUser;
  if (user) {
    const userId = user.uid;
    const userName = user.displayName;
    const userPhotoURL = user.photoURL;
    //ref the database
    const messagesRef = ref(db, dbref);
    // adding msgs
    const newMessageRef = push(messagesRef);
    set(newMessageRef, {
      sender: userId,
      name:userName,
      img : userPhotoURL,
      text: messagetxt,
      timestamp: new Date().getTime(),
    });
  } 
  if (user && dbref!='groupChat') {
    const revid = dbref.split('/')[1].split('_').reverse().join('_');
    const userId = user.uid;
    const userName = user.displayName;
    const userPhotoURL = user.photoURL;
    //ref the database
    const messagesRef = ref(db, `rooms/${revid}/messages`);
    // adding msgs
    const newMessagerec = push(messagesRef);
    set(newMessagerec, {
      sender: userId,
      name:userName,
      img : userPhotoURL,
      text: messagetxt,
      timestamp: new Date().getTime(),
    });
  } 
}
// retriving the msgs and styling 
function msgs(x){
  const messagesRef = ref(db,x);
  onValue(messagesRef, (snapshot) => {
  const messages = snapshot.val();
  if (messages) {
    if(boi){ boi.innerHTML = '';}
    const use = auth.currentUser.uid
    Object.keys(messages).forEach((messageId) => {
      const message = messages[messageId];
      const name = message.name;
      const text = message.text;
      const ph = message.img;
      const sender = message.sender;
      const cn = document.querySelectorAll('.msg');
      
      if (sender != use){
          if(x!="groupChat"){
            recstyle(ph,'',text)
            cn.forEach(e=>e.style.gridTemplateRows='none')
            cn.forEach(x=>x.firstChild.style.display='none')
        }else{
          recstyle(ph,name,text)
        }
      }else{
          if(x!="groupChat"){
            style(ph,'',text)
            cn.forEach(e=>e.style.gridTemplateRows='none')
            cn.forEach(e=>e.firstChild.style.display='none')
        }else{
          style(ph,name,text)
        }
      }
      if(boi){boi.scrollTop = boi.scrollHeight;}
    });
  } 
}); 
}
uploadfile.onchange=function(){
  const pop4 = new Audio('sfart.mp3')
  const img = document.createElement('img');
  img.src = URL.createObjectURL(uploadfile.files[0])  
  img.classList.add('upimg')
  pop4.play()
}
if(ubtn){
ubtn.onclick=function(){
  boi.innerHTML=''
  boi.appendChild(users)
  users.style.display='grid'
  users.style.height='94%'
}
}
