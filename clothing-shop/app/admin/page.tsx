"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Order, Product } from "@/lib/types";

export default function Admin() {
  const [user,setUser]=useState<any>(null);
  const [products,setProducts]=useState<Product[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [form,setForm]=useState({name:"",description:"",price:"",image:"",sizes:"S,M,L,XL",colors:"Black,White",stock:"10"});

  async function load(){const ps=await getDocs(collection(db,"products"));setProducts(ps.docs.map(d=>({id:d.id,...d.data()} as Product)));const os=await getDocs(collection(db,"orders"));setOrders(os.docs.map(d=>({id:d.id,...d.data()} as Order)).sort((a,b)=>b.createdAt-a.createdAt));}
  useEffect(()=>onAuthStateChanged(auth,setUser),[]);
  useEffect(()=>{if(user?.email===process.env.NEXT_PUBLIC_ADMIN_EMAIL)load()},[user]);

  if(!user) return <main className="container"><h1>Please sign in first.</h1></main>;
  if(user.email!==process.env.NEXT_PUBLIC_ADMIN_EMAIL) return <main className="container"><h1>Access denied</h1><p>Your account is not configured as an admin.</p></main>;

  async function addProduct(e:any){e.preventDefault();await addDoc(collection(db,"products"),{...form,price:Number(form.price),stock:Number(form.stock),sizes:form.sizes.split(",").map(x=>x.trim()),colors:form.colors.split(",").map(x=>x.trim()),createdAt:Date.now()});setForm({...form,name:"",description:"",price:"",image:"",stock:"10"});load();}
  async function removeProduct(id:string){if(confirm("Delete this product?")){await deleteDoc(doc(db,"products",id));load();}}
  async function status(id:string,status:string){await updateDoc(doc(db,"orders",id),{status});load();}

  return <main className="container"><h1>Admin Dashboard</h1>
    <h2>Add Product</h2><form className="form" onSubmit={addProduct}>
      {Object.entries(form).map(([k,v])=><input key={k} placeholder={k} value={v} onChange={e=>setForm({...form,[k]:e.target.value})} required/>)}
      <button className="btn">Add Product</button>
    </form>
    <h2>Products</h2><table className="adminTable"><thead><tr><th>Name</th><th>Price</th><th>Stock</th><th></th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>{p.name}</td><td>₹{p.price}</td><td>{p.stock}</td><td><button onClick={()=>removeProduct(p.id)}>Delete</button></td></tr>)}</tbody></table>
    <h2>Customer Orders</h2><table className="adminTable"><thead><tr><th>Customer</th><th>Contact</th><th>Address</th><th>Order</th><th>Status</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.customerName}<br/>{o.email}</td><td>{o.phone}</td><td>{o.address}, {o.city}, {o.state} - {o.postalCode}</td><td>{o.items.map((i:any,j:number)=><div key={j}>{i.name} × {i.quantity} ({i.size}/{i.color})</div>)}<b>Total ₹{o.total}</b></td><td><select value={o.status} onChange={e=>status(o.id!,e.target.value)}>{["Pending","Confirmed","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table>
  </main>;
}
