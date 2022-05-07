//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URL,
{useNewUrlParser: true,
useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name:String
});                            //singular form of collection
  const Item  = mongoose.model('Item', itemsSchema);

  const item1  = new Item(
    {  name : "welcome"
    });
  const item2  = new Item(
      {  name : "click + to add"
      });
  const item3  = new Item(
        {  name : "click here to delete"
        });
 const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("success");
        }
      });
      res.redirect("/");
    }
    else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});


app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }else{
        //show exisiting
  res.render("list", {listTitle: customListName , newListItems: foundList.items});
      }
    }
  });

});


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item  = new Item(
    {  name : itemName
    });
    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });

    }
});

app.post("/delete", function(req, res){
     const checkedId = req.body.checkbox;
     const listName = req.body.listName;
     if(listName === "Today"){
       Item.findByIdAndRemove(checkedId,function(err){
         if(!err){
            console.log("successfully");
            res.redirect("/");
          }
       });
     }else{
       List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,foundList){
         if(!err){
           res.redirect("/"+listName);
      }
       });
     }

});

app.listen(8000, function() {
  console.log('listening in port 8000');
});
