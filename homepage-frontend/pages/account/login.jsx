import { useState } from "react";
import { useRouter } from "next/router";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { setUser } = useAuth();

  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    // call the API route

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const user = await res.json();
      setUser(user);
      router.push("/");
    } else {
      const errData = await res.json();
      setError(errData);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h2 className=" text-orange-500 font-bold text-lg">Login</h2>
      {error && (
        <div className="border-2 text-red-700 font-bold p-5">
          {error.detail}
        </div>
      )}
      <div>
        <form
          className=" max-w-md flex flex-col justify-center items-center"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="text-gray-700">Username</span>
            <input
              type="text"
              className="mt-1 block w-full"
              placeholder="your email"
              required
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Password</span>
            <input
              type="password"
              placeholder="your password"
              required
              className="mt-1 block w-full"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </label>
          <button className=" bg-orange-500 text-white p-2 m-3 w-full rounded-lg">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;