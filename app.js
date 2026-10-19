pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];let chosenFile=null, pdfDoc=null,pdfBytes=null,pdfName="document.pdf",pageNum=1,zoomScale=1,marks={},toolMode="select",ink="#ff7417",inkWidth=3,stroke=null,drawing=false,textPoint=null,toastTimer;
function notify(s){const t=$("#toast");t.textContent=s;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
$("#theme").onclick=()=>{document.body.classList.toggle("light");$("#theme").textContent=document.body.classList.contains("light")?"☾":"☼"};
const fileInput=$("#fileInput");
function pickFile(){fileInput.click()}
$("#browse").onclick=pickFile;$("#headerUpload").onclick=pickFile;
$("#dropZone").addEventListener("click",e=>{if(e.target.id!=="browse")pickFile()});
$("#dropZone").addEventListener("dragover",e=>{e.preventDefault();$("#dropZone").classList.add("drag")});
$("#dropZone").addEventListener("dragleave",()=>$("#dropZone").classList.remove("drag"));
$("#dropZone").addEventListener("drop",e=>{e.preventDefault();$("#dropZone").classList.remove("drag");const f=e.dataTransfer.files[0];if(f)selectFile(f)});
fileInput.addEventListener("change",e=>{if(e.target.files[0])selectFile(e.target.files[0]);fileInput.value=""});
async function selectFile(f){chosenFile=f;$("#selectedFile").hidden=false;$("#selectedFile").textContent="▤ "+f.name+" · "+formatBytes(f.size);$("#fromFormat").value="auto";$("#convertHint").textContent="Dosya hazır. Çıktı formatını seçip dönüştür.";if(f.type==="application/pdf"||f.name.toLowerCase().endsWith(".pdf"))loadPdf(f)}
function formatBytes(n){if(n<1024)return n+" B";if(n<1048576)return (n/1024).toFixed(1)+" KB";return (n/1048576).toFixed(1)+" MB"}
function ext(f){return f.name.split(".").pop().toLowerCase()}
$$(".quick-card").forEach(b=>b.onclick=()=>{$("#toFormat").value=b.dataset.target;$("#convert").scrollIntoView({behavior:"smooth"});if(!chosenFile)pickFile();else notify("Çıktı formatı: "+b.dataset.target.toUpperCase())});
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function safeBase(name){return name.replace(/\.[^.]+$/,"").replace(/[^\w\-ğüşöçıİĞÜŞÖÇ ]/g,"_")}
function canvasToBlob(canvas,type,quality){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Görsel oluşturulamadı")),type,quality))}
$("#convertButton").onclick=async()=>{
 if(!chosenFile){notify("Önce bir dosya seç.");pickFile();return}
 const target=$("#toFormat").value,source=ext(chosenFile),base=safeBase(chosenFile.name),f=chosenFile;
 $("#convertButton").disabled=true;$("#convertButton").textContent="Dönüştürülüyor…";
 try{
  if(["png","jpg","webp"].includes(target)){
   let dataURL;
   if(source==="pdf"){
    const doc=await pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;const page=await doc.getPage(1),vp=page.getViewport({scale:2});const c=document.createElement("canvas");c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;dataURL=c.toDataURL(target==="jpg"?"image/jpeg":"image/"+target,.92);
   }else if(["png","jpg","jpeg","webp","svg"].includes(source)){
    dataURL=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;const ctx=c.getContext("2d");if(target==="jpg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height)}ctx.drawImage(img,0,0);resolve(c.toDataURL(target==="jpg"?"image/jpeg":"image/"+target,.92))};img.onerror=()=>reject(new Error("Görsel açılamadı"));img.src=source==="svg"?URL.createObjectURL(f):URL.createObjectURL(f)});
   }else throw new Error("Bu kaynak türünden görsel çıktısı desteklenmiyor.");
   const blob=await (await fetch(dataURL)).blob();downloadBlob(blob,base+"."+target);notify("Dönüştürme tamamlandı.");
  }else if(target==="pdf"){
   if(["png","jpg","jpeg","webp"].includes(source)){
    const {PDFDocument}=PDFLib;const doc=await PDFDocument.create(),bytes=await f.arrayBuffer();let img;if(source==="png")img=await doc.embedPng(bytes);else img=await doc.embedJpg(bytes);const p=doc.addPage([img.width,img.height]);p.drawImage(img,{x:0,y:0,width:img.width,height:img.height});downloadBlob(new Blob([await doc.save()],{type:"application/pdf"}),base+".pdf");
   }else if(source==="txt"||source==="html"){
    const text=await f.text();const {jsPDF}=window.jspdf;const pdf=new jsPDF();const lines=pdf.splitTextToSize(text,180);let y=15;for(const line of lines){if(y>280){pdf.addPage();y=15}pdf.text(line,15,y);y+=6}downloadBlob(pdf.output("blob"),base+".pdf");
   }else if(source==="pdf"){downloadBlob(new Blob([await f.arrayBuffer()],{type:"application/pdf"}),base+".pdf")}
   else throw new Error("Bu dosya türünden PDF oluşturma desteklenmiyor.");
   notify("PDF oluşturuldu.");
  }else if(target==="txt"){
   if(source==="txt"){downloadBlob(new Blob([await f.arrayBuffer()],{type:"text/plain"}),base+".txt")}
   else if(source==="html"){const doc=new DOMParser().parseFromString(await f.text(),"text/html");downloadBlob(new Blob([doc.body.innerText||doc.documentElement.innerText],{type:"text/plain;charset=utf-8"}),base+".txt")}
   else if(source==="pdf"){const doc=await pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;let all="";for(let i=1;i<=doc.numPages;i++){const p=await doc.getPage(i),content=await p.getTextContent();all+=content.items.map(x=>x.str).join(" ")+"\n\n"}downloadBlob(new Blob([all],{type:"text/plain;charset=utf-8"}),base+".txt")}
   else throw new Error("Bu dosya türünden TXT çıktısı desteklenmiyor.");
   notify("TXT dosyası hazır.");
  }else if(target==="html"){
   if(source==="txt"){const text=await f.text();const esc=text.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));downloadBlob(new Blob(["<!doctype html><meta charset=utf-8><pre>"+esc+"</pre>"],{type:"text/html;charset=utf-8"}),base+".html")}
   else if(source==="html"){downloadBlob(new Blob([await f.arrayBuffer()],{type:"text/html"}),base+".html")}
   else throw new Error("HTML çıktısı için TXT veya HTML dosyası seç.");
   notify("HTML dosyası hazır.");
  }else throw new Error("Bu dönüşüm henüz desteklenmiyor.");
  $("#convertHint").textContent="İşlem tamamlandı. İndirilen dosyanı kontrol edebilirsin.";
 }catch(e){console.error(e);notify(e.message||"Dönüştürme başarısız.");$("#convertHint").textContent=e.message||"Bu dönüşüm desteklenmiyor."}
 finally{$("#convertButton").disabled=false;$("#convertButton").innerHTML='Dönüştür <span>↗</span>'}
};
// PDF editing
const pc=$("#pdfCanvas"),mc=$("#markCanvas"),pctx=pc.getContext("2d"),mctx=mc.getContext("2d"),pdfStage=$("#pdfStage"),pdfPage=$("#pdfPage");
$("#pdfOpen").onclick=pickFile;$("#pdfWelcomeOpen").onclick=pickFile;
async function loadPdf(file){try{pdfName=file.name;pdfBytes=await file.arrayBuffer();pdfDoc=await pdfjsLib.getDocument({data:new Uint8Array(pdfBytes.slice(0))}).promise;pageNum=1;zoomScale=1;marks={};$("#pdfWelcome").hidden=true;pdfPage.hidden=false;$("#pdfName").textContent=pdfName;$("#pdfMeta").textContent=pdfDoc.numPages+" sayfa · PDF belgesi";await renderPdfPage();notify("PDF çalışma alanında açıldı.");}catch(e){notify("PDF açılamadı.");console.error(e)}}
async function renderPdfPage(){if(!pdfDoc)return;pageNum=Math.min(pdfDoc.numPages,Math.max(1,pageNum));const p=await pdfDoc.getPage(pageNum),base=p.getViewport({scale:1}),fit=Math.min((pdfStage.clientWidth-40)/base.width,(pdfStage.clientHeight-35)/base.height,1.35),vp=p.getViewport({scale:fit*zoomScale});pc.width=mc.width=Math.floor(vp.width);pc.height=mc.height=Math.floor(vp.height);pdfPage.style.width=pc.width+"px";pdfPage.style.height=pc.height+"px";await p.render({canvasContext:pctx,viewport:vp}).promise;drawMarks();$("#pageLabel").textContent=pageNum+" / "+pdfDoc.numPages;$("#zoom").textContent=Math.round(zoomScale*100)+"%";$("#pdfStatus").textContent="Sayfa "+pageNum+" · İşaretler dışa aktarmaya hazır"}
function currentMarks(){return marks[pageNum]||(marks[pageNum]=[])}
function drawMarks(){mctx.clearRect(0,0,mc.width,mc.height);for(const a of marks[pageNum]||[]){if(a.type==="text"){mctx.fillStyle=a.color;mctx.font=`${a.size*4}px Arial`;mctx.textBaseline="top";String(a.text).split("\n").forEach((line,i)=>mctx.fillText(line,a.x*mc.width,a.y*mc.height+i*a.size*5))}else if(a.points?.length){mctx.save();mctx.strokeStyle=a.color;mctx.lineWidth=a.type==="highlight"?Math.max(12,a.size*5):a.size*2;mctx.globalAlpha=a.type==="highlight"?.34:1;mctx.lineCap="round";mctx.lineJoin="round";mctx.beginPath();mctx.moveTo(a.points[0][0]*mc.width,a.points[0][1]*mc.height);a.points.slice(1).forEach(pt=>mctx.lineTo(pt[0]*mc.width,pt[1]*mc.height));if(a.points.length===1)mctx.lineTo(a.points[0][0]*mc.width+.1,a.points[0][1]*mc.height+.1);mctx.stroke();mctx.restore()}}}
function setTool(m){toolMode=m;$$(".edit-tool[data-mode]").forEach(b=>b.classList.toggle("active",b.dataset.mode===m));pdfPage.className="pdf-page"+(m!=="select"?" mode-"+m:"");if(m==="text")notify("Metin eklemek için PDF sayfasına tıkla.");}
$$(".edit-tool[data-mode]").forEach(b=>b.onclick=()=>setTool(b.dataset.mode));
$("#pdfColor").oninput=e=>ink=e.target.value;$("#pdfSize").oninput=e=>{inkWidth=+e.target.value;$("#pdfSizeValue").textContent=inkWidth+" px"};
function markPoint(e){const r=mc.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}}
mc.addEventListener("pointerdown",e=>{if(!pdfDoc)return;const p=markPoint(e);if(toolMode==="text"){textPoint=p;$("#textBox").hidden=false;$("#textBox").style.left=Math.min(p.x*mc.clientWidth,mc.clientWidth-225)+"px";$("#textBox").style.top=Math.min(p.y*mc.clientHeight,mc.clientHeight-115)+"px";$("#markText").value="";$("#markText").focus()}else if(toolMode==="draw"||toolMode==="highlight"){drawing=true;mc.setPointerCapture(e.pointerId);stroke={type:toolMode==="draw"?"stroke":"highlight",color:ink,size:inkWidth,points:[[p.x,p.y]]};currentMarks().push(stroke);drawMarks()}else if(toolMode==="erase"){const a=currentMarks();if(a.length){a.pop();drawMarks()}}});
mc.addEventListener("pointermove",e=>{if(drawing&&stroke){const p=markPoint(e);stroke.points.push([p.x,p.y]);drawMarks()}});function end(){drawing=false;stroke=null}mc.addEventListener("pointerup",end);mc.addEventListener("pointercancel",end);
$("#applyMark").onclick=()=>{const text=$("#markText").value.trim();if(!text||!textPoint)return;currentMarks().push({type:"text",...textPoint,text,color:ink,size:inkWidth});$("#textBox").hidden=true;drawMarks();$("#pdfStatus").textContent="Metin eklendi"};$("#cancelMark").onclick=()=>{$("#textBox").hidden=true;textPoint=null};
$("#prev").onclick=()=>{if(pageNum>1){pageNum--;renderPdfPage()}};$("#next").onclick=()=>{if(pdfDoc&&pageNum<pdfDoc.numPages){pageNum++;renderPdfPage()}};$("#plus").onclick=()=>{zoomScale=Math.min(2.5,zoomScale+.1);renderPdfPage()};$("#minus").onclick=()=>{zoomScale=Math.max(.5,zoomScale-.1);renderPdfPage()};
$("#clearMarks").onclick=()=>{if(!pdfDoc){notify("Önce PDF aç.");return}if(confirm("Tüm eklenen işaretleri silmek istiyor musun?")){marks={};drawMarks();notify("İşaretler temizlendi.")}};
$("#savePdf").onclick=async()=>{if(!pdfDoc||!pdfBytes){notify("Önce PDF aç.");return}try{const {PDFDocument,rgb,StandardFonts}=PDFLib;const doc=await PDFDocument.load(pdfBytes.slice(0));const font=await doc.embedFont(StandardFonts.Helvetica);for(const [key,list] of Object.entries(marks)){const page=doc.getPages()[+key-1];if(!page)continue;const {width,height}=page.getSize();for(const a of list){const hex=a.color,r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;if(a.type==="text"){const size=Math.max(8,a.size*4);String(a.text).split("\n").forEach((line,i)=>page.drawText(line,{x:a.x*width,y:height-a.y*height-size*(i+1),size,font,color:rgb(r,g,b),maxWidth:width-a.x*width-10}))}else if(a.points){for(let i=1;i<a.points.length;i++){const x=a.points[i-1],y=a.points[i];page.drawLine({start:{x:x[0]*width,y:height-x[1]*height},end:{x:y[0]*width,y:height-y[1]*height},thickness:a.type==="highlight"?Math.max(7,a.size*5):Math.max(1,a.size*2),color:rgb(r,g,b),opacity:a.type==="highlight"?.34:1})}}}}downloadBlob(new Blob([await doc.save()],{type:"application/pdf"}),safeBase(pdfName)+"_fox-duzenlendi.pdf");$("#pdfStatus").textContent="Düzenlenmiş PDF indirildi";notify("Düzenlenmiş PDF indirildi.")}catch(e){console.error(e);notify("PDF dışa aktarılamadı. Dosya korumalı olabilir.")}};
window.addEventListener("resize",()=>{if(pdfDoc)renderPdfPage()});document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="o"){e.preventDefault();pickFile()}if(e.key==="Escape")$("#textBox").hidden=true});
