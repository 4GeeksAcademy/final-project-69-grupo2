import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { registerUser } from "../services/user.services"

const initialStateUser = {
    email: "",
    username: "",
    password: "",
    avatar: null
}

export const Register = () => {
    const [user, setUser] = useState(initialStateUser)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [loading, setLoading] = useState(false)
    const avatarInputRef = useRef(null)


    const handleChange = ({ target }) => {
        const { name, value } = target
        setUser((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)

        let formData = new FormData(); // esto es una instancia de formulario de data de javascript
        formData.append("email", user.email);
        formData.append("username", user.username);
        formData.append("password", user.password);
        formData.append("avatar_url", user.avatar);

        registerUser(formData)
            .then((response) => {
                console.log(response)
                setSuccess(response?.message || "Usuario registrado. Revisa tu correo para activar la cuenta")
                setError(null)
                setUser({ ...initialStateUser })
                if (avatarInputRef.current) {
                    avatarInputRef.current.value = ""
                }
            })
            .catch((error) => {
                setError(error?.message || "Failed to register user. Please try again")
            })
            .finally(() => {
                setLoading(false)
            })

    }


    useEffect(() => {
        if (!success) return

        const timeoutId = setTimeout(() => {
            setSuccess(null)
        }, 3000)

        return () => clearTimeout(timeoutId)
    }, [])

    return (
        <>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6">
                        <h1>Register</h1>
                        <form
                            className="border p-4 rounded"
                            onSubmit={handleSubmit}
                        >
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            <div className="mb-3 form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    placeholder="Enter your email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3 form-group">
                                <label htmlFor="username" className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    placeholder="Enter your username"
                                    name="username"
                                    value={user.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3 form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    placeholder="Enter your password"
                                    name="password"
                                    value={user.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3 form-group">
                                <label htmlFor="avatar" className="form-label">Avatar</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="avatar"
                                    name="avatar"
                                    ref={avatarInputRef}
                                    onChange={(event) => setUser((prev) => ({ ...prev, avatar: event.target.files[0] }))}
                                />
                            </div>

                            <div className="d-grid">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary"
                                >
                                    {loading ? "Registering..." : "Register"}
                                </button>
                            </div>

                            <p className="text-center mt-3 mb-0">
                                Ya tienes cuenta? <Link to={"/login"}>Inicia sesion</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}