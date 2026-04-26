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

import Reservas from "./pages/Reservas";
import Complejos from "./pages/Complejos";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { RecoveryPassword } from "./pages/RecoveryPassword";
import { ActivateAccount } from "./pages/ActivationAccount";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="/complejos/:id" element={<Canchas />} />
         <Route path="/add-complejo" element={<AddComplejoDeportivo />} />
        <Route path="/edit-complejo/:id" element={<AddComplejoDeportivo />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/reservas" element={<Reservas />} />
      <Route path="/todos-complejos" element={<Complejos />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/recovery-password" element={<RecoveryPassword />} />
      <Route path="/activate-account" element={<ActivateAccount />} />

    </Route>
  )
);