import React from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useState } from "react";
import { api } from "./api";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";

function Login({ register = false }: { register?: boolean }) {
  const { login, register: signUp } = useAuth();
  const nav = useNavigate();
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  const submit = async (e: React.FormEvent) => { e.preventDefault(); try { register ? await signUp(name,email,password) : await login(email,password); nav("/"); } catch(e){setError((e as Error).message);} };
  return <div className="auth"><form className="card auth-card" onSubmit={submit}><h1>{register?"Create account":"Welcome back"}</h1>{register&&<input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required/>}<input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/><button>{register?"Register":"Login"}</button>{error&&<p className="error">{error}</p>}<Link to={register?"/login":"/register"}>{register?"Already have an account? Login":"Create an account"}</Link></form></div>
}

function Layout() {
  const {user,logout}=useAuth(); const loc=useLocation(); const nav=useNavigate();
  const [dash,setDash]=useState<any>(null);
  const load=async()=>setDash(await api("/api/dashboard"));
  if(!dash) load().catch(()=>{});
  const path=loc.pathname;
  return <div className="app"><aside><h2>Mini CRM</h2><nav><Link className={path==="/"?"active":""} to="/">Dashboard</Link><Link className={path.startsWith("/customers")?"active":""} to="/customers">Customers</Link><Link className={path.startsWith("/deals")?"active":""} to="/deals">Deals</Link><Link className={path.startsWith("/tasks")?"active":""} to="/tasks">Tasks</Link></nav><button className="logout" onClick={()=>logout().then(()=>nav("/login"))}>Logout</button></aside><main><header><div><small>CRM WORKSPACE</small><h1>{path==="/"?"Dashboard":path.slice(1).replace("/", " / ")}</h1></div><span>{user?.name}</span></header>{path==="/" ? <Dashboard data={dash}/> : <Routes><Route path="/customers" element={<Customers/>}/><Route path="/customers/:id" element={<CustomerDetail/>}/><Route path="/deals" element={<Deals/>}/><Route path="/tasks" element={<Tasks/>}/></Routes>}</main></div>
}

function Dashboard({data}:{data:any}) {
  if(!data) return <div className="card">Loading dashboard...</div>;
  const stages=["Lead","Qualified","Proposal","Won","Lost"];
  return <div><div className="grid metrics"><div className="metric"><span>Total Customers</span><b>{data.totalCustomers}</b></div><div className="metric"><span>Open Pipeline</span><b>₹{data.openPipelineValue.toLocaleString()}</b></div><div className="metric"><span>Won This Month</span><b>{data.dealsWonThisMonth}</b></div><div className="metric"><span>Due Today</span><b>{data.tasksDueToday}</b></div><div className="metric danger"><span>Overdue</span><b>{data.overdueTasks}</b></div></div><div className="card"><h2>Pipeline by stage</h2>{stages.map(s=>{const row=data.pipeline.find((x:any)=>x._id===s);const value=row?.value||0;return <div className="bar-row" key={s}><span>{s}</span><div><i style={{width:`${Math.min(100,value/1000)}%`}}/></div><b>₹{value.toLocaleString()}</b></div>})}</div></div>
}

function AppRoutes(){return <AuthProvider><Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Login register/>}/><Route element={<ProtectedRoute/>}><Route path="*" element={<Layout/>}/></Route></Routes></AuthProvider>}
export default AppRoutes;
