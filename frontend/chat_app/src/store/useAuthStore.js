import {create}  from "zustand"
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast";

export const useAuthStore  = create((set)=>({
  authUser: null,
  isSigningUp: false,
  isLoggingIn:false,
  isUpdatingProfile:false,
  isCheckingAuth: true,


checkAuth: async () => {
  try {
    const res = await axiosInstance.get("/auth/check", { withCredentials: true });
    set({ authUser: res.data });
  } catch (e) {
    console.log("Error in checkAuth:", e);
    
    const message = e.response?.data?.Message || e.response?.data?.message || "Unknown error";
    console.log("Backend responded with:", message);

    set({ authUser: null });
  } finally {
    set({ isCheckingAuth: false });
  }
},

signup:async (data)=>{
  set({isSigningUp:true});

  try{
    const res = await axiosInstance.post("/auth/signup",data);
    set({authUser:res.data});
    toast.success("Account successfully Created");
    
  }catch(error){
      toast.error(error.response.data.message);
  } finally{
    set({isSigningUp:false});
  }
},

logout: async()=>{
try{
  await(axiosInstance.post("/auth/logout"));
  set({authUser:null});
  toast.success("User Logged out Successsfully")

}catch(error){
  toast.error(error.response.data.message);
}
},

login: async(data)=>{
  try {
    set({isLoggingIn:true});
    const res = await axiosInstance.post("/auth/login",data);
    set({authUser:res.data});
    toast.success("Logged In successfully");

  } catch (error) {
    toast.error(error.response.data.message);
  }finally{
    set({isLoggingIn:false});
  }

  
},

updateProfile: async(data)=>{
  set({isUpdatingProfile:true});

  try {
    const res = await axiosInstance.put("/auth/update-Profile",data);

    set({authUser: res.data});
    toast.success("Profile updated successfully");

  } catch (error) {
    console.error("Update failed:", error.response?.data || error.message);
    toast.error(error.response.data.message);
  }finally{
    set({isUpdatingProfile:false});
  }

},

}));