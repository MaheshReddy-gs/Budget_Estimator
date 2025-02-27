import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const [ form, setForm ] = useState({ username: "", password: "" });
    const [ message, setMessage ] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://192.168.1.25:5001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Login successful!");
                // Redirect to success page after login
                setTimeout(() => router.push("/budgetUI"), 100);
            } else {
                setMessage(data.message || "Login failed. Please try again.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 text-gray-800"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500 text-gray-800"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-md transition duration-200"
                    >
                        Login
                    </button>
                    {message && <p className="text-center text-red-500">{message}</p>}
                </form>
                <div className="text-center mt-4">
                    <p className="text-gray-600">Don't have an account?</p>
                    <a
                        href="/register"
                        className="text-blue-500 hover:text-blue-600 font-semibold"
                    >
                        Register here
                    </a>
                </div>
            </div>
        </div>
    );
}
