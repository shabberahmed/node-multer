const express=require('express')
// const mongoose=require('mongoose')
const multer=require('multer')
const path=require('path')
const app=express()
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        console.log(file)
        cb(null,Date.now()+path.extname(file.originalname))

    }
})
const upload=multer({storage:storage})
app.set('view engine', 'ejs');



app.get('/upload',(req,res)=>{
    res.render('upload')
})
app.post('/upload',upload.single("image"),(req,res)=>{
    res.send('image uploaded')
})
app.listen(1000,console.log('server started on 1212'))