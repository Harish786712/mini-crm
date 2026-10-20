import React from "react";
import { useEffect,useState } from "react";
import { Link,useParams } from "react-router-dom";
import { api } from "../api";

export default function CustomerDetail(){
 const {id}=useParams(); const [data,setData]=useState<any>(); const [error,setError]=useState("");
 useEffect(()=>{api(`/api/customers/${id}`).then(setData).catch(e=>setError(e.message))},[id]);
 if(error)return <div className="card error">{error}</div>; if(!data)return <div className="card">Loading...</div>;
 return <div><Link to="/customers">← Customers</Link><div className="card"><h2>{data.customer.name}</h2><p>{data.customer.company} · {data.customer.email}</p><p>{data.customer.notes}</p></div><div className="grid two"><div className="card"><h3>Deals</h3>{data.deals.length?data.deals.map((d:any)=><div className="row" key={d._id}><span>{d.title}</span><b>₹{d.value}</b></div>):<p className="muted">No deals</p>}</div><div className="card"><h3>Tasks</h3>{data.tasks.length?data.tasks.map((t:any)=><div className="row" key={t._id}><span>{t.title}</span><small>{new Date(t.dueDate).toLocaleDateString()}</small></div>):<p className="muted">No tasks</p>}</div></div></div>
}
