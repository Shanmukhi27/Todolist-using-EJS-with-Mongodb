

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


async function main(){
  try{
    // await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
    const password = encodeURIComponent("Shannu@9");
    const uri = "mongodb+srv://Shanmukhi:" + password + "@cluster0.59yfckg.mongodb.net/todolistDB";
       await mongoose.connect(uri);

    // await mongoose.connect("mongodb+srv://Shanmukhi:Shannu@9@cluster0.59yfckg.mongodb.net/todolistDB");
             console.log("Connected successfully to server");

  const itemsSchema={
    name:String
  };

  const Item=mongoose.model("Item",itemsSchema);

  const item1=new Item({
    name:"Welcome to you todolist!"
  })
  const item2=new Item({
    name:"Hit the + button to add a new item"
  })

  const item3=new Item({
    name:"<-- Hit this to delete an item"
  })

  const defaultItems=[item1,item2,item3];

  const listSchema={
    name:String,
    items:[itemsSchema]
  }

  const List=mongoose.model("List",listSchema);

 
  
 var items;
  
  async function find(){
   items=await Item.find();
  if(items.length === 0){
    await Item.insertMany(defaultItems);
    console.log("successfully added");
   
  }else{
    

    items.forEach(item=>{
      console.log(`Name: ${item.name}`);
    })
    
  }
    
}  
    
  
  

  async function findAndRenderItems(res) {
    try {
      const items = await Item.find();
      if (items.length === 0) {
        await Item.insertMany(defaultItems);
        console.log("Successfully added");
        res.redirect("/");
      } else {

        // items.forEach(item => {
        //   console.log(`Name: ${item.name}`);
        // });
        res.render("list", { listTitle: "Today", newListItems: items });
      }
  
     
    } catch (err) {
      console.log(err);
      
    }
  }

  async function DeleteItem(checkedItemId,res,listName){
       try{
       // console.log("del "+checkedItemId);
       if(listName==="Today"){
        await Item.findByIdAndRemove(checkedItemId);
        console.log("successfully deleted");
        res.redirect("/");
       
       }
       else{
        await  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
        res.redirect("/"+listName);
       }
      
       }catch(err){
        console.log(err);
       }
  }

  async function customList(customListName,res){
    try{
     const foundList=await List.findOne({name:customListName});
     if(!foundList){
       const list=new List({
      name:customListName,
      items:defaultItems
    })
    list.save();
    res.redirect("/"+customListName);
     }
     else{
      res.render("list", { listTitle:foundList.name, newListItems: foundList.items });
     }

    }catch(err){
      console.log(err);
    }
  }

  async function  findList(res,req){
    try{
      const itemName = req.body.newItem;
      const listName=req.body.list;
      const newItem = new Item({
        name: itemName
      });
      if(listName==="Today"){
        newItem.save().then(() => {
          res.redirect("/");
        });
      }
      else{
        var foundList=await List.findOne({name:listName});
        
         foundList.items.push(newItem);
         foundList.save();
         res.redirect("/"+listName);
      }
      
    }catch(err){
      console.log(err);
    }
   
  }
  
  app.get("/", function(req, res) {
    findAndRenderItems(res);
  });

  app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    
    customList(customListName,res );

    // const list=new List({
    //   name:customListName,
    //   items:defaultItems
    // })
    // list.save();

  })
  
  app.post("/", function(req, res) {
  
   
      findList(res,req);
   
  
   
   
  });

  app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    console.log(checkedItemId);
    DeleteItem(checkedItemId,res,listName);
    
  });

 
  
}catch(err){
    console.log(err);
  }
}

main().catch(console.error);



app.listen(3000, function() {
  console.log("Server started on port 3000");
});


