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

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    inquirer
        .prompt({
            name: "selection",
            type: "list",
            message: "\nWhat would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        })
        .then(function (answer) {
            switch (answer.selection) {
                case "View Products for Sale":
                    viewProducts();
                    break;
                case "View Low Inventory":
                    lowInvetory();
                    break;
                case "Add to Inventory":
                    addToInventory();
                    break;
                case "Add New Product":
                    addNewProduct();
                    break;
                default:
                    console.log("Please make a valid selection");
            };
        });
};

function viewProducts() {
    var table = new tablefy();
    connection.query("SELECT * FROM products", (err, res) => {
        table.draw(res);
        start();
    });
};

function lowInvetory() {
    var table = new tablefy();
    connection.query("SELECT id,product_name,stock_quantity FROM products", (err, res) => {
        if (err) throw err;
        var items = [];
        for (i = 0; i < res.length; i++) {
            if (res[i].stock_quantity <= 5) {
                items.push(res[i]);
            };
        };
        table.draw(items);
        items = [];
        table = new tablefy();
        start();
    })
};

function addToInventory() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "Select an item"
                },
                {
                    name: "add",
                    type: "input",
                    message: "How many items are you adding?"
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].product_name === answer.choice) {
                        chosenItem = results[i];
                    }
                }

                var mustBeNumber = parseInt(answer.add);
                console.log(mustBeNumber);
                if (!isNaN(mustBeNumber)) {
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity + parseInt(answer.add)
                            },
                            {
                                id: chosenItem.id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("Added to inventory successfully!");
                            start();
                        }
                    );
                }
                else {
                    console.log("Must be a number, please try again...");
                    start();
                };
            });
    });
};

function addNewProduct() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "newProduct",
                    type: "input",
                    message: "Product name"
                },
                {
                    name: "department",
                    type: "input",
                    message: "Department name"
                },
                {
                    name: "price",
                    type: "input",
                    message: "Price"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "Quantity"
                }
            ])
            .then(function (answer) {
                connection.query(
                    "INSERT INTO products SET ?",
                    {
                        product_name: answer.newProduct,
                        department_name: answer.department,
                        price: parseInt(answer.price),
                        stock_quantity: parseInt(answer.quantity)
                    },
                    function (error) {
                        if (error) throw err;
                        console.log("New product added to inventory successfully!");
                        start();
                    }
                );
            });
    });
};