"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "./StoreProvider";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const { cart } = useStore();

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <header className="header">
      <Link href="/" className="logo">THREADLY</Link>
      <nav>
        <Link href="/">Shop</Link>
        <Link href="/checkout">Cart ({cart.reduce((n, x) => n + x.quantity, 0)})</Link>
        {user ? (
          <>
            {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && <Link href="/admin">Admin</Link>}
            <button onClick={() => signOut(auth)} className="linkButton">Sign out</button>
          </>
        ) : <Link href="/login">Google Login</Link>}
      </nav>
    </header>
  );
}
