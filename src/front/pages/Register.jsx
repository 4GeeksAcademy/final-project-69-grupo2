// import { useState, useRef, useEffect } from "react"
// import { Link } from "react-router-dom"
// import { registerUser } from "../services/user.services"

// const initialStateUser = {
//     email: "",
//     username: "",
//     full_name: "",
//     password: "",
//     avatar: null,
//     role: "user"
// }

// export const Register = () => {
//     const [user, setUser] = useState(initialStateUser)
//     const [error, setError] = useState(null)
//     const [success, setSuccess] = useState(null)
//     const [loading, setLoading] = useState(false)
//     const avatarInputRef = useRef(null)


//     const handleChange = ({ target }) => {
//         const { name, value } = target
//         setUser((prev) => ({ ...prev, [name]: value }))
//     }

//     const handleRoleChange = ({ target }) => {
//         setUser((prev) => ({
//             ...prev,
//             role: target.checked ? "admin" : "user"
//         }))
//     }

//     const handleSubmit = (event) => {
//         event.preventDefault()
//         setError(null)
//         setSuccess(null)
//         setLoading(true)

//         let formData = new FormData(); // esto es una instancia de formulario de data de javascript
//         formData.append("email", user.email);
//         formData.append("username", user.username);
//         formData.append("full_name", user.full_name);
//         formData.append("password", user.password);        
//         formData.append("avatar_url", user.avatar);
//         formData.append("role", user.role);
        

//         registerUser(formData)
//             .then((response) => {
//                 console.log(response)
//                 setSuccess(response?.message || "Usuario registrado. Revisa tu correo para activar la cuenta")
//                 setError(null)
//                 setUser({ ...initialStateUser })
//                 if (avatarInputRef.current) {
//                     avatarInputRef.current.value = ""
//                 }
//             })
//             .catch((error) => {
//                 setError(error?.message || "Failed to register user. Please try again")
//             })
//             .finally(() => {
//                 setLoading(false)
//             })

//     }


//     useEffect(() => {
//         if (!success) return

//         const timeoutId = setTimeout(() => {
//             setSuccess(null)
//         }, 3000)

//         return () => clearTimeout(timeoutId)
//     }, [success])

//     return (
//         <>
//             <div className="container py-5">
//                 <div className="row justify-content-center">
//                     <div className="col-12 col-md-8 col-lg-6">

//                         <form
//                             className="border p-4 rounded"
//                             onSubmit={handleSubmit}
//                         >
//                             {error && <div className="alert alert-danger">{error}</div>}
//                             {success && <div className="alert alert-success">{success}</div>}
//                             <div className="mb-3 form-group">
//                                 <label htmlFor="email" className="form-label">Email</label>
//                                 <input
//                                     type="email"
//                                     className="form-control"
//                                     id="email"
//                                     placeholder="Enter your email"
//                                     name="email"
//                                     value={user.email}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="mb-3 form-group">
//                                 <label htmlFor="username" className="form-label">Username</label>
//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     id="username"
//                                     placeholder="Enter your username"
//                                     name="username"
//                                     value={user.username}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="mb-3 form-group">
//                                 <label htmlFor="full_name" className="form-label">Full Name</label>
//                                 <input
//                                     type="text"
//                                     className="form-control"
//                                     id="full_name"
//                                     placeholder="Enter your full name"
//                                     name="full_name"
//                                     value={user.full_name}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="mb-3 form-group">
//                                 <label htmlFor="password" className="form-label">Password</label>
//                                 <input
//                                     type="password"
//                                     className="form-control"
//                                     id="password"
//                                     placeholder="Enter your password"
//                                     name="password"
//                                     value={user.password}
//                                     onChange={handleChange}
//                                 />
//                             </div>
//                             <div className="mb-3 form-group">
//                                 <label htmlFor="avatar" className="form-label">Avatar</label>
//                                 <input
//                                     type="file"
//                                     className="form-control"
//                                     id="avatar"
//                                     name="avatar"
//                                     ref={avatarInputRef}
//                                     onChange={(event) => setUser((prev) => ({ ...prev, avatar: event.target.files[0] }))}
//                                 />
//                             </div>

//                             <div className="mb-3 form-check">
//                                 <input
//                                     type="checkbox"
//                                     className="form-check-input"
//                                     id="register_as_complejo"
//                                     checked={user.role === "admin"}
//                                     onChange={handleRoleChange}
//                                 />
//                                 <label className="form-check-label" htmlFor="register_as_complejo">
//                                     Registrarme como Complejo
//                                 </label>
//                                 <div className="form-text">
//                                     Si no seleccionas esta opción, te registrarás como usuario general.
//                                 </div>
//                             </div>

//                             <div className="d-grid">
//                                 <button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="btn btn-auth-shared"
//                                 >
//                                     {loading ? "Registering..." : "Register"}
//                                 </button>
//                             </div>

//                             <p className="text-center mt-3 mb-0">
//                                 Ya tienes cuenta? <Link to={"/login"}>Inicia sesion</Link>
//                             </p>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }

import { useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { registerUser } from "../services/user.services"

const initialStateUser = {
    email: "",
    username: "",
    full_name: "",
    password: "",
    avatar: null,
    role: "user"
}

export const Register = () => {
    const [user, setUser] = useState(initialStateUser)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [loading, setLoading] = useState(false)
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false) // Estado para la política de privacidad
    const [showPassword, setShowPassword] = useState(false) // Estado para visibilidad de contraseña
    const avatarInputRef = useRef(null)
    const navigate = useNavigate()

    const handleChange = ({ target }) => {
        const { name, value } = target
        setUser((prev) => ({ ...prev, [name]: value }))
    }

    const handleRoleChange = ({ target }) => {
        setUser((prev) => ({
            ...prev,
            role: target.checked ? "admin" : "user"
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setError(null)
        setSuccess(null)

        // Validación de seguridad para la política de privacidad
        if (!acceptedPrivacy) {
            setError("Debes leer y aceptar la política de privacidad para registrarte.")
            return
        }

        setLoading(true)

        const formData = new FormData()
        formData.append("email", user.email)
        formData.append("username", user.username)
        formData.append("full_name", user.full_name)
        formData.append("password", user.password)        
        formData.append("role", user.role)
        if (user.avatar) {
            formData.append("avatar_url", user.avatar)
        }

        registerUser(formData)
            .then((response) => {
                setSuccess(response?.message || "Usuario registrado. Revisa tu correo para activar la cuenta.")
                setUser({ ...initialStateUser })
                setAcceptedPrivacy(false)
                
                if (avatarInputRef.current) {
                    avatarInputRef.current.value = ""
                }

                // Redirección automática controlada después de 4 segundos
                setTimeout(() => {
                    navigate("/login")
                }, 4000)
            })
            .catch((error) => {
                setError(error?.message || "Error al registrar el usuario. Inténtalo de nuevo.")
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">

                    <form className="border p-4 rounded bg-light" onSubmit={handleSubmit}>
                        <h1 className="text-center mb-4 h3">Crear Cuenta</h1>

                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        {success && <div className="alert alert-success" role="alert">{success}</div>}
                        
                        <div className="mb-3 form-group">
                            <label htmlFor="email" className="form-label">Correo Electrónico</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Introduce tu correo"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3 form-group">
                            <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                placeholder="Introduce tu nombre de usuario"
                                name="username"
                                value={user.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3 form-group">
                            <label htmlFor="full_name" className="form-label">Nombre Completo</label>
                            <input
                                type="text"
                                className="form-control"
                                id="full_name"
                                placeholder="Introduce tu nombre completo"
                                name="full_name"
                                value={user.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3 form-group">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    id="password"
                                    placeholder="Introduce tu contraseña"
                                    name="password"
                                    value={user.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    style={{ fontSize: "13px", fontWeight: "500" }}
                                >
                                    {showPassword ? "Ocultar" : "Mostrar"}
                                </button>
                            </div>
                        </div>

                        <div className="mb-3 form-group">
                            <label htmlFor="avatar" className="form-label">Avatar (Opcional)</label>
                            <input
                                type="file"
                                className="form-control"
                                id="avatar"
                                name="avatar"
                                accept="image/*"
                                ref={avatarInputRef}
                                onChange={(event) => setUser((prev) => ({ ...prev, avatar: event.target.files[0] }))}
                            />
                        </div>

                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="register_as_complejo"
                                checked={user.role === "admin"}
                                onChange={handleRoleChange}
                            />
                            <label className="form-check-label" htmlFor="register_as_complejo">
                                Registrarme como Complejo
                            </label>
                            <div className="form-text">
                                Si no seleccionas esta opción, te registrarás como usuario general.
                            </div>
                        </div>

                        {/* Checkbox Obligatorio de Política de Privacidad */}
                        <div className="mb-4 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="privacyCheckbox"
                                checked={acceptedPrivacy}
                                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                                required
                            />
                            <label className="form-check-label" htmlFor="privacyCheckbox">
                                Leo y acepto la <Link to="/terminos_condiciones.pdf" target="_blank" rel="noopener noreferrer">política de privacidad</Link>
                            </label>
                        </div>

                        <div className="d-grid">
                            <button type="submit" disabled={loading} className="btn btn-auth-shared">
                                {loading ? "Registrando..." : "Registrarse"}
                            </button>
                        </div>

                        <p className="text-center mt-3 mb-0">
                            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
