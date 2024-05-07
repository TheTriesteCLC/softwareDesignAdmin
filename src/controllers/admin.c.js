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
  async dashboard(req, res) {    
    let totalCab = 0;
    let totalRevenue = 0;
    let totalCustomer = 0;
    let totalDriver = 0;

    await Customer.find({}).lean()
    .then(customers => {
      totalCustomer = customers.length;
    });

    await Driver.find({}).lean()
    .then(drivers => {
      totalDriver = drivers.length;
    });

    await History.find({}).lean()
    .then(async cabs => {
      totalCab = cabs.length;

      cabs.forEach(cab => {
        totalRevenue += parseFloat(cab.fee);
      });
      res.render('dashboard', { layout: 'main', title: 'All time statistics', totalCab, totalRevenue, totalCustomer, totalDriver });
    });
  }

  //[POST] /dashboard/time
  async dashboardTime(req, res, next) {
    console.log("in");
    let totalCab = 0;
    let totalRevenue = 0;
    let totalCustomer = 0;
    let totalDriver = 0;

    const formData = req.body;

    await Customer.find({
      createdAt: {
        $gte: new Date(Date.parse(formData.startDate)),
        $lte: new Date(Date.parse(formData.endDate))
      }
    }).lean()
    .then(customers => {
      totalCustomer = customers.length;
    });

    await Driver.find({
      createdAt: {
        $gte: new Date(Date.parse(formData.startDate)),
        $lte: new Date(Date.parse(formData.endDate))
      }
    }).lean()
    .then(drivers => {
      totalDriver = drivers.length;
    });

    await History.find({
      createdAt: {
        $gte: new Date(Date.parse(formData.startDate)),
        $lte: new Date(Date.parse(formData.endDate))
      }
    }).lean()
    .then(async cabs => {
      totalCab = cabs.length;

      cabs.forEach(cab => {
        totalRevenue += parseFloat(cab.fee);
      });

      console.log("Start");
      res.render('dashboard', { layout: 'main', title: `From ${formData.startDate} to ${formData.endDate}`, totalCab, totalRevenue, totalCustomer, totalDriver });
    });
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

  //[GET] /new-cabs
  newCabs(req, res) {
    res.render('newCabs', { layout: 'newCabs', user: JSON.stringify(req.user)});
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