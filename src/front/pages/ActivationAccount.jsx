import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { activateAccount } from "../services/user.services";

export const ActivateAccount = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("Activating your account...");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Activation token is missing.");
            return;
        }

        activateAccount(token)
            .then((response) => {
                setStatus("success");
                setMessage((response?.message || "Account activated successfully.") + " Redirecting to login...");

                setTimeout(() => {
                    navigate("/login");
                }, 2500);
            })
            .catch((error) => {
                setStatus("error");
                setMessage(error.message || "Failed to activate account.");
            });
    }, [searchParams, navigate]);

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="border rounded p-4 text-center">
                        <h1 className="mb-3">Account Activation</h1>
                        {status === "loading" && <div className="alert alert-info mb-0">{message}</div>}
                        {status === "success" && <div className="alert alert-success mb-0">{message}</div>}
                        {status === "error" && <div className="alert alert-danger mb-0">{message}</div>}

                        <div className="mt-3">
                            {status === "success" ? (
                                <Link to="/login" className="btn btn-outline-primary">Go to Login</Link>
                            ) : (
                                <Link to="/" className="btn btn-outline-primary">Go to Home</Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
