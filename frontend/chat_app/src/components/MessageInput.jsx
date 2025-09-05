import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import { useEffect } from "react";

const MessageInput = ()=>{
  const {sendMessage} = useChatStore();
  const [text,setText] = useState("");
  const [imagePreview,setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
    useEffect(() => {
    // 👇 make a global method that focuses input
    window.focusChatInput = () => {
      inputRef.current?.focus();
    };
  }, []);

  const handleImageChange = (e)=>{
    const file = e.target.files[0];
    if(!file.type.startsWith("image/"))
    {
      toast.error("Please select an image file");
      return;
    }
      const reader = new FileReader();
      reader.onloadend = ()=>{
          setImagePreview(reader.result);
      }
      reader.readAsDataURL(file);
    
  }
  const removeImage = ()=>{
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  }
  const handelSendMessage = async (e)=>{
    e.preventDefault();
    if(!text.trim() && !imagePreview) return;

    try {
      await sendMessage({text: text.trim(),
        image:imagePreview,
      });

      setText("");
      setImagePreview("");
      if(fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send Message: ", error);
    }

  }
  return(
    <div className="p-4 w-full">
       {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}


      <form onSubmit={handelSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            value={text}
            ref={inputRef}
            onChange={(e)=>{setText(e.target.value)}}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-white"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
           <button
            type="submit"
            className="btn btn-sm btn-circle size-10 "
            disabled={!text.trim()&&!imagePreview}
           >
            <Send size={22}/>
           </button>

      </form>
    </div>
  )
}

export default MessageInput;