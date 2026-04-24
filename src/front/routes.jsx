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
import { AddComplejoDeportivo } from "./pages/AddComplejoDeportivo.jsx";


export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="/complejos/:id" element={<Canchas />} />
         <Route path="/add-complejo" element={<AddComplejoDeportivo />} />
        <Route path="/edit-complejo/:id" element={<AddComplejoDeportivo />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
    </Route>
  )
);