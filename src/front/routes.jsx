import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import Landing from "./pages/Landing";
import Canchas from "./pages/Canchas";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="/complejos/:id" element={<Canchas />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
    </Route>
  )
);