"use client";
import React, { useState } from "react";
import { Search, UserPlus, Users, MessageCircle, Swords, MoreVertical } from "lucide-react";

// Mock friends data
const friendsData = [
  {
    id: 1,
    name: "Alex Chen",
    username: "@alexchen",
    pfp: "/profile.png",
    status: "online",
    lastSeen: "now"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    username: "@sarahj",
    pfp: "/profile.png",
    status: "offline",
    lastSeen: "2h ago"
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    username: "@miker",
    pfp: "/profile.png",
    status: "online",
    lastSeen: "now"
  },
  {
    id: 4,
    name: "Emily Davis",
    username: "@emilyd",
    pfp: "/profile.png",
    status: "away",
    lastSeen: "5m ago"
  },
  {
    id: 5,
    name: "David Kim",
    username: "@davidk",
    pfp: "/profile.png",
    status: "offline",
    lastSeen: "1d ago"
  },
  {
    id: 6,
    name: "Lisa Wang",
    username: "@lisaw",
    pfp: "/profile.png",
    status: "online",
    lastSeen: "now"
  },
  {
    id: 7,
    name: "James Wilson",
    username: "@jamesw",
    pfp: "/profile.png",
    status: "offline",
    lastSeen: "3h ago"
  },
  {
    id: 8,
    name: "Anna Brown",
    username: "@annab",
    pfp: "/profile.png",
    status: "online",
    lastSeen: "now"
  }
];

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500", 
  offline: "bg-gray-400"
};

const statusLabels = {
  online: "Online",
  away: "Away",
  offline: "Offline"
};

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);

  const filteredFriends = friendsData.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChallenge = (friendId: number) => {
    console.log(`Challenge friend ${friendId}`);
    // Add challenge logic here
  };

  const handleChat = (friendId: number) => {
    console.log(`Chat with friend ${friendId}`);
    // Add chat logic here
  };

  const handleAddFriend = () => {
    setShowAddFriend(!showAddFriend);
    // Add add friend logic here
  };

  return (
    <div className="h-full bg-[#F7F8FD] flex flex-col relative">
      {/* Header */}
      <div className=" absolute top-0 right-0 left-0  z-50  border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#232b36]">Friends</h1>
          <div className="flex items-center gap-3">
          <div className="relative w-full">
  <Search
    size={20}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
  />
  <input
    type="text"
    placeholder="Search friends..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#232b36]"
  />
</div>

            <button className="p-2 text-[#232b36] hover:bg-gray-100 rounded-full transition-colors">
              <Users size={20} />
            </button>
            <button 
              onClick={handleAddFriend}
              className="p-2 text-[#232b36] hover:bg-gray-100 rounded-full transition-colors"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Friends List */}
      <div className="mt-16 flex-1 overflow-y-auto px-6 py-4 pb-32">
        <div className="space-y-3">
          {filteredFriends.map((friend) => (
            <div 
              key={friend.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={friend.pfp} 
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[friend.status as keyof typeof statusColors]}`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#232b36] text-sm">{friend.name}</h3>
                    <p className="text-xs text-gray-500">{friend.username}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        friend.status === 'online' ? 'bg-green-100 text-green-700' :
                        friend.status === 'away' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {statusLabels[friend.status as keyof typeof statusLabels]}
                      </span>
                      <span className="text-xs text-gray-400">• {friend.lastSeen}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleChallenge(friend.id)}
                    className="p-2 text-[#232b36] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Challenge"
                  >
                    <Swords size={16} />
                  </button>
                  <button 
                    onClick={() => handleChat(friend.id)}
                    className="p-2 text-[#232b36] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Chat"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFriends.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-[#232b36] mb-2">No friends found</h3>
            <p className="text-gray-500">Try adjusting your search or add new friends!</p>
          </div>
        )}
      </div>

     
    </div>
  );
}
