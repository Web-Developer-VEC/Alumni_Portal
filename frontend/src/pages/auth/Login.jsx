import React, { useState } from "react";
import {
    User,
    Lock,
    Eye,
    EyeOff,
    LogIn,
} from "lucide-react";

import "../auth/Login.css";

import { ToastContainer } from "react-toastify";

const Login = () => {

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const [loginError, setLoginError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setLoginError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Backend login will be added here later
        console.log("Login Data:", formData);
    };

    return (
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
            />

            <main className="login-page">

                {/* Background Decoration */}
                <div className="login-decoration login-decoration-left"></div>
                <div className="login-decoration login-decoration-right"></div>

                {/* Small decorative lines */}
                <div className="login-line login-line-one"></div>
                <div className="login-line login-line-two"></div>


                {/* Login Card */}
                <div className="login-card">

                    {/* Heading */}
                    <div className="login-heading">

                        <div className="login-brand-mark">
                            <User size={24} strokeWidth={2.2} />
                        </div>

                        <h1>ALUMNI PORTAL</h1>

                        <p>
                            Velammal Engineering College
                        </p>

                    </div>


                    {/* Divider */}
                    <div className="login-divider">
                        <span></span>
                        <div></div>
                        <span></span>
                    </div>


                    {/* Form */}
                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Username */}
                        <div className="login-field">

                            <label htmlFor="identifier">
                                USERNAME
                            </label>

                            <div className="login-input">

                                <User
                                    size={19}
                                    strokeWidth={1.8}
                                />

                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    required
                                />

                            </div>

                        </div>


                        {/* Password */}
                        <div className="login-field">

                            <label htmlFor="password">
                                PASSWORD
                            </label>

                            <div className="login-input">

                                <Lock
                                    size={19}
                                    strokeWidth={1.8}
                                />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="XXXXXXXXXX"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="login-input-eye"
                                    onClick={() =>
                                        setShowPassword(
                                            (value) => !value
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>


                        {/* Error */}
                        {loginError && (
                            <p className="login-error">
                                {loginError}
                            </p>
                        )}


                        {/* Login Button */}
                        <button
                            type="submit"
                            className="login-submit"
                        >
                            <LogIn size={18} />

                            <span>
                                LOGIN
                            </span>
                        </button>

                    </form>


                    {/* Footer */}
                    <div className="login-footer">

                        <span className="login-footer-line"></span>

                        <p>
                            Alumni Portal
                        </p>

                        <span className="login-footer-line"></span>

                    </div>

                </div>

            </main>
        </>
    );
};

export default Login;