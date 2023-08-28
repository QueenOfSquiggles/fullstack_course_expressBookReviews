const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let us = users.find((u) => u.username === username);
    if (!us) return false;
    if (us.password !== password) return false;

    return true;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const user = req.body.username;
    const pass = req.body.password;
    if (!user || !pass)
    {
        return res.status(404).json({message: "Malformed login data"});
    }


    if (!authenticatedUser(user, pass)) {
        return res.status(404).json({message: `"${user}" is not a registered user`});
    }

    let accessToken = jwt.sign({
        data: pass
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
        accessToken, 
        username: user
    };

    return res.status(200).json({message: `Logged in as ${user}`});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    const review = req.body.review;

    let book = books[isbn];
    if (!book) return res.status(404).json({message: `No book found registered as ISB #${isbn}`});
    book.reviews[username] = review;
    res.status(200).json({
        message: `Successfully updated/created review as user ${username}`,
        username: username,
        review: review
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    
    let book = books[isbn];
    if (!book) return res.status(404).json({message: `No book found registered as ISB #${isbn}`});
    let review = book.reviews[username];
    delete book.reviews[username];
    res.status(200).json({
        message: `Successfully deleted review as user ${username}`,
        username: username,
        review: review
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
