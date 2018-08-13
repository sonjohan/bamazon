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
            // based on their answer, either call the bid or the post functions
            switch (answer.selection){
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
    connection.query("SELECT * FROM products", (err, res) => {
        table.draw(res);
        start();
    });
};

function lowInvetory(){
    connection.query("SELECT IF(stock_quantity <= 6, product_name, null) FROM products", (err, res) => {
        table.draw(res);
        start();
    });
};