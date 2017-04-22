var mysql = require('mysql');
var config = require('./config.js');
var inquirer = require('inquirer');
var table = require('console.table')


// MySQL Connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: 'root',
	password: config.password,
	// password: '',
	database: 'Bamazon'
});

connection.connect(function(err){
	if(err) throw err;
	console.log("connected as id" + connection.threadId);
	console.log("");

});

// Starts the Bamazon app.
function start()
{
    connection.query('SELECT id,product_name,price FROM products', function (error, result) {
      if (error) throw error;
      console.log('/////Bamazon Items Available/////');
      // console.log(result);
      console.log("");
      console.table(result);
      
      inquirer.prompt([
            { name: "productID",
              message: "What is the ID of the product you would like to buy?"
             },
             { name: "howMany",
              message: "How many would you like to buy?"
             }
      ]).then(function (result) {
             
             // declaring new variables so I can use them later on in this function. 
              var prodID = result.productID;
              var howMany = result.howMany;

              connection.query('SELECT stock_quantity,price,product_name FROM products WHERE id = ' + prodID, function (error, result) {
                    
                    if (error) throw error;
                    
                    // console.log(results.stock_quantity);
                    // console.log(result[0].stock_quantity);
                    // console.log(howMany);
                    // console.log(result);
                    
                    var stockQty = result[0].stock_quantity;
                    var itemCost = result[0].price;
                    var itemName = result[0].product_name;
                    
                    if (stockQty >= howMany) {	
                        console.log("The item you are requesting is in stock");
                        console.log("There are " + stockQty + " of " + itemName + " in inventory");
                        inquirer.prompt([
                        { name: "proceed",
                          message: "Would you like to proceed with your order?"
                        }
                        ]).then(function(result){
                        	
                        	var updatedQty = stockQty - howMany;
                        	var total = howMany * itemCost;
                        	
                        	// console.log(updatedQty);
                        	if (result.proceed === "yes") {
                        		// console.log("this makes sense so far");
                        		
                        		// Update the qty 
                        		connection.query("UPDATE products Set ? Where ?", [{stock_quantity: updatedQty}, {id: prodID}], function(err, res)
                    			{
                        		if (err) throw err;
                        		console.log("Success!!");
                        		console.log("Your total comes to " + total + " dollars.");
                        		console.log("Thank you for shopping at Bamazon.");
                        		console.log("");
                        		console.log("There are now " + updatedQty + " of " + itemName + " left in inventory");
                        		console.log("");
                        		console.log("");
                        		start();
                        		
                    			})
                        	}
                        	else 
                        		start();
                        })
                    }
                    else {
                        console.log("Insufficient quantity!");
                        start();
                    }

              });

});

});
}

start();




