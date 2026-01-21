import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';
import {io} from "socket.io-client"
// import { connect } from 'node:quic';
const normalizeUser = (u) => ({ ...u, fullName: u.fullname ?? u.fullName ?? "" });
const BASE_URL = import.meta.env.MODE==="development" ? 'http://localhost:3000': "/";
export const useAuthStore = create((set,get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    onlineUsers: [],
    socket:null,

    checkAuth: async () => {
        try{
            const res = await axiosInstance.get('/auth/check');
            set({authUser: normalizeUser(res.data), isCheckingAuth: false});
            get().connectSocket();
        }catch(err){
            // 401 is expected when not logged in, don't log as error
            if(err.response?.status !== 401){
                console.error('Failed to check auth:', err);
            }
            set({authUser: null, isCheckingAuth: false});
        }
        finally{
            set({isCheckingAuth: false});
        }
    },
    signup: async (data) => {
        set({isSigningUp: true});
        try{
            const res = await axiosInstance.post('/auth/signup', data);
            set({authUser: normalizeUser(res.data)});
            toast.success("Account Created Successfully!");
            get().connectSocket();
        }catch(err){
            toast.error(err.response?.data?.message || "Signup Failed. Please try again.");
        }finally{
            set({isSigningUp: false});
        }
    },
    login: async (data) => {
        set({isLoggingIn: true});
        try{
            const res = await axiosInstance.post('/auth/login', data);
            set({authUser: normalizeUser(res.data)});
            toast.success("Logged in Successfully!");
            get().connectSocket();
        }catch(err){
            toast.error(err.response?.data?.message || "Login Failed. Please try again.");
        }finally{
            set({isLoggingIn: false});
        }
    },
    logout: async () => {
        try{
            await axiosInstance.post('/auth/logout');
            set({authUser: null});
            toast.success("Logged out Successfully!");
            get().disconnectSocket();
        }catch(err){
            toast.error("Logout Failed. Please try again.");
        }
    },
    updateProfile: async (data) => {
        try{
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({authUser: normalizeUser(res.data)});
            toast.success("Profile Updated Successfully!");
        }catch(err){
            toast.error(err.response?.data?.message || "Profile Update Failed. Please try again.");
        }
    },
    connectSocket: () => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            withCredentials: true
        });
        socket.connect();
        set({socket});
        socket.on("getonlineUsers", (userIds)=>{
            set({onlineUsers: userIds});
        });

    },
    disconnectSocket: () => {
        if(get().socket?.connected){
            get().socket.disconnect();
            set({socket:null, onlineUsers: []});
        }
    },

}));