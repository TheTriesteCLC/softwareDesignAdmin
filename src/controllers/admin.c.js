const Admin = require('../models/Admin');
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

  //[GET] /dashboard
  dashboard(req, res) {
    res.render('dashboard', { layout: 'main' });
  }

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

const slugify = (textToSlugify) => {
  if (!textToSlugify) return '';

  const lowercaseText = textToSlugify.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +(?= )/g, '');

  return lowercaseText.split(' ').join('-');
}

module.exports = new siteController;