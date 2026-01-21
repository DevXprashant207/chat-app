import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatFound from "./NoChatFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chat, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (!chat || chat.length === 0) return <NoChatFound />;

  return (
    <>
      {chat.map((c) => (
        <div
          key={c._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(c)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${(onlineUsers || []).includes(c._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={c.profilePic || "/avatar.png"} alt={c.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{c.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;