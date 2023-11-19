
const User = require('../models/User')
const Codes = require('../models/Codes')
const Message = require('../models/Message')

const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { body, check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req)
  res.render('index', {
    user: req.user,
  });
});

router.get('/signup', (req, res, next) => {
  res.render('signup')
})

router.post('/signup', [
  body('username', 'Username cannot be less than 3 characters')
    .trim()
    .isLength({min: 3})
    .escape(),
  check('username')
    .custom(async (value) => {
      let foundUsername = await User.find({username: value})
      if (foundUsername.length) {
        throw new Error('Username is already taken')
      } else {
        return value;
      }
    }),

  check('password', 'Password has to be more than 3 characters')
    .isLength({min: 3})
    .custom((value, {req}) => {
      if (value !== req.body.confirmPassword){
        throw new Error('Passwords do not match')
      } else {
        return value;
      }
    }),
  
  asyncHandler(async(req, res, next) => {
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
      res.render('signup', {
        errors: errors.array(),
      })
    } else {
      try {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
          if (err) {
            throw err
          } else {
            const [admin, member] = await Promise.all([
              Codes.find({admin: req.body.secretCode.toLowerCase()}),
              Codes.find({member: req.body.secretCode.toLowerCase()})
            ])

            const newUser = new User({
              username: req.body.username,
              password: hashedPassword,
              isAdmin: admin.length ? true : false,
              validated: (admin.length || member.length) ? true : false,
            })
            await newUser.save();
            res.redirect('/');
          }
        })
      } catch (err) {
        return next(err);
      }
    }
  })
])

router.get('/login', asyncHandler(async(req, res, next) => {
  res.render('login')
}))

router.post('/login', 
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
)

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get('/chatroom', asyncHandler(async(req, res, next) => {
  const allMessages = await Message.find().populate('poster').exec();
  
  res.render('chat', {
    user: res.locals.currentUser,
    messages: allMessages,
  })
}))

router.post('/chatroom', [
  
  
  body('message')
    .trim()
    .escape(),
  
  asyncHandler(async(req, res, next) => {

    const newMessage = new Message({
      content: req.body.message,
      poster: res.locals.currentUser?._id,

      timestamp: new Date(),
    })
    if (res.locals.currentUser?.isAdmin || res.locals.currentUser?.validated){
      await newMessage.save()
    } 
    
    next()
  }),


  asyncHandler(async (req, res, next) => {
    const allMessages = await Message.find().populate('poster').exec();
    console.log(allMessages)
    res.render('chat', {
      user: res.locals.currentUser,
      messages: allMessages,
    })
  })
])

router.get('/admin/:message_id/delete', asyncHandler(async(req, res, next) => {
  if (res.locals.currentUser?.isAdmin) {
    const message = await Message.findByIdAndDelete(req.params.message_id)
  }
  res.redirect('/chatroom')
}))


module.exports = router;
