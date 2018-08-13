var mysql = require("mysql");
var inquirer = require("inquirer");
var tablefy = require("tablefy");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "admin",
    database: "bamazon_DB"
});

var table = new tablefy();

connection.connect(function (err) {
    if (err) throw err;
    viewProducts();
    start();
});

function viewProducts() {
    connection.query("SELECT * FROM products", (err, res) => {
        table.draw(res);
    });
};

function start() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;

        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "input",
                    message: "Enter the ID of the product"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many items?"
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].id === parseInt(answer.choice)) {
                        chosenItem = results[i];
                    }
                }

                if (chosenItem.stock_quantity > parseInt(answer.quantity)) {
                    chosenItem.stock_quantity -= parseInt(answer.quantity);
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity
                            },
                            {
                                id: chosenItem.id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Order placed successfully!");
                            setTimeout(start, 1000);
                        }
                    );
                }
                else {
                    console.log("Insufficient quantity!");
                    setTimeout(start, 1000);
                }
            });
    });
};