const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const User = require('./module/User')

const app = express();

// to conenct to databases
mongoose.connect('mongodb://127.0.0.1:27017/myDB')
.then(() =>console.log("Connected to  mongoDB"))
.catch((err) => console.log("mongo connection error",err));


// midlewares to handle from login and signin html
app.use(express.urlencoded({extended:true}));

//app.use(express.json())// optional here we are not fethc any  body in api

//to acess public folder 
//app.use(express.static('public')); not safe...
app.use(express.static(path.join(__dirname, 'public')))



// to check
// app.get("/",(req,res) => {
//     res.send("connected to server!!")
// })

// redirect root to login
app.get('/', (req,res)=>{
    res.redirect('/login')
})

//to access signup and lohin from html
app.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname,'public', 'login.html'))
})

app.get('/signup', (req,res) => {
    res.sendFile(path.join(__dirname,'public', 'signup.html'))
})



app.post('/signup' , async (req,res)=> {

    const{name , age , email, password} = req.body

    const existingUser = await User.findOne({email})

    if(existingUser){
        return  res.send(`
            <h2> user with this email already exist </h2>
            <a href ="/signup"><button>try again  </button></a>
            `)
    }

    const user = new User({name, age, email, password})
    await user.save()

    res.send(`
            <h3> Signup successful!</h3>
            <a href="/login"><button>Now Login </button></a>
        `)


})

app.post('/login', async(req,res)=> {
    const{email, password} = req.body

    const user =await User.findOne({email})
    if (!user) {
        return res.send(`
            <h3> Invalid credentials.</h3>
            <a href="/login"><button>Login again</button></a>
        `);
    }


    

    const now = new Date();

    if(user.blockUntil && user.blockUntil >now){
        const waitTime = Math.ceil((user.blockUntil -now)/(1000 * 60))
        return res.send(` Account is blocked. Try again in ${waitTime} minutes.`);
    }


   if(password !== user.password){
       user.loginAttempts+=1;
       if(user.loginAttempts>=3){
        user.blockUntil = new Date(Date.now() + 60*60*1000) //blockup to 1 hr 1000mil * 60 sec *60 sec
        user.loginAttempts=0
        await user.save()
        return res.send(`Many Login attempts faield , You're Blocked for 1 hour`)
       }

        await user.save();
        return  res.send(`
                    <h3> Invalid credentials. Attempt ${user.loginAttempts}/3</h3>
                    <a href="/login"><button>Try Again</button></a>
                `)

   }

   user.loginAttempts = 0;
    user.blockUntil = null;
    await user.save();

    res.send(`<h2>welcome ${user.name} logged In sucessfully</h2>`)



})




app.listen(3000, ()=> console.log('connected to server at http://localhost:3000'))

