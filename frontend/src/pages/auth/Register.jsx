import { useEffect, useRef, useState } from "react";
import { Mail, Eye, EyeOff, Clock, Check, X } from "lucide-react";
import styles from "./Register.module.css";
import { useLocation } from "react-router-dom";
import ThemeDropdown from "../../components/common/ThemeDropdown";

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

// Map one raw status value to "accepted" | "rejected" | "pending" (null if empty).
function mapUserStatus(raw) {
  const value = String(raw ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (!value) return null;
  if (["REJECTED", "REJECT", "DECLINED", "DENIED"].includes(value)) return "rejected";
  if (
    [
      "PENDING",
      "SUBMITTED",
      "UNDER_REVIEW",
      "IN_REVIEW",
      "AWAITING_APPROVAL",
      "WAITING",
      "INCOMPLETE",
      "UNVERIFIED",
      "NEW",
    ].includes(value)
  ) {
    return "pending";
  }
  // Anything else (APPROVED, ACCEPTED, ACTIVE, VERIFIED, ...) means the admin acted.
  return "accepted";
}

// Combine every status field the backend might use (user record + profile).
function resolveStatus(user, profile) {
  console.log("STATUS DEBUG:", {
    userStatus: user?.status,
    userApprovalStatus: user?.approvalStatus,
    userRegistrationStatus: user?.registrationStatus,
    userIsApproved: user?.isApproved,
    profileStatus: profile?.status,
    profileApprovalStatus: profile?.approvalStatus,
    profileRegistrationStatus: profile?.registrationStatus,
    profileIsApproved: profile?.isApproved,
  });

  if (user?.isApproved === true || profile?.isApproved === true) return "accepted";

  const values = [
    user?.approvalStatus,
    user?.registrationStatus,
    user?.status,
    profile?.approvalStatus,
    profile?.registrationStatus,
    profile?.status,
  ]
    .map(mapUserStatus)
    .filter(Boolean);

  if (values.includes("rejected")) return "rejected";
  if (values.includes("accepted")) return "accepted";
  return "pending";
}

// Load the saved alumni profile of an existing account (null if none yet).
async function fetchProfile(userEmail) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/alumni/get_profile?email=${encodeURIComponent(userEmail)}`
    );
    const data = await response.json().catch(() => ({}));

    console.log("GET PROFILE STATUS:", response.status);
    console.log("GET PROFILE RESPONSE:", data);

    if (!response.ok) return null;
    return data.alumni || data.profile || data.data?.alumni || data.data?.profile || null;
  } catch (err) {
    console.error("Fetch profile error:", err);
    return null;
  }
}

const draftKey = (userEmail) =>
  `alumniDraft:${String(userEmail).trim().toLowerCase()}`;

function readDraft(userEmail) {
  try {
    return JSON.parse(localStorage.getItem(draftKey(userEmail)));
  } catch {
    return null;
  }
}

function clearDraft(userEmail) {
  try {
    if (userEmail) localStorage.removeItem(draftKey(userEmail));
  } catch {
    /* ignore */
  }
}

// Drop empty values so a blank draft field never overwrites saved data.
function nonEmpty(object) {
  return Object.fromEntries(
    Object.entries(object || {}).filter(
      ([, value]) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
    )
  );
}

// Convert a backend alumni profile to the form field names.
function profileToForm(profile) {
  if (!profile) return {};

  return {
    name: profile.fullName || profile.name || "",
    dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).split("T")[0] : "",
    gender: profile.gender || "",
    mobileNumber: profile.mobileNumber || profile.mobile || "",
    registerNumber: profile.registerNumber || "",
    programme: profile.programme || "",
    department: profile.department || "",
    batch: profile.batch || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    country: profile.country || "",
    pincode: profile.pincode || "",
    currentStatus: profile.currentStatus || "",
    company: profile.company || "",
    jobTitle: profile.jobTitle || profile.designation || "",
    industry: profile.industry || "",
    workLocation: profile.workLocation || "",
    officialEmail: profile.officialEmail || "",
    linkedinUrl: profile.linkedinUrl || profile.linkedInUrl || "",
    engagements: Array.isArray(profile.alumniEngagement) ? profile.alumniEngagement : [],
  };
}

// A profile counts as "submitted" when the core required fields exist.
function hasCoreProfile(profile) {
  if (!profile) return false;
  const f = profileToForm(profile);
  return !!(f.name && f.mobileNumber && f.programme && f.department && f.batch);
}

function firstIncompleteScreen(form) {
  // SCREEN 1 — Personal
  // Required: Name + Mobile
  if (!form.name || !form.mobileNumber) {
    return 1;
  }

  // SCREEN 2 — Academic
  // Required: Programme + Department + Batch
  if (!form.programme || !form.department || !form.batch) {
    return 2;
  }

  /*
   * SCREEN 3 — Address
   *
   * Address is OPTIONAL.
   * Therefore we DO NOT return 3 here.
   *
   * A returning user can skip Address and continue
   * directly to Professional Information.
   */

  // SCREEN 4 — Professional
  // Required: Current Status
  if (!form.currentStatus) {
    return 4;
  }

  const needsEmploymentDetails = [
    "Employed",
    "Self-Employed",
    "Entrepreneur",
  ].includes(form.currentStatus);

  // Company + Job Title are required only for employment statuses
  if (needsEmploymentDetails && (!form.company || !form.jobTitle)) {
    return 4;
  }

  // SCREEN 5 — Alumni Engagement
  return 5;
}

export default function Register() {
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  // { referenceId, firstName, email, status, reason } | null
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  const registrationStatus = submitted?.status || "pending";
  const statusReason = submitted?.reason || ""; // rejection reason from the admin, if any

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [existingUser, setExistingUser] = useState(null);
  const [continueRegistration, setContinueRegistration] = useState(false);
  const [resumeMode, setResumeMode] = useState(false);

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

  // Autosave the Details form (except the photo) while the user fills it in.
  useEffect(() => {
    if (step !== 3 || !email || submitted) return;

    const draft = {
      detailsScreen,
      name, dateOfBirth, gender, mobileNumber,
      registerNumber, programme, department, batch,
      address, city, state, country, pincode,
      currentStatus, company, jobTitle, industry,
      workLocation, officialEmail, linkedinUrl,
      engagements,
    };

    try {
      localStorage.setItem(draftKey(email), JSON.stringify(draft));
    } catch {
      /* storage full / blocked - ignore */
    }
  }, [
    step, email, submitted, detailsScreen,
    name, dateOfBirth, gender, mobileNumber,
    registerNumber, programme, department, batch,
    address, city, state, country, pincode,
    currentStatus, company, jobTitle, industry,
    workLocation, officialEmail, linkedinUrl,
    engagements,
  ]);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const goTo = (nextStep) => {
    clearMessages();

    // Existing incomplete users are locked to Details.
    if (resumeMode && nextStep !== 3) {
      return;
    }

    setStep(nextStep);
  };

  const resumeRegistration = async (user) => {
    const userEmail = String(user.email).trim().toLowerCase();

    // This registration is incomplete: drop any stale "submitted" record.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }

    clearMessages();

    setEmail(userEmail);
    setOtp("");
    setOtpSent(false);

    // Lock this user to Details only.
    setResumeMode(true);

    // Get saved server profile + browser draft
    const profile = await fetchProfile(userEmail);
    const draft = readDraft(userEmail);

    /*
     * Combine:
     * 1. Server profile
     * 2. Local browser draft
     *
     * Draft values take priority because they may contain
     * information entered after the last server save.
     */
    const form = {
      ...profileToForm(profile),
      ...nonEmpty(draft),
    };

    // Restore Personal
    setName(form.name || "");
    setDateOfBirth(form.dateOfBirth || "");
    setGender(form.gender || "");
    setMobileNumber(form.mobileNumber || "");

    // Restore Academic
    setRegisterNumber(form.registerNumber || "");
    setProgramme(form.programme || "");
    setDepartment(form.department || "");
    setBatch(form.batch || "");

    // Restore Address
    setAddress(form.address || "");
    setCity(form.city || "");
    setState(form.state || "");
    setCountry(form.country || "");
    setPincode(form.pincode || "");

    // Restore Professional
    setCurrentStatus(form.currentStatus || "");
    setCompany(form.company || "");
    setJobTitle(form.jobTitle || "");
    setIndustry(form.industry || "");
    setWorkLocation(form.workLocation || "");
    setOfficialEmail(form.officialEmail || "");
    setLinkedinUrl(form.linkedinUrl || "");

    // Restore Engagement
    setEngagements(Array.isArray(form.engagements) ? form.engagements : []);

    /*
     * Find the first incomplete Details section.
     */
    const nextScreen = firstIncompleteScreen(form);

    setDetailsScreen(nextScreen);

    // Existing incomplete user goes directly to Details.
    setStep(3);

    setMessage(
      `Welcome back! Continue your registration from ${nextScreen === 1
        ? "Personal Information"
        : nextScreen === 2
          ? "Academic Information"
          : nextScreen === 3
            ? "Address"
            : nextScreen === 4
              ? "Professional Information"
              : "Alumni Engagement"
      }.`
    );
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    // FIXED EMAIL VALIDATION
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setEmail(normalizedEmail);

    try {
      setChecking(true);

      const response = await fetch(
        `${API_BASE_URL}/api/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      console.log("SEND OTP STATUS:", response.status);
      console.log("SEND OTP RESPONSE:", data);

      // =====================================================
      // 1. APPROVED USER
      // Backend:
      // {
      //   message: "Email already exists. Please Login.",
      //   existUser: true
      // }
      // =====================================================

      if (
        data.existUser === true &&
        String(data.message || "")
          .toUpperCase()
          .includes("PLEASE LOGIN")
      ) {
        const profile = await fetchProfile(normalizedEmail);

        setExistingUser(null);
        setContinueRegistration(false);
        setResumeMode(false);

        setSubmitted({
          referenceId:
            profile?._id ||
            profile?.id ||
            "—",

          firstName:
            String(
              profile?.fullName ||
              profile?.name ||
              ""
            )
              .trim()
              .split(" ")[0],

          email: normalizedEmail,

          status: "accepted",

          reason: "",
        });

        return;
      }

      // =====================================================
      // 2. REJECTED USER
      //
      // Backend sends:
      // {
      //   message: "Your registration has been rejected.",
      //   existUser: true,
      //   reason: existingUser.rejectReason
      // }
      // =====================================================

      if (
        data.existUser === true &&
        String(data.message || "")
          .toUpperCase()
          .includes("REJECTED")
      ) {
        const profile = await fetchProfile(normalizedEmail);

        setExistingUser(null);
        setContinueRegistration(false);
        setResumeMode(false);

        setSubmitted({
          referenceId:
            profile?._id ||
            profile?.id ||
            "—",

          firstName:
            String(
              profile?.fullName ||
              profile?.name ||
              ""
            )
              .trim()
              .split(" ")[0],

          email: normalizedEmail,

          status: "rejected",

          // IMPORTANT:
          // Get rejection reason DIRECTLY from backend
          reason:
            data.reason ||
            "No rejection reason was provided.",
        });

        return;
      }

      // =====================================================
      // 3. PENDING USER / NEW USER
      //
      // Your backend allows PENDING users to send OTP.
      // Therefore both pending users and new users reach
      // this section.
      // =====================================================

      if (!response.ok) {
        setError(
          data.message || "Failed to send OTP."
        );
        return;
      }

      setExistingUser(null);
      setContinueRegistration(false);
      setResumeMode(false);

      setOtp("");
      setOtpSent(true);

      setMessage(
        data.message || "OTP sent successfully."
      );

    } catch (err) {
      console.error("SEND OTP ERROR:", err);

      setError(
        err.message ||
        "Unable to connect to the server."
      );
    } finally {
      setChecking(false);
    }
  };

  const resendOtp = async () => {
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setChecking(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => ({}));

      console.log("RESEND OTP RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP.");
      }

      setOtp("");
      setOtpSent(true);
      setMessage(data.message || "A new OTP has been sent to your email.");
    } catch (err) {
      console.error("RESEND OTP ERROR:", err);
      setError(err.message || "Unable to resend OTP.");
    } finally {
      setChecking(false);
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
      setChecking(true);

      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            otp: otp,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      console.log("VERIFY OTP STATUS:", response.status);
      console.log("VERIFY OTP RESPONSE:", data);

      // =====================================================
      // CHECK FOR EXISTING REGISTRATION PROGRESS
      // =====================================================


      const profile = await fetchProfile(normalizedEmail);
      const draft = readDraft(normalizedEmail);

      console.log("RESUME CHECK:", {
        profile,
        draft,
      });

      if (profile || draft) {
        console.log(
          "Existing registration progress found. Resuming registration."
        );

        await resumeRegistration({
          email: normalizedEmail,
        });

        return;
      }

      // =====================================================
      // GENUINELY NEW USER
      // =====================================================

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }

      setResumeMode(false);
      setContinueRegistration(false);
      setExistingUser(null);

      setMessage("Email verified successfully.");

      setStep(2);

    } catch (err) {
      console.error("VERIFY OTP ERROR:", err);

      setError(
        err.message ||
        "OTP verification failed."
      );
    } finally {
      setChecking(false);
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

      formData.append("currentStatus", currentStatus);
      formData.append("alumniEngagement", JSON.stringify(engagements));

      formData.append("company", company);
      formData.append("designation", jobTitle);
      formData.append("industry", industry);
      formData.append("workLocation", workLocation);
      formData.append("officialEmail", officialEmail);
      formData.append("linkedInUrl", linkedinUrl);

      if (profilePhoto) {
        formData.append("profilePic", profilePhoto);
      }

      const response = await fetch(`${API_BASE_URL}/api/alumni/complete-profile`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete your profile.");
      }

      setMessage("Registration completed successfully!");
      clearDraft(email);

      const saved = {
        referenceId: data.profile?._id || `AL-${Date.now()}`,
        firstName: name.trim().split(" ")[0],
        email,
        status: "pending",
        reason: "",
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setSubmitted(saved);
    } catch (err) {
      console.error("Profile submission error:", err);
      setError(
        err.message || "Could not complete your registration. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const continuePassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError(
        "Password must contain 8 characters, one capital letter, and one special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      console.log("SET PASSWORD RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to set password.");
      }

      setResumeMode(false);
      setContinueRegistration(false);
      setExistingUser(null);

      setMessage("Account created successfully. Complete your profile.");

      setDetailsScreen(1);
      setStep(3);
    } catch (err) {
      console.error("SET PASSWORD ERROR:", err);
      setError(err.message || "Unable to create your account.");
    }
  };

  const reset = () => {
    clearDraft(email);
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
    setRegisterNumber("");
    setProgramme("");
    setDepartment("");
    setBatch("");
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
    setExistingUser(null);
    setContinueRegistration(false);
    setResumeMode(false);
  };

  useEffect(() => {
    if (location.state && location.state.username !== undefined) {
      setEmail(location.state.username);
    }
  }, [location.state]);

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
              onClick={() => (window.location.href = "/login")}
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

              {!resumeMode && <Stepper step={step} />}
              {message && <div className={`${styles["alert"]} ${styles["success"]}`}>{message}</div>}
              {error && <div className={`${styles["alert"]} ${styles["error"]}`}>{error}</div>}

              {step === 1 && (
                <EmailVerificationStep
                  email={email}
                  setEmail={setEmail}
                  otp={otp}
                  setOtp={setOtp}
                  otpSent={otpSent}
                  loading={checking}
                  continueRegistration={continueRegistration}
                  setExistingUser={setExistingUser}
                  setContinueRegistration={setContinueRegistration}
                  clearMessages={clearMessages}
                  onSendOtp={sendOtp}
                  onVerifyOtp={verifyOtp}
                  onResend={resendOtp}
                />
              )}

              {step === 2 && (
                <PasswordStep
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  onSubmit={continuePassword}
                  onBack={() => {
                    if (!resumeMode) {
                      goTo(1);
                    }
                  }}
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
                  resumeMode={resumeMode}
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
  resumeMode,
}) {
  const needsEmploymentDetails = ["Employed", "Self-Employed", "Entrepreneur"].includes(currentStatus);

  const next = () => {
    setError("");

    // SCREEN 1 — Personal
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

    // SCREEN 2 — Academic
    if (screen === 2) {
      if (!programme.trim() || !department.trim() || !batch.trim()) {
        setError("Please fill in all required academic details.");
        return;
      }

      setScreen(3);
      return;
    }

    // SCREEN 3 — Address (optional)
    if (screen === 3) {
      setScreen(4);
      return;
    }

    // SCREEN 4 — Professional
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

    // SCREEN 5 — Engagement
    onComplete();
  };

  const back = () => {
    /*
     * Resumed users are NOT allowed to return to
     * Password or Email/OTP.
     */
    if (screen === 1) {
      if (resumeMode) {
        return;
      }

      return onBackToPassword();
    }

    // Normal Details navigation
    setScreen(screen - 1);
  };

  return (
    <form
      className={styles["form"]}
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitting) next();
      }}
    >
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
              label="Register Number "
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
      <label>
        {label.replace(" *", "")}
        {label.includes(" *") && (
          <span className={styles["required-star"]}> *</span>
        )}
      </label>
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
      <ThemeDropdown
        value={value}
        options={options}
        onChange={onChange}
        placeholder={`Select ${label.replace(" *", "").toLowerCase()}`}
      />
    </div>
  );
}

function EmailVerificationStep({
  email,
  setEmail,
  otp,
  setOtp,
  otpSent,
  loading,
  continueRegistration,
  setExistingUser,
  setContinueRegistration,
  clearMessages,
  onSendOtp,
  onVerifyOtp,
  onResend,
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
      <form
        className={`${styles["form"]} ${styles["email-form"]}`}
        onSubmit={onSendOtp}
      >
        <Field
          label="Email address"
          icon={<Mail size={18} strokeWidth={2} />}
          value={email}
          onChange={(value) => {
            setEmail(value);
            setExistingUser(null);
            setContinueRegistration(false);
            clearMessages();
          }}
          type="email"
          placeholder="Enter your email address"
          autoComplete="email"
        />
        <p>We'll send a verification code to this email.</p>
        <button className={styles["button"]} disabled={loading}>
          {loading
            ? "Checking…"
            : continueRegistration
              ? "Continue Registration"
              : "Send OTP"}

          {!loading && (
            <span style={{ marginLeft: 10, fontSize: 18 }}>→</span>
          )}
        </button>
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
        <button type="button" className={styles["link"]} onClick={onResend}>
          Resend code
        </button>
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
/* Shown after submitting (or when an existing user comes back).        */
/* The status comes from the backend user record: PENDING / accepted /  */
/* rejected.                                                            */
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
      copy: `Sorry${greeting}, the admin could not approve this registration.`,
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

        {/* STATUS */}
        <div className={styles["summary-row"]}>
          <span>Status</span>

          <b
            className={`${styles["pill"]} ${status === "missing"
              ? styles["rejected"]
              : styles[status]
              }`}
          >
            {view.pill}
          </b>
        </div>

        {/* EMAIL */}
        <div className={styles["summary-row"]}>
          <span>Email</span>
          <span>{email}</span>
        </div>

        {/* REJECTION REASON */}
        {status === "rejected" && (
          <div className={styles["summary-row"]}>
            <span>Reason</span>

            <span>
              {reason || "No rejection reason was provided."}
            </span>
          </div>
        )}

      </div>

      {status === "pending" && (
        <p className={styles["status-note"]}>
          You'll get an email at {email} as soon as the admin reviews your registration.
        </p>
      )}

      {status === "accepted" && (
        <button
          className={styles["button"]}
          type="button"
          onClick={() => {
            window.location.href = "/login";
          }}
        >
          Continue with Login →
        </button>
      )}
    </div>
  );
}