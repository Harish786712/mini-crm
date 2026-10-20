import React from "react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import type { Customer } from "../types";

export default function Customers() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<any>();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "active",
    notes: ""
  });

  const load = async () => {
    try {
      setError("");

      const result = await api<any>(
        `/api/customers?${params.toString()}`
      );

      setData(result);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, [params.toString()]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");

      await api("/api/customers", {
        method: "POST",
        body: JSON.stringify(form)
      });

      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        status: "active",
        notes: ""
      });

      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete customer?")) {
      return;
    }

    try {
      setError("");

      await api(`/api/customers/${id}`, {
        method: "DELETE"
      });

      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="split">
      <section>
        <div className="toolbar">
          <input
            placeholder="Search..."
            value={params.get("search") || ""}
            onChange={(e) => {
              const p = new URLSearchParams(params);

              if (e.target.value) {
                p.set("search", e.target.value);
              } else {
                p.delete("search");
              }

              p.set("page", "1");
              setParams(p);
            }}
          />

          <select
            value={params.get("status") || ""}
            onChange={(e) => {
              const p = new URLSearchParams(params);

              if (e.target.value) {
                p.set("status", e.target.value);
              } else {
                p.delete("status");
              }

              p.set("page", "1");
              setParams(p);
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lead">Lead</option>
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        {!data ? (
          <div className="card">Loading...</div>
        ) : data.items.length === 0 ? (
          <div className="card empty">No customers found.</div>
        ) : (
          <div className="list">
            {data.items.map((c: Customer) => (
              <div className="card row" key={c._id}>
                <div>
                  <Link to={`/customers/${c._id}`}>
                    <h3>{c.name}</h3>
                  </Link>

                  <span>
                    {c.company} · {c.email}
                  </span>

                  <small className="pill">{c.status}</small>
                </div>

                <button
                  className="danger-btn"
                  onClick={() => remove(c._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <form className="card form" onSubmit={create}>
        <h2>Add customer</h2>

        {["name", "company", "email", "phone"].map((key) => (
          <input
            key={key}
            placeholder={key}
            type={key === "email" ? "email" : "text"}
            value={(form as any)[key]}
            onChange={(e) =>
              setForm({
                ...form,
                [key]: e.target.value
              })
            }
            required={["name", "company", "email"].includes(key)}
          />
        ))}

        <select
          value={form.status}
          onChange={(e) =>
            setForm({
              ...form,
              status: e.target.value
            })
          }
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="lead">Lead</option>
        </select>

        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value
            })
          }
        />

        <button type="submit">Create customer</button>
      </form>
    </div>
  );
}