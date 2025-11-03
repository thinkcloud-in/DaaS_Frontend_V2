import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const ChangePassword = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      //   toast.error("Passwords do not match");
      return;
    } else {
      // Proceed with your password change logic
     
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-5 rounded-md shadow-sm">
      <h2 className="text-2xl font-bold mb-5">Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-600"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className={`mt-1 p-2 w-full border rounded-md ${
              formData.confirmPassword &&
              formData.newPassword !== formData.confirmPassword
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-600"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`mt-1 p-2 w-full border rounded-md ${
              formData.newPassword &&
              formData.newPassword !== formData.confirmPassword
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {formData.newPassword &&
            formData.newPassword !== formData.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                Passwords do not match
              </p>
            )}
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Reset password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
