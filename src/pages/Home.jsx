import React from "react";
import PostCard from "../components/PostCard";
import "./Home.css";

// Mock data for demonstration
const mockPosts = [
  {
    author: 'Sophie Martin',
    avatar: 'S',
    timestamp: 'Il y a 2h',
    type: '📅',
    content: 'Qui est partant pour un pique-nique ce week-end ?',
    emoji: '🌳',
    likes: 5,
    reactions: 3,
    other: 1,
    comments: [
      { avatar: 'L', author: 'Louis', text: "Moi ! J'apporte le ballon 🏐" }
    ]
  },
  {
    author: 'Papa Martin',
    avatar: 'P',
    timestamp: 'Il y a 4h',
    type: '🎉',
    content: "Bravo à Emma pour son excellente note en maths !",
    emoji: '📊',
    likes: 12,
    reactions: 8,
    other: 2,
    comments: []
  },
  {
    author: 'Emma Martin',
    avatar: 'E',
    timestamp: 'Hier',
    type: '📸',
    content: 'Regardez ce magnifique coucher de soleil !',
    emoji: '🌅',
    likes: 8,
    reactions: 5,
    other: 1,
    comments: [
      { avatar: 'S', author: 'Sophie', text: "Magnifique ma chérie ! 😍" }
    ]
  }
];

export default function Home() {
  return (
    <div className="home-page">
      <div className="create-post-bar">
        <div className="avatar avatar-sm">S</div>
        <input 
          type="text" 
          placeholder="Partagez un moment..." 
          className="create-post-input"
          readOnly
        />
        <button className="create-post-btn">+</button>
      </div>

      <div className="posts-feed">
        {mockPosts.map((post, idx) => (
          <PostCard key={idx} post={post} />
        ))}
      </div>
    </div>
  );
}
