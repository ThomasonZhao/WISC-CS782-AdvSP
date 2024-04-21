import { useState } from "react";
import Login from "./routes/Login";
import Home from "./routes/Home";
import Register from "./routes/Register";
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

function App() {
    const [serverAddr, setServerAddr] = useState('192.168.1.194:8081');

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />
    },
    {
      path: "/login",
      element: <Login serverAddr={serverAddr} setServerAddr={setServerAddr} />
    },
    {
      path: "/register",
      element: <Register serverAddr={serverAddr} setServerAddr={setServerAddr} />
    }
  ]);

  return (
    <RouterProvider router={router} />
  )
}

export default App;
