import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import apiService, {
  type UpdateProfileData,
  type ChangePasswordData,
} from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import "./Profile.css";

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  console.log("Profile - user:", user);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile form state
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    name: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    console.log("Profile useEffect - user:", user);
    console.log("Profile useEffect - user.name:", user?.name);
    if (user) {
      const newProfileData = {
        name: user.name || "",
      };
      console.log("Setting profile data:", newProfileData);
      setProfileData(newProfileData);
    } else {
      console.log("No user data available");
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.updateProfile(profileData);
      updateUser(response.data.user);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordData.newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      toast.error(
        "New password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }

    setIsPasswordLoading(true);

    try {
      await apiService.changePassword(passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
      setConfirmPassword("");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to change password";
      toast.error(message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile Information
        </button>
        <button
          className={`tab-button ${activeTab === "password" ? "active" : ""}`}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "profile" && (
          <div className="profile-section">
            <form onSubmit={handleProfileSubmit} className="profile-form">
              <h3>Profile Information</h3>

              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ""}
                  className="form-input readonly"
                  placeholder="Enter your email"
                  readOnly
                />
                <p className="field-note">
                  Email cannot be changed. Contact support if you need to update
                  your email address.
                </p>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="small" color="white" inline />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="profile-section">
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <h3>Change Password</h3>

              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="form-input"
                  placeholder="Enter new password"
                  required
                />
                <div className="password-requirements">
                  <p>Password must contain:</p>
                  <ul>
                    <li
                      className={
                        passwordData.newPassword.length >= 6 ? "valid" : ""
                      }
                    >
                      At least 6 characters
                    </li>
                    <li
                      className={
                        /(?=.*[A-Z])/.test(passwordData.newPassword)
                          ? "valid"
                          : ""
                      }
                    >
                      One uppercase letter
                    </li>
                    <li
                      className={
                        /(?=.*[a-z])/.test(passwordData.newPassword)
                          ? "valid"
                          : ""
                      }
                    >
                      One lowercase letter
                    </li>
                    <li
                      className={
                        /(?=.*\d)/.test(passwordData.newPassword) ? "valid" : ""
                      }
                    >
                      One number
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`form-input ${
                    confirmPassword &&
                    passwordData.newPassword !== confirmPassword
                      ? "error"
                      : confirmPassword &&
                        passwordData.newPassword === confirmPassword
                      ? "success"
                      : ""
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                {confirmPassword &&
                  passwordData.newPassword !== confirmPassword && (
                    <span className="error-message">
                      Passwords do not match
                    </span>
                  )}
                {confirmPassword &&
                  passwordData.newPassword === confirmPassword &&
                  passwordData.newPassword.length > 0 && (
                    <span className="success-message">✓ Passwords match</span>
                  )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isPasswordLoading}
                  className="btn btn-primary"
                >
                  {isPasswordLoading ? (
                    <>
                      <LoadingSpinner size="small" color="white" inline />
                      <span>Changing...</span>
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
