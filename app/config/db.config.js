// module.exports = {
//     url: "mongodb://127.0.0.1:27017/",
// };

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(-1);
});
