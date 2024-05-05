const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Driver = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: String, required: true },
  tel: { type: String, required: true },

  IDnumber: { type: String, required: true },
  vehicle: { type: String, required: true },
  plate: { type: String, required: true },

  slug: { type: String, slug: 'username', unique: true },

  status: { type: String, required: true },
}, {
  timestamps: true,
});


module.exports = mongoose.model('Driver', Driver);