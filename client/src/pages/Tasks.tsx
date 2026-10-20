import React from "react";
import { useEffect,useState } from "react";
import { api } from "../api";
import type { Task,Customer,Deal } from "../types";

export default function Tasks(){
 const [tasks,setTasks]=useState<Task[]>([]);const [customers,setCustomers]=useState<Customer[]>([]);const [deals,setDeals]=useState<Deal[]>([]);const [error,setError]=useState("");
 const [form,setForm]=useState<any>({title:"",dueDate:"",priority:"Medium",done:false,customerId:null,dealId:null});
 const load=()=>Promise.all([api<Task[]>("/api/tasks"),api<any>("/api/customers?limit=100"),api<Deal[]>("/api/deals")]).then(([t,c,d])=>{setTasks(t);setCustomers(c.items);setDeals(d)});
 useEffect(()=>{load().catch(e=>setError(e.message))},[]);
 const create=async(e:React.FormEvent)=>{e.preventDefault();try{await api("/api/tasks",{method:"POST",body:JSON.stringify(form)});setForm({title:"",dueDate:"",priority:"Medium",done:false,customerId:null,dealId:null});load()}catch(e){setError((e as Error).message)}};
 const toggle=async(t:Task)=>{await api(`/api/tasks/${t._id}`,{method:"PATCH",body:JSON.stringify({done:!t.done})});load()};
 const del=async(id:string)=>{await api(`/api/tasks/${id}`,{method:"DELETE"});load()};
 return <div><form className="card form inline" onSubmit={create}><h2>New task</h2><input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/><input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} required/><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select><select value={form.customerId||""} onChange={e=>setForm({...form,customerId:e.target.value||null})}><option value="">Customer</option>{customers.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select><select value={form.dealId||""} onChange={e=>setForm({...form,dealId:e.target.value||null})}><option value="">Deal</option>{deals.map(d=><option key={d._id} value={d._id}>{d.title}</option>)}</select><button>Create</button></form>{error&&<p className="error">{error}</p>}<div className="list">{tasks.map(t=><div className={`card row ${t.overdue&&!t.done?"overdue":""}`} key={t._id}><div><h3 className={t.done?"done":""}>{t.title}</h3><span>{new Date(t.dueDate).toLocaleDateString()} · {t.priority}</span>{t.overdue&&!t.done&&<small className="error"> Overdue</small>}</div><div><button onClick={()=>toggle(t)}>{t.done?"Undo":"Done"}</button><button className="danger-btn" onClick={()=>del(t._id)}>Delete</button></div></div>)}</div></div>
}
