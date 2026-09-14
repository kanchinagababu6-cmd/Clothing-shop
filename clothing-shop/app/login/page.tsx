"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  async function login() {
    try { await signInWithPopup(auth, googleProvider); router.push("/"); }
    catch (e) { alert("Google sign-in failed. Check Firebase Authentication setup."); }
  }
  return <main className="container"><div className="form" style={{textAlign:"center"}}>
    <h1>Customer Login</h1><p>Sign in securely with your Google account.</p>
    <button className="btn" onClick={login}>Continue with Google</button>
  </div></main>;
}
