import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient()

router.post("/login",async (req,res)=>{
        res.header("Access-Control-Allow-Origin","*")
    try {
       let user = prisma.user.findUnique(
            {
                where: {
                    email: req.body.email,
                    password: req.body.password
                }
            }
        );
        if (user.email != "") {
            res.json("User logged in successfully");
        }else{
            res.json("User not found")
        }
    } catch (error) {
        res.json(error)
    }
});
    router.post("/register",async (req,res)=>{

   
    try {
        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                password: req.body.password,
                user_name:req.body.username,
                surename: req.body.lastname,
    }
    
    })
    if (user) {
        res.json("User created")
    }else{
        res.json("User not created")
    }
}catch(error){
        res.json(error)
    }})



export default router;