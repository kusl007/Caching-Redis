const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/user.model');

const { createClient } =require ('redis');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', err => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar


app.post('/create',async(req,res)=>{

    const {name,email} = req.body;
    try{
        const user = new User({name,email});



    await user.save();
    res.status(200).send({
        message:'User created successfully',
        user
    });
    }
    catch(err){
        console.log(err)
    }

})

app.get('/users/:id',async(req,res)=>{
    try{
        let data= await client.get(`user:profile:${req.params.id}`)
        
        if (data) {
            console.log("Cache hit - data from Redis");
            return res.status(200).send(JSON.parse(data));
        }
        console.log("MongoDB hit - data from MongoDB");
        const user = await User.findOne({_id:req.params.id});
        //setting data to redis  lets save data as  :=>user:profile:some_random_id

        //setting data without expiry
        // await client.set(`user:profile:${user._id}`,JSON.stringify(user));

        //setting data with expiry for 5 sec
        await client.setEx(`user:profile:${user._id}`,5,JSON.stringify(user));

        //delete data from redis
        // await client.del(`user:profile:${user._id}`);
        if(!user){
            return res.status(404).send({
                message:'User not found'
            })
        }
        res.status(200).send(user);
    }
    catch(err){
        console.log(err)
    }
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🚀`);
});