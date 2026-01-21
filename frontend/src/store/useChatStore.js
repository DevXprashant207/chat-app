import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
const normalizeUser = (u) => ({ ...u, fullName: u.fullname ?? u.fullName ?? "" });

export const useChatStore = create((set,get) => ({
    allContacts: [],
    chat:[],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem('isSoundEnabled') === 'true' ? true : false,
    toggleSound: () => {
        localStorage.setItem('isSoundEnabled', !get().isSoundEnabled);
        set({isSoundEnabled: !get().isSoundEnabled});
    },
    setActiveTab: (tab) => set({activeTab: tab}),
    setSelectedUser: (user) => set({selectedUser: user}),

    getAllContacts: async () => {
        try{
            set({isUsersLoading: true});
            const res= await axiosInstance.get('/messages/contacts');
            const normalized = Array.isArray(res.data) ? res.data.map(normalizeUser) : [];
            set({allContacts: normalized});
        }catch(err){
            toast.error(err.response?.data?.message || "Failed to fetch contacts. Please try again.");
            console.error("Failed to fetch contacts:", err);
        }finally{
            set({isUsersLoading: false});
        }

    },
    getMyChatPartners: async () => {
        try{
            set({isUsersLoading: true});
            const res= await axiosInstance.get('/messages/chats');
            const normalized = Array.isArray(res.data) ? res.data.map(normalizeUser) : [];
            set({chat: normalized});
        }catch(err){
            toast.error(err.response?.data?.message || "Failed to fetch chat partners. Please try again.");
            console.error("Failed to fetch chat partners:", err);
        }finally{
            set({isUsersLoading: false});
        }
    },
    getMessagesByUserId: async (userId) => {
        try{
            set({isMessagesLoading: true});
            const res= await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});
        }catch(err){
            toast.err(err.response?.data?.message || "Failed to fetch messages. Please try again.");
            console.error("Failed to fetch messages:", err);
        }finally{
            set({isMessagesLoading: false});
        }
    },
    sendMessage: async(MessageData)=>{
        const {selectedUser} = get();
        const {authUser} = useAuthStore.getState();
        const tempId = `temp-${Date.now()}`;
        // Optimistically add the message to the UI
        set({
            messages: get().messages.concat({
                _id: tempId,
                senderId: authUser._id,
                receiverId: selectedUser._id,
                text: MessageData.text,
                image: MessageData.image,
                createdAt: new Date().toISOString(),
            }),
        });
        try{
            const res= await axiosInstance.post(`/messages/send/${selectedUser._id}`,MessageData);
            // Replace the optimistic temp message with the server message
            set({messages: get().messages.map(m => m._id === tempId ? res.data : m)});

        }catch(err){
            toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
            set({messages: get().messages.filter(msg => msg._id !== tempId)});
            console.error("Failed to send message:", err);
        }
    },
    subscribeToNewMessages: () => {
        const {selectedUser, isSoundEnabled} = get();
        if(!selectedUser) return;
        const socket = useAuthStore.getState().socket;
        if(!socket) return;
        // remove any existing listener to avoid duplicate handlers
        socket.off("newMessage");
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if(!isMessageSentFromSelectedUser) return;
            // Append the new message to messages state
            const currentMessages = get().messages;
            set({messages: [...currentMessages, newMessage]});
            // Play sound if enabled
            if(isSoundEnabled){
                const notificationSound = new Audio("/sounds/notification.mp3");
                notificationSound.currentTime = 0;
                notificationSound.play().catch(err => console.error("Failed to play sound:", err));
            }
        });

    },
    unSubscribeFromNewMessages: () => {
        const socket = useAuthStore.getState().socket;
        if(!socket) return;
        socket.off("newMessage");

    },
}));