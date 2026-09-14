"use client";

import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const {cart,cartTotal,removeFromCart,clearCart}=useStore();
  const [user,setUser]=useState<any>(null);
  const [form,setForm]=useState({customerName:"",phone:"",address:"",city:"",state:"",postalCode:""});
  const router=useRouter();

  useEffect(()=>onAuthStateChanged(auth,setUser),[]);
  if(!cart.length) return <main className="container"><h1>Your cart is empty.</h1></main>;

  const change=(e:any)=>setForm({...form,[e.target.name]:e.target.value});
  async function placeOrder(e:any){
    e.preventDefault();
    if(!user){router.push("/login");return;}
    await addDoc(collection(db,"orders"),{userId:user.uid,email:user.email,items:cart,total:cartTotal,status:"Pending",createdAt:Date.now(),...form});
    clearCart(); alert("Order placed successfully!"); router.push("/");
  }

  return <main className="container"><div className="row">
    <section><h1>Your Cart</h1>{cart.map((x,i)=><div className="cartRow" key={i}><img src={x.image} alt=""/><div style={{flex:1}}><b>{x.name}</b><div>{x.size} / {x.color} × {x.quantity}</div><div>₹{(x.price*x.quantity).toLocaleString("en-IN")}</div></div><button className="btn danger" onClick={()=>removeFromCart(i)}>Remove</button></div>)}
    <h2>Total: ₹{cartTotal.toLocaleString("en-IN")}</h2></section>
    <form className="form" onSubmit={placeOrder}><h2>Delivery Details</h2>
      {(["customerName","phone","address","city","state","postalCode"] as const).map(name=><div key={name}><label>{name==="customerName"?"Full name":name.replace(/([A-Z])/g," $1")}</label><input name={name} required value={form[name]} onChange={change}/></div>)}
      <button className="btn" type="submit">Place Order</button>
    </form>
  </div></main>;
}
