import React, { useState, useEffect } from "react";
import { Mail, User, Lock, Eye, EyeOff, LogIn, UserCog } from "lucide-react";
import "../auth/LoginForm.css";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });
    const [loginError, setLoginError] = useState("");
    const navigate = useNavigate();
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
        console.log(identifier.value);
        console.log(password.value);
    };

    return (
        <>
            <ToastContainer position="bottom-right" autoClose="2000" />
            <div className="login-page">

                {/* Golden Orbit Background */}
                {/* Golden Orbit Background */}
                <div className="golden-orbit" aria-hidden="true">

                    <div className="orbit-ring orbit-ring-1">
                        <span className="orbit-dot orbit-dot-1"></span>
                    </div>

                    <div className="orbit-ring orbit-ring-2">
                        <span className="orbit-dot orbit-dot-2"></span>
                    </div>

                    <div className="orbit-ring orbit-ring-3">
                        <span className="orbit-dot orbit-dot-3"></span>
                    </div>

                    <div className="orbit-ring orbit-ring-4">
                        <span className="orbit-dot orbit-dot-4"></span>
                    </div>

                    <div className="orbit-ring orbit-ring-5">
                        <span className="orbit-dot orbit-dot-5"></span>
                    </div>

                    <div className="orbit-glow"></div>

                </div>

                {/* Login Card */}
                <div className="login-card">

                    <div className="login-heading">

                        <div className="login-heading__content">
                            <User
                                className="login-heading__icon"
                                size={22}
                            />

                            <h2>Alumni Portal</h2>
                        </div>

                    </div>
                    {/* Form */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="identifier">User Name</label>
                            <div className="login-input">
                                <User size={18} />
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    placeholder="Enter your User Name"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">Password</label>
                            <div className="login-input">
                                <Lock size={18} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="DD-MM-YYYY"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="login-input__eye"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <p className="mt-3 text-center text-red-600 text-sm font-medium">
                                {loginError}
                            </p>
                        )}
                        <button type="submit" className="login-submit">
                            <LogIn size={18} />
                            Login
                        </button>

                        <div className="login-footer">
                            {/* <>
<button
  type="button"
  className="login-footer__link"
  onClick={() => navigate("/forgot-password")}
>
  Forgot your password?
</button>           
 <p className="login-footer__link">Contact your mentor</p>  
            <button type="button" className="login-signup" onClick={() => navigate("/register")} >
              New Student? Sign Up
            </button> 
          </> */}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;