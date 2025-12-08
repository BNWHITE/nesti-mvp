import { useEffect, useState } from "react";
import supabase from "../config/supabase";
import Card from "../components/Card";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      let { data, error } = await supabase.from("family_feed").select("*").order("created_at", { ascending: false });
      if (error) console.log(error);
      else setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <div className="home-container">
      <h1>Fil Familial</h1>
      {posts.map((post) => <Card key={post.id} content={post} />)}
    </div>
  );
}
