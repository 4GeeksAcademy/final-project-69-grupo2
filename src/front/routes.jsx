// import {
//       createBrowserRouter,
//       createRoutesFromElements,
//       Route,
// } from "react-router-dom";
// import { Layout } from "./pages/Layout";
// import Landing from "./pages/Landing";
// import Canchas from "./pages/Canchas";
// import { Single } from "./pages/Single";
// import { Demo } from "./pages/Demo";
// import { AddComplejoDeportivo } from "./pages/AddComplejoDeportivo.jsx";
// import ReservaCancha from "./pages/ReservaCancha";
// import { AddCancha } from "./pages/AddCancha.jsx";
// import Reservas from "./pages/Reservas";
// import Complejos from "./pages/Complejos";
// import { Register } from "./pages/Register";
// import { Login } from "./pages/Login";
// import { ForgotPassword } from "./pages/ForgotPassword";
// import { RecoveryPassword } from "./pages/RecoveryPassword";
// import { ActivateAccount } from "./pages/ActivationAccount";
// import { GestionHorarios } from "./pages/GestionHorarios.jsx";
// import { UserReservas } from "./pages/UserReservas.jsx";
// import PagoExitoso from "./pages/PagoExitoso.jsx";
// import { ProtectedRoute } from "./components/ProtectedRoute.jsx"; 
// import { UserReservas } from "./pages/UserReservas.jsx"; 
// export const router = createBrowserRouter(
//       createRoutesFromElements(
//             <Route path="/" element={<Layout />}>
//                   <Route index element={<Landing />} />

//                   {/* Complejos */}
//                   <Route path="/todos-complejos" element={<Complejos />} />
//                   <Route path="/complejos/:id" element={<Canchas />} />
//                   <Route path="/add-complejo" element={<AddComplejoDeportivo />} />
//                   <Route path="/add-complejo/:id" element={<AddComplejoDeportivo />} />

//                   {/* Canchas y Horarios */}
//                   <Route path="/complejo/:complejoId/add-cancha" element={<AddCancha />} />
//                   <Route path="/gestion-horarios/:canchaId" element={<GestionHorarios />} />

//                   {/* Reservas */}
//                   <Route path="/reservar/:canchaId" element={<ReservaCancha />} />
//                   <Route path="/ver-disponibilidad/:canchaId" element={<UserReservas />} />
//                   <Route path="/reservas" element={<Reservas />} />

//                   {/* Stripe Flow */}
//                   <Route path="/pago-exitoso" element={<PagoExitoso />} />

//                   {/* Auth / Usuario */}
//                   <Route path="/register" element={<Register />} />
//                   <Route path="/login" element={<Login />} />
//                   <Route path="/forgot-password" element={<ForgotPassword />} />
//                   <Route path="/recovery-password" element={<RecoveryPassword />} />
//                   <Route path="/activate-account" element={<ActivateAccount />} />
//                   <Route element={<ProtectedRoute />}>
//                     <Route path="/mis-reservas" element={<UserReservas />} />
//                   </Route>
//                   <Route path="/mis-reservas" element={<UserReservas />} />
//                   {/* Otros */}
//                   <Route path="/single/:theId" element={<Single />} />
//                   <Route path="/demo" element={<Demo />} />
//             </Route>
//       )
// );
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
import ReservaCancha from "./pages/ReservaCancha";
import { AddCancha } from "./pages/AddCancha.jsx";
import Reservas from "./pages/Reservas";
import Complejos from "./pages/Complejos";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { RecoveryPassword } from "./pages/RecoveryPassword";
import { ActivateAccount } from "./pages/ActivationAccount";
import { GestionHorarios } from "./pages/GestionHorarios.jsx";
import { UserReservas } from "./pages/UserReservas.jsx";
import MisReservas from "./pages/MisReservas.jsx";
import Reportes from "./pages/Reportes.jsx";
import PagoExitoso from "./pages/PagoExitoso.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

export const router = createBrowserRouter(
      createRoutesFromElements(
            <Route path="/" element={<Layout />}>
                  <Route index element={<Landing />} />

                  {/* Complejos */}
                  <Route path="/todos-complejos" element={<Complejos />} />
                  <Route path="/complejos/:id" element={<Canchas />} />
                  <Route path="/add-complejo" element={<AddComplejoDeportivo />} />
                  <Route path="/add-complejo/:id" element={<AddComplejoDeportivo />} />

                  {/* Canchas y Horarios */}
                  <Route path="/complejo/:complejoId/add-cancha" element={<AddCancha />} />
                  <Route path="/gestion-horarios/:canchaId" element={<GestionHorarios />} />

                  {/* Reservas y Disponibilidad */}
                  <Route path="/reservar/:canchaId" element={<ReservaCancha />} />
                  <Route path="/ver-disponibilidad/:canchaId" element={<UserReservas />} />
                  <Route path="/reservas" element={<Reservas />} />
                  <Route path="/mis-reservas" element={<MisReservas />} />
                  <Route path="/reportes" element={<Reportes />} />
                  <Route path="/todos-complejos" element={<Complejos />} />

                  {/* Stripe Flow */}
                  <Route path="/pago-exitoso" element={<PagoExitoso />} />

                  {/* Auth / Registro */}
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/recovery-password" element={<RecoveryPassword />} />
                  <Route path="/activate-account" element={<ActivateAccount />} />

                  {/* Rutas Privadas del Usuario */}
                  <Route element={<ProtectedRoute />}>
                        <Route path="/mis-reservas" element={<UserReservas />} />
                  </Route>

                  {/* Otros */}
                  <Route path="/single/:theId" element={<Single />} />
                  <Route path="/demo" element={<Demo />} />
            </Route>
      )
);
