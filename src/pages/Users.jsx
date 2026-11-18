
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Users as UsersIcon, Mail, CalendarDays } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./Home.css";

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

function Users() {
    const navigate = useNavigate();

    const user = getSavedUser();
    const token = localStorage.getItem("token");

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch registered users from MongoDB
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/users",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/login", { replace: true });
                        return;
                    }

                    throw new Error(data.message || "Unable to fetch users");
                }

                setUsers(data);

            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchUsers();
        }
    }, [token, navigate]);

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="home-layout">

            <Sidebar onLogout={logout} />

            <div className="home-main">

                <Topbar user={user} />

                <div className="home-body">

                    <section className="welcome">
                        <div>
                            <h1>Registered Users</h1>
                            <p>
                                View all users registered in Student Task Manager.
                            </p>
                        </div>
                    </section>

                    <div style={{
                        background: "#fff",
                        padding: "22px",
                        borderRadius: "12px",
                        marginTop: "25px",
                        border: "1px solid #eee"
                    }}>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "20px"
                        }}>
                            <UsersIcon size={25} color="#3B71C1" />

                            <div>
                                <h2 style={{ margin: 0 }}>
                                    All Users
                                </h2>

                                <p style={{
                                    color: "#888",
                                    fontSize: "13px",
                                    marginTop: "5px"
                                }}>
                                    Total registered users: {users.length}
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <p>Loading registered users...</p>
                        ) : error ? (
                            <p style={{ color: "red" }}>{error}</p>
                        ) : users.length === 0 ? (
                            <p>No registered users found.</p>
                        ) : (

                            <div style={{ overflowX: "auto" }}>
                                <table style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    textAlign: "left"
                                }}>

                                    <thead>
                                        <tr style={{
                                            background: "#f4f7fb"
                                        }}>
                                            <th style={cellStyle}>#</th>
                                            <th style={cellStyle}>Name</th>
                                            <th style={cellStyle}>Email</th>
                                            <th style={cellStyle}>Registered Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {users.map((registeredUser, index) => (
                                            <tr key={registeredUser._id}>

                                                <td style={cellStyle}>
                                                    {index + 1}
                                                </td>

                                                <td style={cellStyle}>
                                                    <strong>
                                                        {registeredUser.name || "Not provided"}
                                                    </strong>
                                                </td>

                                                <td style={cellStyle}>
                                                    <span style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px"
                                                    }}>
                                                        <Mail size={15} color="#888" />
                                                        {registeredUser.email}
                                                    </span>
                                                </td>

                                                <td style={cellStyle}>
                                                    <span style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px"
                                                    }}>
                                                        <CalendarDays size={15} color="#888" />
                                                        {formatDate(registeredUser.createdAt)}
                                                    </span>
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}

const cellStyle = {
    padding: "15px",
    borderBottom: "1px solid #eee",
    fontSize: "14px"
};

export default Users;
