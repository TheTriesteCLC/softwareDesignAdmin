const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Driver = require('../models/Driver');
const History = require('../models/History');
const { multipleMongooseToObject, singleMongooseToObject } = require('../util/mongoose');

class siteController {
  //[GET] /login
  login(req, res, next) {
    let messFailed = "";
    if (req.query.status === 'failed') {
      messFailed = 'Wrong username or password.';
    }
    res.render('login', { layout: 'customSignin', messFailed });
  }
  
  //[GET] /logout
  logout(req, res, next) {
    console.log("Loging out");
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('./login');
    })
  }

  //[GET] /signup
  signup(req, res) {
    res.render('signup', { layout: 'customSignin' });
  }

/////////////////////////////////////////////////
  //[GET] /dashboard
  dashboard(req, res) {
    res.render('dashboard', { layout: 'main' });
  }

  //[GET] /customers
  async customers(req, res) {
    let customerList = await Customer.find().sort({"username" : 1}).lean();
    customerList = await formatDate(customerList);
    res.render('customers', { layout: 'main', customers: customerList });
  }
    
  //[GET] /drivers
  async drivers(req, res) {
    let driverList = await Driver.find({}).lean().sort({"username": 1});
    driverList = await formatDate(driverList);
    res.render('drivers', { layout: 'main', drivers: driverList });
  }

  //[GET] /cabs
  async cabs(req, res) {
    let cabList = await History.find({}).populate({
      path:"customerId",
      select: "fullname username",
      model:'Customer'
    })
    .populate({
      path:"driverId",
      select: "fullname username",
      model:'Driver'
    }).lean().sort({"time": -1});

    cabList = await formatDate(cabList);

    res.render('cabs', { layout: 'main', cabs: cabList });
  }


  
/////////////////////////////////////////////////
  //[GET] /profile
  profile(req, res) {

    res.render('profile', { layout: 'main', currAdmin: req.user });
  }

  //[GET] /update-profile
  updateProfile(req, res) {
    res.render('updateProfile', { layout: 'main', currAdmin: req.user });
  }

  //[POST] /update-profile
  async updateProfileUpdated(req, res) {
    const formData = req.body;

    // get current user session
    var currAdmin = await Admin.findOne({ username: req.user.username });

    // check two passwords
    var checkPass = await currAdmin.comparePassword(formData.password);

    if (checkPass) {
      currAdmin = await Admin.findOneAndUpdate({ username: formData.username },
        {
          fullname: formData.fullname,
          phone: formData.phone,
        },
        {
          new: true
        }
      );

      console.log('Updated');

      if (currAdmin === null) {
        res.redirect('/update-profile');
      } else {
        // update session user
        req.session.passport.user = currAdmin;
        res.redirect('/profile');
      }
    }
  }
}

/////////////////////////////////////////////////
const slugify = (textToSlugify) => {
  if (!textToSlugify) return '';

  const lowercaseText = textToSlugify.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +(?= )/g, '');

  return lowercaseText.split(' ').join('-');
}

module.exports = new siteController;

function formatDate(list){
  list = list.map(item => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toISOString().slice(0, 10); // Format as "YYYY-MM-DD"
    const formattedTime = `${date.getHours()}:${date.getMinutes()}`; // Format as "HH:MM"
    item.formattedDateTime = `${formattedDate} ${formattedTime}`; // Combine date and time
    return item;
  });
  return list;
}