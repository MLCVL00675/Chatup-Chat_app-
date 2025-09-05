import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const ChatContainer = ()=>{
  const {messages,getMessages,isMessageLoading,selectedUser,subscribeToMessages,unsubscribeFromMessages} = useChatStore();
  const {authUser} = useAuthStore();
  const messageEndRef = useRef(null);
  const {sendMessage} = useChatStore();
  useEffect(()=>{
    getMessages(selectedUser._id)

    subscribeToMessages();
    return ()=> unsubscribeFromMessages();
  },[selectedUser._id,getMessages,unsubscribeFromMessages,subscribeToMessages])

  useEffect(()=>{
    if(messageEndRef.current && messages)
    messageEndRef.current.scrollIntoView({behavior: "smooth"})
  },[messages])

  if(isMessageLoading){ 
    return (
    <div className="flex-1 felx flex-col overflow-auto">
      <ChatHeader/>
      <MessageSkeleton/>
      <MessageInput/>
    </div>
  )
  }
 const sendHi = async (e)=>{
    e.preventDefault();
    try {
      await sendMessage({text: "Hi",
        image:"",
      });
    } catch (error) {
      console.error("Failed to send Message: ", error);
    }
  }

  return(
    <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader/>
<div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}

        {messages.length == 0 && (
          <div>
          <Link onClick={() => {window.focusChatInput?.();}} clas>
            <div className="flex flex-col items-center">
              <div className="flex  justify-center mt-50 hover:opacity-80 transition-all">
                <div className="">
                  <div
                    className="w-13 h-13 rounded-4xl bg-primary/10 flex justify-center pt-2  mr-2 ">
                    <MessageSquare className="w-8 h-8 text-primary mt-0.5" />
                  </div>
                </div>
                <div className="text-zinc-100 text-3xl text-center mt-2 font-bold hover:text-zinc-400 transition-colors duration-300 " > Start a Conversation!</div>
              </div>
              <div>
              <button
                onClick={sendHi}
                type="button"
                className="btn rounded-4xl bg-primary/10 animate-bounce backdrop-blur-md  shadow-lg hover:opacity-80 transition-all mt-3 "
                >
                   <div className="text-2xl pb-1">👋</div> Send Hi!
                </button>
            </div>
            </div>

          </Link>
          </div>
          
        )}
      </div>
        <MessageInput/>
    </div>
  )
}
export default ChatContainer