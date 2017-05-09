const Crawler = require("crawler");

// Thinky 是一个轻量级的 Node.js 的 ORM 框架，用于支持 RethinkDB 分布式数据库.
const thinky = require("thinky")({
  host : '127.0.0.1',
  port:28015,
  db:'bxt',
  authKey:""
});
const type = thinky.type;
const r = thinky.r;

const Post = thinky.createModel("post",{
  id:type.string(),
  url:type.string(),
  title:type.string(),
  tags:[type.string()],
  createAt:type.date().default(r.row)
})
Post.pre("save",function(next){
  next()
});

const cList = new Crawler({
  maxConnections: 5,
  callback: (err, res, done) => {
     if (err){
        console.log(err);
     }else {
        let $ = res.$;
        let aArr = $("a.news");
        
        aArr = Array.prototype.slice.call(aArr).map(item => {
          return {
              id: item.attribs.href,
              url: "http://www.china-insurance.com/news-center/" + item.attribs.href,
              title: item.children[0].data,
              tags: ["保险案例"]
            }
        });
        aArr = aArr.filter(item => item.url.indexOf("id") > -1)
        aArr.forEach((item) => {
          let post = new Post(item);
          post.save().then(res => {
            console.log("ok", res.id)
          })
        })
     }
     done();
  }
})

const urlQuery = "http://www.china-insurance.com/news-center/moreItem.asp?Subname=%B1%A3%CF%D5%B0%B8%C0%FD&Page=";
const uList = [];
for (let i =1; i<30; i++){
  uList.push(urlQuery + i);
}
cList.queue(uList);