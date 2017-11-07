// loading modules
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');

// setting up express
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'static')));
// connecting to mongodb
mongoose.connect('mongodb://localhost/mongoose_pizzas');
// define mongoose schema
let Schema = mongoose.Schema;
var PizzaSchema = mongoose.Schema({
	name: {type: String, minlength: 4, presence: true},
	cheese: String,
	_user: {type: Schema.Types.ObjectId, ref: "User"}
})
var ChefSchema = mongoose.Schema({
	name: {type:String, presence: true},
	pizzas: [{type: Schema.Types.ObjectId, ref: "Pizza"}]
})

// register schemas into models
mongoose.model("Pizza", PizzaSchema);
mongoose.model("Chef", ChefSchema);
let Pizza = mongoose.model("Pizza");
let Chef = mongoose.model("Chef");
// routing

app.get('/', (req,res)=>{
	Chef.find({}).populate("pizzas").exec((err,chefs)=>{
		if(err){
			console.log("something went wrong");
			res.json(err);
		}else{
			console.log("got all chefs");
			res.render('index', {allChefs: chefs, errors:{}})
		}
	})
})

app.post('/chefs', (req,res)=>{
	let newChef = new Chef(req.body);
	newChef.save((err)=>{
		if(err){
			console.log("something went wrong");
			res.json(err);
		}else{
			console.log("Made a new chef.");
			res.redirect("/");
		}
	})
})

app.post('/pizzas', (req,res)=>{
	console.log(req.body);
	// 1. Find the associated Chef
	Chef.findOne({_id: req.body._user}, (err, foundChef)=>{
		if(err){
			console.log("Couldn't find associated Chef");
			res.json(err);
		}else{
			console.log("Found the chef");
			// 2. Create the new pizza
			let newPizza = new Pizza(req.body);
			newPizza.save((err)=>{
				if(err){
					console.log("couldn't save the pizza");
					res.json(err);
				}else{
					// 3. Add the new pizza to the Chef
					console.log("saved the pizza, adding it to the Chef");
					foundChef.pizzas.push(newPizza);
					foundChef.save((err)=>{
						if(err){
							console.log("BLOAH");
							res.json(err);
						}else{
							// We made it
							console.log("We made it");
							res.redirect("/");
						}
					})
				}
			})
		}
	})
})

app.listen(8000, ()=>{
	console.log("Running on port 8000");
})

// server listening