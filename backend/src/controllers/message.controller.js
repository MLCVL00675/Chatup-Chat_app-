import Message from "../models/messagemodel.js";
import User from "../models/usermodel.js"
import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUsersForSidebar = async (req,res)=>{

  try{
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({_id:{$ne:loggedInUserId}}).select("-password")
    res.status(200).json(filteredUsers)
  }
  catch(e)
  {
    console.log("Error in getUsersForSidebar: "+e.message);
    res.status(500).json({message:"Internal server error"})
  }
}

export const getMessages = async(req,res) => {
  try{
    const {id:userToChat} = req.params
    const senderId = req.user._id

    const messages = await Message.find({
      $or:[
        {senderId:senderId,receiverId:userToChat},
        {senderId:userToChat,receiverId:senderId}
      ]
    })

    res.status(200).json(messages)
  }
  catch(e)
  {
    console.log("Error in getMessages controller: ",e.message);
    res.status(500).json({message:"Internal Server error"})
  }
}

export const sendMessage = async (req,res) =>{
  try{
    const {text , image} = req.body
    const {id:receiverId} = req.params
    const senderId = req.user._id

    let imageUrl;
    if(image)
    {
      const uploadResponse = await cloudinary.uploader.upload(image); 
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl
    })

    await newMessage.save();
    
    //REAL TIME FUNCTIONALITY HERE=> socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage",newMessage);
    }

    res.status(201).json(newMessage)
  }
  catch(e)
  {
    console.log("Error in sendMessage controller: ",e.message);
    res.status(500).json({message:"Internal Server error"})
  }
}