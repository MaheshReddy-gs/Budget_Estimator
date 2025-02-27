import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
    const [ form, setForm ] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        mobile_no: "",
    });
    const [ message, setMessage ] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://192.168.1.25:5001/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Registration successful!");
                // Redirect to login page after a delay
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setMessage(data.message || "Registration failed. Please try again.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-500 text-gray-800"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-500 text-gray-800"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-500 text-gray-800"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-500 text-gray-800"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        value={form.mobile_no}
                        onChange={(e) => setForm({ ...form, mobile_no: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-500 text-gray-800"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md transition duration-200"
                    >
                        Register
                    </button>
                    {message && <p className="text-center text-red-500">{message}</p>}
                </form>
                <div className="text-center mt-4">
                    <p className="text-gray-600">Already have an account?</p>
                    <link
                        href="/login"
                        className="text-blue-500 hover:text-blue-600 font-semibold"
                    >
                        Login here
                    </link>
                </div>
            </div>
        </div>
    );
}
