import { useRef, useState } from "react";
import { Mail, Eye, EyeOff, Clock, Check, X } from "lucide-react";
import styles from "./Register.module.css";

const API_BASE_URL = "http://localhost:5000";
const steps = ["Email & OTP", "Password", "Details"];
const STORAGE_KEY = "alumniRegistration";

// Remember the submitted registration so a page refresh keeps showing its status.
function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export default function Register() {
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [submitted, setSubmitted] = useState(readSaved); // { referenceId, firstName, email } | null
  const [submitting, setSubmitting] = useState(false);


  const registrationStatus = "pending";
  const statusReason = ""; // rejection reason from the admin, if any

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [mobileNumber, setMobileNumber] = useState("");

  const [registerNumber, setRegisterNumber] = useState("");
  const [programme, setProgramme] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");

  const [currentStatus, setCurrentStatus] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [engagements, setEngagements] = useState([]);
  const [detailsScreen, setDetailsScreen] = useState(1);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const goTo = (nextStep) => {
    clearMessages();
    setStep(nextStep);
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setMessage("OTP sent successfully. Please check your email.");
      setOtpSent(true);
    } catch (error) {
      setError(error.message || "Unable to send OTP.");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (otp.length !== 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP.");
      }

      setMessage("Email verified successfully.");
      setStep(2);
    } catch (error) {
      setError(error.message || "OTP verification failed.");
    }
  };

  const continuePassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/set-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to set password.");
      }

      setMessage("Account created successfully. Complete your profile.");
      setDetailsScreen(1);
      setStep(3);
    } catch (error) {
      setError(error.message || "Unable to create your account.");
    }
  };

  const completeRegistration = async (e) => {
    e?.preventDefault?.();
    clearMessages();

    if (!name.trim() || !mobileNumber || !currentStatus) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const needsEmploymentDetails = [
      "Employed",
      "Self-Employed",
      "Entrepreneur",
    ].includes(currentStatus);

    if (needsEmploymentDetails && !company.trim()) {
      setError("Please enter your company / organization.");
      return;
    }

    if (needsEmploymentDetails && !jobTitle.trim()) {
      setError("Please enter your job title / designation.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("email", email.trim());
      formData.append("fullName", name.trim());
      formData.append("dateOfBirth", dateOfBirth || "");
      formData.append("gender", gender || "");
      formData.append("mobileNumber", mobileNumber);

      formData.append("registerNumber", registerNumber);
      formData.append("programme", programme);
      formData.append("department", department);
      formData.append("batch", batch);

      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("country", country);
      formData.append("pincode", pincode);

      formData.append("company", company);
      formData.append("designation", jobTitle);
      formData.append("industry", industry);
      formData.append("workLocation", workLocation);
      formData.append("officialEmail", officialEmail);
      formData.append("linkedInUrl", linkedinUrl);

      if (profilePhoto) {
        formData.append("profilePic", profilePhoto);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/alumni/complete-profile`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to complete your profile."
        );
      }

      setMessage("Registration completed successfully!");

      const saved = {
        referenceId: data.profile?._id || `AL-${Date.now()}`,
        firstName: name.trim().split(" ")[0],
        email,
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(saved)
      );

      setSubmitted(saved);

    } catch (error) {
      console.error("Profile submission error:", error);
      setError(
        error.message ||
        "Could not complete your registration. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    clearMessages();
    setSubmitted(null);
    setOtpSent(false);
    setStep(1);
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setDateOfBirth("");
    setGender("");
    setProfilePhoto(null);
    setMobileNumber("");
    setAddress("");
    setCity("");
    setState("");
    setCountry("");
    setPincode("");
    setCurrentStatus("");
    setCompany("");
    setJobTitle("");
    setIndustry("");
    setWorkLocation("");
    setOfficialEmail("");
    setLinkedinUrl("");
    setEngagements([]);
    setDetailsScreen(1);
  };

  return (
    <div className={styles["register-page"]}>
      <div className={styles["layout"]}>
        <section className={styles["intro"]}>
          <div className={styles["college-brand"]}>
            <div className={styles["brand-line"]} />
            <div>
              <p className={styles["college-name"]}>VELAMMAL ENGINEERING COLLEGE</p>
              <p className={styles["college-sub"]}>Alumni Community</p>
            </div>
          </div>

          <p className={styles["intro-kicker"]}>
            PEOPLE · STORIES · OPPORTUNITIES · ALWAYS AHEAD
          </p>

          <h1>
            Your Next Chapter
            <br />
            Starts <span>Here.</span>
          </h1>

          <p className={styles["intro-copy"]}>
            Join a growing community of alumni, stay connected, explore
            opportunities, and make an impact.
          </p>

          <div className={styles["benefits"]}>
            <Benefit icon="♧" title="Reconnect" text="Find and stay in touch with your peers." />
            <Benefit icon="▣" title="Explore" text="Discover opportunities and collaborations." />
            <Benefit icon="↗" title="Grow" text="Learn, share, and build together." />
          </div>

          <div className={styles["intro-foot"]}>
            <i />
            SAME PEOPLE · BIGGER TOMORROWS.
          </div>
        </section>

        <section className={styles["panel"]}>
          <div className={styles["top-row"]}>
            <span>Already have an account?</span>
            <button
              type="button"
              onClick={() => window.location.href = "/login"}
            >
              Sign in
            </button>
          </div>

          {submitted ? (
            <RegistrationStatus
              submitted={submitted}
              status={registrationStatus}
              reason={statusReason}
              onReset={reset}
            />
          ) : (
            <>
              <p className={styles["kicker"]}>Alumni Registration</p>
              <h2 className={styles["title"]}>Create Your Account</h2>
              <p className={styles["subtitle"]}>
                {step === 1
                  ? "Verify your email to get started."
                  : step === 2
                    ? "Create a secure password for your account."
                    : "Tell us a little about yourself."}
              </p>

              <Stepper step={step} />

              {message && <div className={`${styles["alert"]} ${styles["success"]}`}>{message}</div>}
              {error && <div className={`${styles["alert"]} ${styles["error"]}`}>{error}</div>}

              {step === 1 && (
                <EmailVerificationStep
                  email={email}
                  setEmail={setEmail}
                  otp={otp}
                  setOtp={setOtp}
                  otpSent={otpSent}
                  onSendOtp={sendOtp}
                  onVerifyOtp={verifyOtp}
                  onResend={() => {
                    clearMessages();
                    setMessage("New OTP sent. Demo OTP: 123456");
                  }}
                  onChangeEmail={() => {
                    setOtp("");
                    setOtpSent(false);
                    clearMessages();
                  }}
                />
              )}

              {step === 2 && (
                <PasswordStep
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  onSubmit={continuePassword}
                  onBack={() => goTo(1)}
                />
              )}

              {step === 3 && (
                <DetailsScreens
                  screen={detailsScreen}
                  setScreen={setDetailsScreen}
                  submitting={submitting}
                  name={name}
                  setName={setName}
                  dateOfBirth={dateOfBirth}
                  setDateOfBirth={setDateOfBirth}
                  gender={gender}
                  setGender={setGender}
                  profilePhoto={profilePhoto}
                  setProfilePhoto={setProfilePhoto}
                  mobileNumber={mobileNumber}
                  setMobileNumber={setMobileNumber}
                  registerNumber={registerNumber}
                  setRegisterNumber={setRegisterNumber}
                  programme={programme}
                  setProgramme={setProgramme}
                  department={department}
                  setDepartment={setDepartment}
                  batch={batch}
                  setBatch={setBatch}
                  address={address}
                  setAddress={setAddress}
                  city={city}
                  setCity={setCity}
                  state={state}
                  setState={setState}
                  country={country}
                  setCountry={setCountry}
                  pincode={pincode}
                  setPincode={setPincode}
                  currentStatus={currentStatus}
                  setCurrentStatus={setCurrentStatus}
                  company={company}
                  setCompany={setCompany}
                  jobTitle={jobTitle}
                  setJobTitle={setJobTitle}
                  industry={industry}
                  setIndustry={setIndustry}
                  workLocation={workLocation}
                  setWorkLocation={setWorkLocation}
                  officialEmail={officialEmail}
                  setOfficialEmail={setOfficialEmail}
                  linkedinUrl={linkedinUrl}
                  setLinkedinUrl={setLinkedinUrl}
                  engagements={engagements}
                  setEngagements={setEngagements}
                  onBackToPassword={() => goTo(2)}
                  onComplete={completeRegistration}
                  setError={setError}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function DetailsScreens({
  screen,
  setScreen,
  submitting,
  name,
  setName,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  profilePhoto,
  setProfilePhoto,
  mobileNumber,
  setMobileNumber,

  registerNumber,
  setRegisterNumber,
  programme,
  setProgramme,
  department,
  setDepartment,
  batch,
  setBatch,

  address,
  setAddress,
  city,
  setCity,
  state,
  setState,
  country,
  setCountry,
  pincode,
  setPincode,
  currentStatus,
  setCurrentStatus,
  company,
  setCompany,
  jobTitle,
  setJobTitle,
  industry,
  setIndustry,
  workLocation,
  setWorkLocation,
  officialEmail,
  setOfficialEmail,
  linkedinUrl,
  setLinkedinUrl,
  engagements,
  setEngagements,
  onBackToPassword,
  onComplete,
  setError,
}) {
  const needsEmploymentDetails = ["Employed", "Self-Employed", "Entrepreneur"].includes(currentStatus);

  const next = () => {
    setError("");

    if (screen === 1) {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (!/^\d{10}$/.test(mobileNumber)) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }

      setScreen(2);
      return;
    }

    if (screen === 2) {
      if (
        !registerNumber.trim() ||
        !programme.trim() ||
        !department.trim() ||
        !batch.trim()
      ) {
        setError("Please fill in all required academic details.");
        return;
      }

      setScreen(3);
      return;
    }

    if (screen === 3) {
      setScreen(4);
      return;
    }


    if (screen === 3) {
      setScreen(4);
      return;
    }

    if (screen === 4) {
      if (!currentStatus) {
        setError("Please select your current status.");
        return;
      }
      if (needsEmploymentDetails && !company.trim()) {
        setError("Please enter your company / organization.");
        return;
      }
      if (needsEmploymentDetails && !jobTitle.trim()) {
        setError("Please enter your job title / designation.");
        return;
      }
      setScreen(5);
      return;
    }

    onComplete();
  };

  const back = () => {
    if (screen === 1) return onBackToPassword();
    setScreen(screen - 1);
  };

  return (
    <form className={styles["form"]} onSubmit={(e) => { e.preventDefault(); if (!submitting) next(); }}>
      {screen === 1 && (
        <FormSection title="Personal Information">
          <div className={`${styles["grid"]} ${styles["grid-cols-2"]}`}>
            <Field label="Full Name *" value={name} onChange={setName} placeholder="Enter your full name" autoComplete="name" />
            <Field label="Mobile Number *" value={mobileNumber} onChange={(v) => setMobileNumber(v.replace(/\D/g, "").slice(0, 10))} type="tel" placeholder="Enter your 10-digit mobile number" autoComplete="tel" />
            <Field label="Date of Birth" value={dateOfBirth} onChange={setDateOfBirth} type="date" />
            <Select label="Gender" value={gender} onChange={setGender} options={["Male", "Female", "Other", "Prefer not to say"]} />
          </div>
          <div className={styles["profile-photo-field"]}>
            <label>Profile Photo</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)} />
          </div>
        </FormSection>
      )}

      {screen === 2 && (
        <FormSection title="Academic Information">
          <div className={`${styles["grid"]} ${styles["grid-cols-2"]}`}>
            <Field
              label="Register Number *"
              value={registerNumber}
              onChange={setRegisterNumber}
              placeholder="Enter your register number"
            />

            <Field
              label="Programme *"
              value={programme}
              onChange={setProgramme}
              placeholder="Enter your programme"
            />

            <Field
              label="Department *"
              value={department}
              onChange={setDepartment}
              placeholder="Enter your department"
            />

            <Field
              label="Batch *"
              value={batch}
              onChange={setBatch}
              placeholder="Example: 2022-2026"
            />
          </div>
        </FormSection>
      )}

      {screen === 3 && (
        <FormSection title="Address">
          <div className={`${styles["grid"]} ${styles["grid-cols-2"]}`}>
            <div className={styles["col-span-2"]}><Field label="Address" value={address} onChange={setAddress} placeholder="Enter your address" /></div>
            <Field label="City" value={city} onChange={setCity} placeholder="Enter city" />
            <Field label="State" value={state} onChange={setState} placeholder="Enter state" />
            <Field label="Country" value={country} onChange={setCountry} placeholder="Enter country" />
            <Field label="Pincode" value={pincode} onChange={(v) => setPincode(v.replace(/\D/g, "").slice(0, 6))} placeholder="Enter pincode" inputMode="numeric" />
          </div>
        </FormSection>
      )}

      {screen === 4 && (
        <FormSection title="Professional Information">
          <div className={`${styles["grid"]} ${styles["grid-cols-2"]}`}>
            <Select label="Current Status *" value={currentStatus} onChange={setCurrentStatus} options={["Employed", "Self-Employed", "Entrepreneur", "Higher Studies", "Looking for Opportunities", "Student", "Other"]} />
            <Field label={"Company / Organization" + (needsEmploymentDetails ? " *" : "")} value={company} onChange={setCompany} placeholder="Enter company / organization" />
            <Field label={"Job Title / Designation" + (needsEmploymentDetails ? " *" : "")} value={jobTitle} onChange={setJobTitle} placeholder="Enter designation" />
            <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Enter industry" />
            <Field label="Work Location" value={workLocation} onChange={setWorkLocation} placeholder="Enter work location" />
            <Field label="Official Email" value={officialEmail} onChange={setOfficialEmail} type="email" placeholder="Enter official email" autoComplete="email" />
            <Field label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} type="url" placeholder="https://linkedin.com/in/yourname" />
          </div>
        </FormSection>
      )}

      {screen === 5 && (
        <FormSection title="Alumni Engagement">
          <p>Select the ways you would like to contribute to the alumni community.</p>
          <div className={`${styles["grid"]} ${styles["grid-cols-2"]}`}>
            {["Attend Alumni Events", "Mentor Current Students", "Provide Internship Opportunities", "Provide Job Opportunities", "Give Guest Lectures", "Support College Activities", "Make Donations"].map((item) => (
              <label key={item}>
                <input
                  type="checkbox"
                  checked={engagements.includes(item)}
                  onChange={() =>
                    setEngagements((current) =>
                      current.includes(item)
                        ? current.filter((value) => value !== item)
                        : [...current, item]
                    )
                  }
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </FormSection>
      )}

      <div className={styles["button-row"]}>
        <button type="button" className={`${styles["button"]} ${styles["secondary"]}`} onClick={back} disabled={submitting}>Back</button>
        <button className={styles["button"]} disabled={submitting}>
          {screen === 5 ? (submitting ? "Submitting…" : "Complete registration") : "Continue"}
        </button>
      </div>
    </form>
  );
}

function Benefit({ icon, title, text }) {
  return (
    <div className={styles["benefit"]}>
      <div className={styles["benefit-icon"]}>{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div className={styles["stepper"]} aria-label={`Step ${step} of 3`}>
      {steps.map((label, index) => {
        const number = index + 1;

        return (
          <div
            className={`${styles["step"]} ${step === number ? styles["active"] : ""} ${step > number ? styles["done"] : ""}`}
            key={label}
          >
            <div className={styles["step-circle"]}>
              {step > number ? "✓" : number}
            </div>
            <span className={styles["step-label"]}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", autoComplete, icon, inputMode }) {
  return (
    <div className={styles["field"]}>
      <label>{label}</label>
      <div className={`${styles["input-wrap"]} ${icon ? styles["has-icon"] : ""}`}>
        {icon && <span className={styles["input-icon"]}>{icon}</span>}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function FormSection({ title, children }) {
  const sectionClass = title === "Academic Information"
    ? `${styles["details-section"]} ${styles["academic-section"]}`
    : styles["details-section"];

  return (
    <section className={sectionClass}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className={styles["field"]}>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select {label.replace(" *", "").toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function EmailVerificationStep({
  email, setEmail, otp, setOtp, otpSent, onSendOtp, onVerifyOtp, onResend, onChangeEmail,
}) {
  const refs = useRef([]);

  const updateDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const next = otp.split("");
    next[index] = digit;
    setOtp(next.join("").slice(0, 6));
    if (index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = otp.split("");
      if (next[index]) next[index] = "";
      else if (index > 0) {
        next[index - 1] = "";
        refs.current[index - 1]?.focus();
      }
      setOtp(next.join(""));
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setOtp(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  if (!otpSent) {
    return (
      <form className={styles["form"]} onSubmit={onSendOtp}>
        <Field
          label="Email address"
          icon={<Mail size={18} strokeWidth={2} />}
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="Enter your email address"
          autoComplete="email"
        />
        <p>We'll send a verification code to this email.</p>
        <button className={styles["button"]}>Send OTP <span style={{ marginLeft: 10, fontSize: 18 }}>→</span></button>
        <div className={styles["secure"]}>🔒 We'll never share your email with anyone.</div>
      </form>
    );
  }

  return (
    <form className={styles["form"]} onSubmit={onVerifyOtp}>
      <div>
        <p className={styles["otp-title"]}>Verification code</p>
        <p className={styles["otp-hint"]}>We sent a 6-digit code to <b>{email}</b></p>
      </div>

      <div className={styles["otp-grid"]}>
        {Array.from({ length: 6 }, (_, index) => (
          <input
            key={index}
            ref={(element) => (refs.current[index] = element)}
            value={otp[index] || ""}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${index + 1}`}
            onChange={(e) => updateDigit(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>

      <div className={styles["links"]}>
        <button type="button" className={styles["link"]} onClick={onChangeEmail}>← Change email</button>
        <button type="button" className={styles["link"]} onClick={onResend}>Resend code</button>
      </div>
      <button className={styles["button"]}>Verify email →</button>
    </form>
  );
}

function PasswordStep({ password, setPassword, confirmPassword, setConfirmPassword, onSubmit, onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <form className={styles["form"]} onSubmit={onSubmit}>
      <div className={styles["field"]}>
        <label>New password</label>
        <div className={`${styles["input-wrap"]} ${styles["has-eye"]}`}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="Enter your password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className={styles["eye-btn"]}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={19} strokeWidth={2} /> : <Eye size={19} strokeWidth={2} />}
          </button>
        </div>
        {password && <span className={styles["hint"]}>Strength: {labels[Math.max(score, 1)]}</span>}
      </div>

      <div className={styles["field"]}>
        <label>Confirm password</label>
        <div className={`${styles["input-wrap"]} ${styles["has-eye"]}`}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className={styles["eye-btn"]}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={19} strokeWidth={2} /> : <Eye size={19} strokeWidth={2} />}
          </button>
        </div>
        {confirmPassword && (
          <span className={`${styles["hint"]} ${confirmPassword === password ? styles["ok"] : styles["bad"]}`}>
            {confirmPassword === password ? "✓ Passwords match" : "Passwords don't match yet"}
          </span>
        )}
      </div>

      <div className={styles["button-row"]}>
        <button type="button" className={`${styles["button"]} ${styles["secondary"]}`} onClick={onBack}>Back</button>
        <button className={styles["button"]}>Continue</button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Shown after submitting. Checks the server every 15 seconds until     */
/* the admin accepts or rejects the registration.                       */
/* ------------------------------------------------------------------ */
function RegistrationStatus({ submitted, status, reason, onReset }) {
  const { referenceId, firstName, email } = submitted;

  const greeting = firstName ? `, ${firstName}` : "";

  const view = {
    pending: {
      icon: <Clock size={28} strokeWidth={2.2} />,
      title: "Registration Pending",
      copy: `Thanks${greeting}. Your registration has been sent to the admin for review. We'll email you at ${email} once it's approved.`,
      pill: "Pending review",
    },
    accepted: {
      icon: <Check size={28} strokeWidth={2.6} />,
      title: "Registration Accepted",
      copy: `Welcome${greeting}! Your alumni registration has been approved. A confirmation email has been sent to ${email}.`,
      pill: "Accepted",
    },
    rejected: {
      icon: <X size={28} strokeWidth={2.6} />,
      title: "Registration Not Approved",
      copy: `Sorry${greeting}, the admin could not approve this registration.${reason ? ` Reason: ${reason}` : ""}`,
      pill: "Not approved",
    },
    missing: {
      icon: <X size={28} strokeWidth={2.6} />,
      title: "Registration Not Found",
      copy: "We couldn't find this registration. Please register again.",
      pill: "Not found",
    },
  }[status];

  return (
    <div className={styles["success-panel"]} aria-live="polite">
      <div className={`${styles["success-icon"]} ${styles[status]}`}>{view.icon}</div>

      <div>
        <h2 className={styles["success-title"]}>{view.title}</h2>
        <p className={styles["success-copy"]}>{view.copy}</p>
      </div>

      <div className={styles["reference"]}>
        <small>Registration reference ID</small>
        <strong>{referenceId}</strong>
      </div>

      <div className={styles["summary"]}>
        <div className={styles["summary-row"]}>
          <span>Status</span>
          <b className={`${styles["pill"]} ${status === "missing" ? styles["rejected"] : styles[status]}`}>{view.pill}</b>
        </div>
        <div className={styles["summary-row"]}>
          <span>Email</span>
          <span>{email}</span>
        </div>
      </div>

      {status === "pending" && (
        <p className={styles["status-note"]}>
          You'll get an email at {email} as soon as the admin reviews your registration.
        </p>
      )}

      <button className={status === "pending" ? `${styles["button"]} ${styles["secondary"]}` : styles["button"]} onClick={onReset}>
        Register another account
      </button>
    </div>
  );
}