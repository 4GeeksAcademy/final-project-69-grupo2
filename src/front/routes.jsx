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
import { AddCancha } from "./pages/AddCancha.jsx";
import Reservas from "./pages/Reservas";
import Complejos from "./pages/Complejos";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="/complejos/:id" element={<Canchas />} />
      <Route path="/add-complejo" element={<AddComplejoDeportivo />} />
      <Route path="/add-complejo/:id" element={<AddComplejoDeportivo />} />
      <Route path="/complejo/:complejoId/add-cancha" element={<AddCancha />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/reservas" element={<Reservas />} />
      <Route path="/todos-complejos" element={<Complejos />} />
    </Route>
  )
);