/* SCHICHTSYSTEM */

function getActiveShift(){
return JSON.parse(localStorage.getItem("activeShift"));
}

function startShift(){
let shift={start:new Date().toLocaleString(),total:0,items:{}};
localStorage.setItem("activeShift",JSON.stringify(shift));
document.getElementById("shiftScreen").classList.remove("active");
document.getElementById("tableScreen").classList.add("active");
loadTables();
}

function recordSale(item){
let shift=getActiveShift();
if(!shift) return;
shift.total+=item.price;
if(!shift.items[item.name]) shift.items[item.name]=0;
shift.items[item.name]++;
localStorage.setItem("activeShift",JSON.stringify(shift));
}

function endShift(){
let shift=getActiveShift();
if(!shift) return;

shift.end=new Date().toLocaleString();

let history=JSON.parse(localStorage.getItem("shiftHistory"))||[];
history.push(shift);
localStorage.setItem("shiftHistory",JSON.stringify(history));

let text="SCHICHTBERICHT\n\nGesamtumsatz: "+shift.total+"$\n\n";
for(let i in shift.items){
text+=i+" : "+shift.items[i]+"x\n";
}

alert(text);
localStorage.removeItem("activeShift");
tables.forEach(t=>localStorage.removeItem("table_"+t));
location.reload();
}

/* HISTORIE */
function showShiftHistory(){
let history=JSON.parse(localStorage.getItem("shiftHistory"));
if(!history){alert("Keine alten Schichten");return;}
let text="ALTE SCHICHTEN\n\n";
history.forEach((s,i)=>{
text+="Schicht "+(i+1)+"\n"+s.start+" - "+s.end+"\nUmsatz: "+s.total+"$\n\n";
});
alert(text);
}

/* TISCHE */

const tables=["Bar","Tisch 1","Tisch 2","Tisch 3","Tisch 4","Terrasse 1","Terrasse 2"];

let currentTable=null;
let cart=[];

function loadTables(){
const div=document.getElementById("tables");
div.innerHTML="";
tables.forEach(t=>{
const btn=document.createElement("div");
btn.className="table";
let saved=localStorage.getItem("table_"+t);
btn.innerText=saved? t+"\n("+JSON.parse(saved).name+")":t;
btn.onclick=()=>openTable(t);
div.appendChild(btn);
});
}

function openTable(t){
currentTable=t;
let saved=localStorage.getItem("table_"+t);
if(saved){
cart=JSON.parse(saved).cart;
document.getElementById("tableName").innerText=t+" - "+JSON.parse(saved).name;
}else{
let name=prompt("Name für den Tisch:");
cart=[];
document.getElementById("tableName").innerText=t+" - "+name;
localStorage.setItem("table_"+t,JSON.stringify({name:name,cart:[]}));
}
document.getElementById("tableScreen").classList.remove("active");
document.getElementById("posScreen").classList.add("active");
loadCategories();
renderCart();
}

function saveOrder(){
localStorage.setItem("table_"+currentTable,JSON.stringify({
name:document.getElementById("tableName").innerText.split("-")[1],
cart:cart
}));
}

function backToTables(){
saveOrder();
document.getElementById("posScreen").classList.remove("active");
document.getElementById("tableScreen").classList.add("active");
loadTables();
}

/* PRODUKTE */

const menu={
"Speisen":[
{name:"Empanadas (veggie)",price:8},
{name:"Tacos",price:12},
{name:"Schaschlik",price:15},
{name:"Ceviche",price:20}
],
"Hauseigene Drinks":[
{name:"Chicha Morada",price:8},
{name:"Sandy Kiss",price:10},
{name:"Vespucci Sunrise",price:15},
{name:"Emerald Wave",price:18},
{name:"Firecracker",price:20}
],
"Cocktails":[
{name:"Piña Colada",price:15},
{name:"Tequila Sunrise",price:15},
{name:"Mojito",price:15},
{name:"Cuba Libre",price:15},
{name:"Whiskey Cola",price:18}
],
"Bier":[
{name:"Cerveza Barracho",price:10},
{name:"Cervila",price:12}
],
"Spirituosen":[
{name:"Gin",price:10},
{name:"Rum",price:10},
{name:"Vodka",price:10},
{name:"Whiskey",price:15},
{name:"Tequila",price:10}
]
};

function loadCategories(){
const catDiv=document.getElementById("categories");
catDiv.innerHTML="";
Object.keys(menu).forEach(cat=>{
const btn=document.createElement("button");
btn.innerText=cat;
btn.onclick=()=>loadProducts(cat);
catDiv.appendChild(btn);
});
}

function loadProducts(category){
const prodDiv=document.getElementById("products");
prodDiv.innerHTML="";
menu[category].forEach(item=>{
const btn=document.createElement("button");
btn.className="product";
btn.innerText=item.name+" - "+item.price+"$";
btn.onclick=()=>{cart.push(item);renderCart();}
prodDiv.appendChild(btn);
});
}

/* WARENKORB */

function renderCart(){
const div=document.getElementById("cartItems");
div.innerHTML="";
let total=0;

cart.forEach((i,index)=>{
total+=i.price;
const d=document.createElement("div");
d.className="cart-item";
d.innerHTML=`${i.name} <span>${i.price}$</span>`;
d.onclick=()=>splitItem(index);
div.appendChild(d);
});

document.getElementById("total").innerText=total+" $";
}

function splitItem(index){
let item=cart[index];
if(confirm(item.name+" einzeln bezahlen?")){
recordSale(item);
cart.splice(index,1);
renderCart();
saveOrder();
}
}

function checkout(){
cart.forEach(item=>recordSale(item));
alert("Rechnung bezahlt!");
localStorage.removeItem("table_"+currentTable);
cart=[];
backToTables();
}

/* AUTO START */

window.onload=()=>{
let shift=getActiveShift();
if(shift){
document.getElementById("shiftScreen").classList.remove("active");
document.getElementById("tableScreen").classList.add("active");
loadTables();
}
};
