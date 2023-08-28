const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const user = req.body.username;
  const pass = req.body.password;

  if (!user) {
    return res.status(300).json({message: `username is required`});
  }
  if (!pass) {
    return res.status(300).json({message: `password is required`});
  }

  if (users.filter((u) => u.username === user).length > 0) {
      return res.status(300).json({message: `User "${user}" already registered. Try logging in?`});
  }
  // proper system would use an actual database and would need cleansed values to prevent SQL injection
  users.push({
      username: user,
      password: pass
  });

  return res.send(`Successfully registered "${user}".`);
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    // in a real world example using a promise makes sense. But it's kinda dumb in this case
    let prom = new Promise((resolve, reject) => {
        resolve(JSON.stringify(books));
    }).then((book_list_str) => {
        res.send();
    });
    // in this case promise is chained since we don't need any intermittent operations
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  let prom = new Promise((resolve, reject) => {
      let book = books[isbn];
      if (book) {
          resolve(JSON.stringify(book));
        } else {
            reject(`No book found with ISBN#${isbn}`);
        }
    }).catch((reason) => {
        res.status(404).json({message: reason});
    }).then((book_data) => {
        res.send(book_data);
  });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
    let prom = new Promise((resolve, reject) => {
        let book = Object.values(books).filter((b) => b.author === req.params.author);
        if (book) {
            resolve(book);
        } else {
            reject(`No books found by author "${req.params.author}"`)
        }
    
    }).catch((reason)=> {
        res.status(300).json({message: reason});
    
    }).then((book) => {
        res.send(book);
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    new Promise((resolve, reject) => {
        let book = Object.values(books).filter((b) => b.title === req.params.title);
        if (book) {
            resolve(JSON.stringify(book));
        } else {
            reject(`No books found with title "${req.params.title}"`);
        }    
    }).catch((reason) => {
        res.status(300).json({message: reason});
        
    }).then((books) => {
        res.send(books);
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    //Write your code here
    const isbn = req.params.isbn;
    let book = books[isbn];
    if (book && book.reviews) {
        res.send(JSON.stringify(book.reviews));
    } else {
        res.status(404).json({message:`Failed to get reviews for book #${isbn}`});
    }
    return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
