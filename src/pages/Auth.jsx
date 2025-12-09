import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");

  const signInWithEmail = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert("Vérifiez votre email !");
  };

  const signInWithProvider = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) alert(error.message);
  };

  return (
    <div className="auth-container">
      <h2>Se connecter</h2>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <button onClick={signInWithEmail}>Connexion Email</button>
      <button onClick={() => signInWithProvider("google")}>Google</button>
      <button onClick={() => signInWithProvider("apple")}>Apple</button>
    </div>
  );
}
