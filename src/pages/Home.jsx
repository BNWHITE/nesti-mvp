import React from "react";
import { PlusIcon } from '@heroicons/react/24/outline';
import PostCard from "../components/PostCard";
import "./Home.css";

// Mock data for development
const mockPosts = [
  {
    id: 1,
    author: { name: "Sophie Martin", avatar: "S" },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "memory",
    content: "Quelle belle journée au parc ! Les enfants se sont tellement amusés sur les balançoires 🌳",
    emoji: "😊",
    reactions: { thumbsup: 5, heart: 3, celebration: 2 },
    likes: 10,
    comments: [
      { author: "Marc Martin", text: "C'était génial ! On y retourne quand ?" },
      { author: "Emma Martin", text: "J'adore le parc ! ❤️" }
    ]
  },
  {
    id: 2,
    author: { name: "Marc Martin", avatar: "M" },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: "achievement",
    content: "Emma a gagné son match de tennis aujourd'hui ! Tellement fière d'elle 🎾",
    emoji: "🏆",
    reactions: { thumbsup: 8, heart: 5, celebration: 4 },
    likes: 17,
    comments: [
      { author: "Sophie Martin", text: "Bravo ma chérie ! 👏" }
    ]
  },
  {
    id: 3,
    author: { name: "Emma Martin", avatar: "E" },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: "question",
    content: "Qui veut m'aider à préparer des cookies ce weekend ? 🍪",
    reactions: { thumbsup: 4, heart: 6, celebration: 1 },
    likes: 11,
    comments: [
      { author: "Sophie Martin", text: "Moi ! J'adore faire des cookies avec toi !" },
      { author: "Lucas Martin", text: "Je veux goûter ! 😋" }
    ]
  }
];

export default function Home() {
  const posts = mockPosts;

  return (
    <div className="home-page">
      <div className="page-container">
        {/* Creation Bar */}
        <div className="create-post-bar">
          <div className="avatar avatar-sm">S</div>
          <input 
            type="text" 
            placeholder="Partagez un moment..." 
            className="create-input"
            readOnly
          />
          <button className="create-btn">
            <PlusIcon className="icon-md" />
          </button>
        </div>

        {/* Posts Feed */}
        <div className="posts-feed">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
