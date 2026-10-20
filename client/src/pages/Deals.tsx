import React from "react";
import { useEffect,useState } from "react";
import { api } from "../api";
import type { Deal,Customer } from "../types";

const stages=["Lead","Qualified","Proposal","Won","Lost"];
export default function Deals(){
 const [deals,setDeals]=useState<Deal[]>([]); const [customers,setCustomers]=useState<Customer[]>([]); const [error,setError]=useState("");
 const [form,setForm]=useState<any>({title:"",value:0,stage:"Lead",expectedCloseDate:"",customerId:""});
 const load=()=>Promise.all([api<Deal[]>("/api/deals"),api<any>("/api/customers?limit=100")]).then(([d,c])=>{setDeals(d);setCustomers(c.items)});
 useEffect(()=>{load().catch(e=>setError(e.message))},[]);
 const create=async(e:React.FormEvent)=>{e.preventDefault();try{await api("/api/deals",{method:"POST",body:JSON.stringify({...form,value:Number(form.value)})});setForm({title:"",value:0,stage:"Lead",expectedCloseDate:"",customerId:""});load()}catch(e){setError((e as Error).message)}};
 const stage=async(d:Deal,s:string)=>{await api(`/api/deals/${d._id}`,{method:"PATCH",body:JSON.stringify({stage:s})});load()};
 const del=async(id:string)=>{await api(`/api/deals/${id}`,{method:"DELETE"});load()};
 return <div><div className="card form inline"><h2>New deal</h2><input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input type="number" placeholder="Value" value={form.value} onChange={e=>setForm({...form,value:e.target.value})}/><select value={form.customerId} onChange={e=>setForm({...form,customerId:e.target.value})}><option value="">Customer</option>{customers.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select><input type="date" value={form.expectedCloseDate} onChange={e=>setForm({...form,expectedCloseDate:e.target.value})}/><button onClick={create}>Create</button></div>{error&&<p className="error">{error}</p>}<div className="pipeline">{stages.map(s=><div className="stage" key={s}><h3>{s}</h3>{deals.filter(d=>d.stage===s).map(d=><div className="card deal" key={d._id}><b>{d.title}</b><span>₹{d.value.toLocaleString()}</span><small>{typeof d.customerId==="object"?d.customerId.name:""}</small><select value={d.stage} onChange={e=>stage(d,e.target.value)}>{stages.map(x=><option key={x}>{x}</option>)}</select><button className="danger-btn" onClick={()=>del(d._id)}>Delete</button></div>)}</div>)}</div></div>
}
