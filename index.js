const express = require('express');
const mongoose = require('mongoose');
const fileupload = require('express-fileupload');
const pug = require('pug');
const fs = require('fs');
const bcrypt=require('bcrypt');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
app.set('view engine', 'pug');

mongoose.connect('mongodb://localhost:27017/ExamProject')
 .then(() => console.log('Connected to MongoDB'))
 .catch(err => console.error('Failed to connect to MongoDB', err));


 const loginschema = new mongoose.Schema({
  user: String,
  fname: String,
  lname: String,
  pin: String,
  mail: String,
  address: String,
  phone: String,
  pass: String, 
  confpass: String
});

const modellogin = new mongoose.model('logindata', loginschema);

const oneoneschema = new mongoose.Schema({
  user: String,
  pin:String,
  M1: Number,
  Eng: Number,
  PPSC: Number,
  AP: Number,
  ELCS_LAB: Number
});

const modelmarks = new mongoose.model('marks', oneoneschema);

const onetwoschema = new mongoose.Schema({
  user: String,
  pin: String,
  M2: Number,
  DS: Number,
  PYTHON: Number,
  CO: Number,
  CHEM: Number
});

const modelOnetwo = new mongoose.model('onetwo', onetwoschema);

const admindataschema = new mongoose.Schema({
  adminuser: String,
  adminpass: String
});

const modeladminlogin = new mongoose.model('admindatas', admindataschema);

app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/stdlogin', (req, res) => {
  res.sendFile(__dirname + '/public/stdlogin.html');
});

app.get('/adminlogin', (req, res) => {
  res.sendFile(__dirname + '/public/adminlogin.html');
});

app.post('/register', async (req, res) => {
  try {
    const { user, fname, lname, pin, mail, address, phone, confpass, pass } = req.body;
    if (pass !== confpass) {
      return res.send('Passwords do not match');
    }



    const userData = {
      user,
      fname,
      lname,
      pin,
      mail,
      address,
      phone,
      pass,
      confpass: confpass
    };
    const hashedpassword = await bcrypt.hash(pass,10);
     const newuser = new modellogin({
            user,
            fname,
            lname,
            pin,
            mail,
            address,
            phone,
            pass: hashedpassword
        });
        await newuser.save();
    res.redirect('/stdlogin');
  } catch (error) {
    console.error('Error registering user:', error);
    res.send('Error registering user');
  }
});


app.post('/stdlogin', async (req, res) => {
  try {
    const { user, pass } = req.body;
    // console.log(user);
    const userData= await modellogin.findOne({user:user});
    // console.log(userData);
    if (!userData) {
      return res.send('Invalid username');
    }
    const passwordMatch = await bcrypt.compare(pass, userData.pass);
    if (passwordMatch) {
      res.render('stdmain', { user: userData });
  } else {
      return res.sendFile(__dirname + '/public/stdlogin.html');
  }
  } catch (error) {
    console.error('Error logging in:', error);
    res.send('Error logging in');
  }
});
app.get('/viewprofile/:user', async (req, res) => {
  const user = req.params.user;
  try {
    const userData = await modellogin.findOne({ user });
    if (!userData) {
      return res.send('User not found');
    }
    res.render('viewprofile', { user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.send('Error fetching user data');
  }
});

app.get('/viewresults/:user', async (req, res) => {
  const user = req.params.user;
  try {
    const marksData = await modelmarks.find({ user }).exec();
    const onetwoData = await modelOnetwo.find({ user }).exec();
    if (!marksData || !onetwoData) {
      return res.send('No data found for the user');
    }
    const marks = {
      M1: parseFloat(marksData[0].M1),
      Eng: parseFloat(marksData[0].Eng),
      PPSC: parseFloat(marksData[0].PPSC),
      AP: parseFloat(marksData[0].AP),
      ELCS_LAB: parseFloat(marksData[0].ELCS_LAB)
    };

    const onetwo = {
      M2: parseFloat(onetwoData[0].M2),
      DS: parseFloat(onetwoData[0].DS),
      PYTHON: parseFloat(onetwoData[0].PYTHON),
      CO: parseFloat(onetwoData[0].CO),
      CHEM: parseFloat(onetwoData[0].CHEM)
    };

    // Calculate grades
    const M1Grade = module.exports.calculateGrade(marks.M1);
    const EngGrade = module.exports.calculateGrade(marks.Eng);
    const PPSCGrade = module.exports.calculateGrade(marks.PPSC);
    const APGrade = module.exports.calculateGrade(marks.AP);
    const ELCS_LABGrade = module.exports.calculateGrade(marks.ELCS_LAB);

    const M2Grade = module.exports.calculateGrade(onetwo.M2);
    const DSGrade = module.exports.calculateGrade(onetwo.DS);
    const PYTHONGrade = module.exports.calculateGrade(onetwo.PYTHON);
    const COGrade = module.exports.calculateGrade(onetwo.CO);
    const CHEMGrade = module.exports.calculateGrade(onetwo.CHEM);
    const subj = ["M1", "Eng", "PPSC", "AP", "ELCS_LAB", "M2", "DS", "PYTHON", "CO", "CHEM"];
const passedsubj1 = [];
const failedsubj1= [];
const passedsubj2 = [];
const failedsubj2= [];

if (M1Grade === 'F') {
    failedsubj1.push("M1");
} else {
    passedsubj1.push("M1");
}

if (EngGrade === 'F') {
    failedsubj1.push("Eng");
} else {
    passedsubj1.push("Eng");
}

if (PPSCGrade === 'F') {
    failedsubj1.push("PPSC");
} else {
    passedsubj1.push("PPSC");
}

if (APGrade === 'F') {
    failedsubj1.push("AP");
} else {
    passedsubj1.push("AP");
}
if (ELCS_LABGrade === 'F') {
  failedsubj1.push("ELCS_LAB");
} else {
  passedsubj1.push("ELCS_LAB");
}



if (M2Grade === 'F') {
    failedsubj2.push("M2");
} else {
    passedsubj2.push("M2");
}

if (DSGrade === 'F') {
    failedsubj2.push("DS");
} else {
    passedsubj2.push("DS");
}

if (PYTHONGrade === 'F') {
    failedsubj2.push("PYTHON");
} else {
    passedsubj2.push("PYTHON");
}

if (COGrade === 'F') {
    failedsubj2.push("CO");
} else {
    passedsubj2.push("CO");
}
if (CHEMGrade === 'F') {
  failedsubj2.push("CHEM");
} else {
  passedsubj2.push("CHEM");
}
if(passedsubj1.length==0)
{
     passedsubj1.push("NO PASSED SUBJECTS")
}
if(failedsubj1.length==0)
{
  failedsubj1.push("NO FAILED SUBJECTS")
}
if(passedsubj2.length==0)
{
  passedsubj2.push("NO PASSED SUBJECTS")
}
if(failedsubj2.length==0)
{
     failedsubj2.push("NO FAILED SUBJECTS")
}
  res.render('viewresult', { 
      user, 
      marks, 
      onetwo, 
      M1Grade, 
      EngGrade, 
      PPSCGrade, 
      APGrade, 
      ELCS_LABGrade, 
      M2Grade, 
      DSGrade, 
      PYTHONGrade, 
      COGrade, 
      CHEMGrade ,
      failedsubj1,
      passedsubj1,
      failedsubj2,
      passedsubj2,
    });

  } catch (error) {
    console.error('Error fetching marks data:', error);
    res.send('Error fetching marks data');
  }
});


app.get('/adminprofile', (req, res) => {
  res.sendFile(__dirname + '/public/adminprofile.html');
});

app.post('/adminlogin', async (req, res) => {
  try {
    const { adminuser, adminpass } = req.body;
   const adminData = await modeladminlogin.findOne({ adminuser, adminpass });
    if (!adminData) {
      return res.send('Invalid admin username or password');
    }

    const students = await modellogin.find({}, 'pin').exec();
    res.render('adminprofile', { admin: adminData, students: students.map(s => s.pin) });
  } catch (error) {
    console.error('Error logging in:', error);
    res.send('Error logging in. Please try again.');
  }
});
// app.post('/forgot', async (req, res) => {
//   const { user1, fskey } = req.body;
//   try {
//     const user = await modeladminlogin.findOne({ adminuser: user1 });
//     console.log('User:', user);
//     if (!user) {
//       console.log('User not found');
//       return res.send("User not found");
//     }
//     console.log('User skey:', user.skey);
//     console.log('fskey:', fskey);
//     if (fskey === user.skey) {
//       res.redirect(`/password.html?username=${user.user}`);
//     } else {
//       console.log('Incorrect secret key');
//       return res.send("Incorrect secret key");
//     }
//   } catch (error) {
//     console.error("Error finding user:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post('/updatepassword', async (req, res) => {
//   const { username, resetpass } = req.body;
//   if (req.body.resetpass !== req.body.pcpass) {
//       const alertScript = `
//           <script>
//               alert("Password and Confirm Password do not match");
//               window.location.href = "/updatepassword.html";
//           </script>
//       `;
//       return res.send(alertScript);
//   }
//       const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
//         const capitalLetterRegex = /[A-Z]/;
//            const numberRegex = /[0-9]/;
//   if (!numberRegex.test(req.body.resetpass) || !specialCharacterRegex.test(req.body.resetpass) || !capitalLetterRegex.test(req.body.resetpass)) {
//       const alertScript = `
//           <script>
//           alert("Password must contain at least one special character, one capital letter, and one number");
//               window.location.href = "/updatepassword.html";
//           </script>
//       `;
//       return res.send(alertScript);
//   }
//   try {
//       const hashedpassword = await bcrypt.hash(resetpass, 10);
//       const updatedUser = await modeladminlogin.findOneAndUpdate({ adminuser: username }, { adminpass: hashedpassword }, { new: true });
//       console.log(updatedUser);
//       if (!updatedUser) {
//           return res.status(404).send("User not found");
//       }
//       const alertScript = `
//       <script>
//       alert("Password updated successfully...");
//           window.location.href = "/adminlogin.html";
//       </script>
//   `;
//   return res.send(alertScript);
//   } catch (error) {
//       console.error("Error updating password:", error);
//       res.status(500).send("Internal Server Error");
//   }
// });

app.get('/viewstudent/:pin', async (req, res) => {
  const pin = req.params.pin;
  try {
    const userData = await modellogin.findOne({ pin });
    if (!userData) {
      return res.send('Invalid PIN');
    }
    res.render('stdmain', { user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.send('Error fetching user data');
  }
});

module.exports.calculateGrade = function(mark) {
  const gradingCriteria = {
    A: 90,
    B: 80,
    C: 70,
    D: 60,
    F: 0
  };
  
  for (const grade in gradingCriteria) {
    if (mark >= gradingCriteria[grade]) {
      return grade;
    }
  }
  return 'F';
};

app.listen(4000, () => {
  console.log("Server is running successfully");
});