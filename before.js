const http = require('http')
 const fs = require('fs')
 const url = require('url')
 const qs = require('querystring');

 function templateList(filelist){
     let list = '<ul>';
     for(let i=0; i<filelist.length; i++) {
         list += `<li> <a href="/?id=${filelist[i]}"> ${filelist[i]} </a> </li>`;
    }
     list += '</ul>';
    return list;
 }
 function templateHTML(title, list, body, control){
     return `
           <!doctype html>
           <html lang="ko">
           <head>
             <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
          </head>
           <body>
             <h1><a href="/">WEB</a></h1>
             ${list}
            <h2>${title}</h2>
            ${control}
             <p>${body}</p>
           </body>
           </html>
           `
 }

 const app = http.createServer(function (request, response) {
     const _url = request.url
     const queryData = url.parse(_url, true).query
     const pathname = url.parse(_url, true).pathname
     if (pathname === '/') {
         if (queryData.id === undefined) {
             const title = 'Welcome'
             const description = 'Hello, Node.js'
             fs.readdir('data/', function (err, data) {
                 const list = templateList(data);
                 const template = templateHTML(title, list, description, `<a href="create">create</a>`);

                 response.writeHead(200)
                 response.end(template)
             })
         } else {
             fs.readdir('data/', function (err, data) {
                 let list = '<ul>';
                 for (let i = 0; i < data.length; i++) {
                     list += `<li> <a href="/?id=${data[i]}"> ${data[i]} </a> </li>`;
                 }
                 list += '</ul>';

                 fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
                     const title = queryData.id
                     //메인 화면에서는 create(새 게시글 작성)만 가능하게
                     const template = templateHTML(title, list, description,
                         `<a href="create">create</a> <a href="/update?id=${title}">update</a>
                                 <form action="delete_process" method="post">
                                     <input type="hidden" name="id" value="${title}">
                                     <input type="submit" value="delete">
                                 </form>`);
                     response.writeHead(200)
                     response.end(template)
                 })
             });
         }
     }
     else if(pathname === '/create'){
         fs.readdir('data/', function(err, data){
             const title = 'Web - create';
             const list = templateList(data);
             //특정 게시글을 읽고 있을땐 create(게시글 생성)과 update(수정)을 보이게
             const template = templateHTML(title, list, `
                 <form action="create_process" method="post">
                     <p><input type="text" name="title" placeholder="title"/></p>
                     <p><textarea  name="description" placeholder="description"></textarea></p>
                     <p><input type="submit"/></p>
                 </form>`, '') //글생성 중에는 create,update가 안나오게
             response.writeHead(200);
             response.end(template);
         })
     }else if (pathname === '/create_process') {
         let body = '';
         request.on('data', function (data) {
             body += body + data;
         });
         request.on('end', function () {
             const post = qs.parse(body);
             const title = post.title; //바꾸기전의 파일 이름(게시글 제목)
             const description = post.description; //바꾼 이후의 파일이름(게시글 제목)
             fs.writeFile(`data/${title}`, description, 'utf-8', function (err) {
             })
             response.writeHead(302, {Location: `/?id=${title}`});
             response.end();
         })
     }else if(pathname === '/update'){
         //data: 실제 파일리스트 문자열들의 배열(파일이름은 게시글의 제목)
         fs.readdir('data', function(err, data){
             //description: ㅍㅏ일안의 내용물(게시글의 내용)
             fs.readFile(`data/${queryData.id}`,'utf-8',function (err, description){
                 const title = queryData.id;
                 const list = templateList(data);
                 //특정 게시글을 읽고 있을땐 create(게시글 생성)과 update(수정)을 보이게
                 const template = templateHTML(title, list, `
                             <form action="update_process" method="post">
                             <input type="hidden" name="id" value="${title}">
                                 <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
                                 <p><textarea  name="description" placeholder="description">${description}</textarea></p>
                                 <p><input type="submit"/></p>
                             </form>`, `<a href="create">create</a> <a href="/update?id=${title}">update</a>`) //글생성 중에는 create,update가 안나오게
                 response.writeHead(200);
                 response.end(template);
             })
         });
     }
     else if (pathname === '/update_process') {
         let body = '';
         request.on('data', function (data) {
             body += body + data;
         });
         request.on('end', function () {
             const post = qs.parse(body);
             const id = post.id;
             const title = post.title;
             const description = post.description;
             fs.rename(`data/${id}`, `data/${title}`, function (err) {
                 fs.writeFile(`data/${title}`, description, 'utf-8', function (err) {
                 response.writeHead(302, {Location: `/?id=${title}`});
                 response.end();
                 })
             })
         });
     }
     else if (pathname === '/delete_process') {
         let body = '';
         request.on('data', function (data) {
             body += body + data;
         });
         request.on('end', function () {
             const post = qs.parse(body);
             const id = post.id;     //게시글 제목
             fs.unlink(`data/${id}`, function(err){
                 response.writeHead(302, {Location: '/'});
                 response.end();
             });
         });
     }
     else {
         response.writeHead(404)
         response.end('Not found')
     }
 })
 app.listen(3333)