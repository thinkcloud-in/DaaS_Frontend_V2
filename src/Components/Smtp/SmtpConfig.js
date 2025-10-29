import "./SmtpConfig.css";
import React, { useState, useContext, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Radio,
  RadioGroup,
  Switch,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";

import { toast } from "react-toastify";
import axiosInstance from "Services/AxiosInstane";
import { PoolContext } from "../../Context/PoolContext";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { getEnv } from "utils/getEnv";
import { Toast } from "bootstrap";
import {
  fetchSmtpConfig,
  updateSmtpStatus,
  saveSmtpConfig,
  sendSmtpTestMail,
} from "Services/SmtpService";

const SkeletonLoader = () => (
  <div className="w-[40%] h-[70vh] p-5 rounded-[15px] shadow-[0px_0px_5px_1px_rgba(55,37,221,0.16)]">
    <div className="mb-6">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="space-y-6">
      <div className="h-14 bg-gray-200 rounded animate-pulse" />

      {/* Server Port field */}
      <div className="h-14 bg-gray-200 rounded animate-pulse" />

      {/* Email field */}
      <div className="h-14 bg-gray-200 rounded animate-pulse" />

      {/* User Authentication checkbox */}
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />

      {/* Radio buttons */}
      <div className="space-y-2">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Footer buttons */}
      <div className="flex justify-between mt-5">
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export default function SMTP() {
  const [data, setData] = useState({
    serverIP: "",
    serverPort: "",
    userName: "",
    password: "",
    email: "",
    connOption: "",
    userAuthentication: "false",
    smtpStatus: false,
    receiverMail: "",
  });

  const [isEnabled, setIsEnabled] = useState(true);
  const [existingConfig, setExistingConfig] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendmail, setSendmail] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const pc = useContext(PoolContext);
  const token = pc.token;
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // useEffect(() => {
  //   if (isEnabled) {
  //     const fetchData = async () => {
  //       setLoading(true);
  //       try {
  //         let response = await axiosInstance.get(
  //           `${backendUrl}/v1/smtp/smtp-get`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`, 
  //             },
  //           }
  //         );

  //         if (response.data.data && response.data.data[0]) {
  //           setData({
  //             serverIP: response.data.data[0].serverIP,
  //             serverPort: response.data.data[0].serverPort,
  //             userName: response.data.data[0].userName,

  //             password: "",
  //             email: response.data.data[0].email,
  //             connOption: response.data.data[0].connOption,
  //             userAuthentication: response.data.data[0].userAuthentication,
  //             smtpStatus: response.data.data[0].smtpStatus,
  //             receiverMail: response.data.data[0].receiverMail,
  //           });

  //           setIsEnabled(response.data.data[0].smtpStatus); 
  //           setExistingConfig(true);
  //         } else {
  //           setExistingConfig(false);
  //         }
  //       } catch (error) {
         
  //         toast.error("Failed to fetch SMTP configuration.");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchData();
  //   }
  // }, [isEnabled, backendUrl, token]);

  useEffect(() => {
  if (isEnabled) {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response = await fetchSmtpConfig(token);
        if (response.data && response.data[0]) {
          setData({
            serverIP: response.data[0].serverIP,
            serverPort: response.data[0].serverPort,
            userName: response.data[0].userName,
            password: "",
            email: response.data[0].email,
            connOption: response.data[0].connOption,
            userAuthentication: response.data[0].userAuthentication,
            smtpStatus: response.data[0].smtpStatus,
            receiverMail: response.data[0].receiverMail,
          });
          setIsEnabled(response.data[0].smtpStatus);
          setExistingConfig(true);
        } else {
          setExistingConfig(false);
        }
      } catch (error) {
        toast.error("Failed to fetch SMTP configuration.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }
}, [isEnabled, token]);

  // const handleToggleChange = async (event) => {
  //   const check = event.target.checked;
  //   setIsEnabled(check);
  //   setData((prev) => ({ ...prev, smtpStatus: check }));
  //   if (!check) {
  //     setData({
  //       serverIP: "",
  //       serverPort: "",
  //       email: "",
  //       testEmail: "",
  //       connOption: "",
  //       userAuthentication: "false",
  //       userName: "",
  //       password: "",
  //       smtpStatus: false,
  //       receiverMail: "",
  //     });
  //     try {
  //       const updatedData = { ...data, smtpStatus: false };
  //       const response = await axiosInstance.patch(
  //         `${backendUrl}/v1/smtp/smtp-update-status`,
  //         updatedData,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       if (response.data.code === 200) {
  //         toast.warn(response.data.msg || "SMTP config disabled!");
  //       }
  //     } catch (error) {
  //      toast.error(error?.data?.msg || "Failed to disable SMTP config.");
  //     }
  //   } else {
  //     try {
  //       const updatedData = { ...data, smtpStatus: true };
  //       const response = await axiosInstance.patch(
  //         `${backendUrl}/v1/smtp/smtp-update-status`,
  //         updatedData,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       if (response.data.code === 200) {
  //         toast.success(response.data.msg || "SMTP config enabled!");
  //       } else {
  //         toast.error(response?.data?.msg || "Failed to enable SMTP config.");
  //       }
  //     } catch (error) {
  //       toast.error(error?.data?.msg || "Failed to enable SMTP config.");
  //     }
  //   }
  // };

const handleToggleChange = async (event) => {
  const check = event.target.checked;
  const updatedData = { ...data, smtpStatus: check };

  try {
    const response = await updateSmtpStatus(token, updatedData, check);
    if (response.code === 200) {
      setIsEnabled(check); // Immediately update UI toggle
      setData(updatedData);
      if (check) {
        toast.success(response.msg || "SMTP config enabled!");
      } else {
        toast.warn(response.msg || "SMTP config disabled!");
        setData({
          serverIP: "",
          serverPort: "",
          email: "",
          testEmail: "",
          connOption: "",
          userAuthentication: "false",
          userName: "",
          password: "",
          smtpStatus: false,
          receiverMail: "",
        });
      }
    } else {
      toast.error(response?.msg || "Failed to update SMTP config status.");
    }
  } catch (error) {
    toast.error("Failed to update SMTP config status.");
  }
};

  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    setData({
      ...data,
      userAuthentication: isChecked ? "true" : "false",
      userName: isChecked ? data.userName : "",
      password: isChecked ? data.password : "",
    });
  };

  const handleRadioChange = (event) => {
    let value = event.target.value;
    setData({ ...data, connOption: value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   setSaveLoading(true);
  //   const smtpData = {
  //     ...data,
  //     smtpStatus: isEnabled,
  //     userAuthentication: data.userAuthentication,
  //   };
  //   let email_valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   try {
  //     if (isEnabled) {
  //       if (!email_valid.test(data.email)) {

  //         toast.error("Please enter a valid email address.");
  //         setSaveLoading(false);
  //         return;
  //       }
  //       try {
  //         if (existingConfig) {
  //           const response = await axiosInstance.put(
  //             `${backendUrl}/v1/smtp/smtp-update`,
  //             smtpData,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );
  //           if (response.data.code === 200) {
  //             toast.success(response.data.msg);
              
  //           } else {
  //             toast.success("SMTP updated successfully");
  //           }
  //         } else {
  //           const response = await axiosInstance.post(
  //             `${backendUrl}/v1/smtp/smtp-post`,
  //             smtpData,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );
  //           if (response.data.code === 200) {
  //             toast.success(response.data.msg);
  //           } else {
  //             toast.success("SMTP added successfully");
  //           }
  //         }
  //       } catch (error) {
         
  //         toast.error(error.response?.data?.msg || "Failed to save SMTP configuration.");
  //       }
  //     }
  //   } catch (error) {
  //     toast.error("Something went wrong, please check");
     
  //   } finally {

  //     setSaveLoading(false);
  //   }
  // };


  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaveLoading(true);
  const smtpData = {
    ...data,
    smtpStatus: isEnabled,
    userAuthentication: data.userAuthentication,
  };
  let email_valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  try {
    if (isEnabled) {
      if (!email_valid.test(data.email)) {
        toast.error("Please enter a valid email address.");
        setSaveLoading(false);
        return;
      }
      const response = await saveSmtpConfig(token, smtpData, existingConfig);
      if (response.code === 200) {
        toast.success(response.msg);
      } else {
        toast.success(existingConfig ? "SMTP updated successfully" : "SMTP added successfully");
      }
    }
  } catch (error) {
    toast.error("Failed to save SMTP configuration.");
  } finally {
    setSaveLoading(false);
  }
};

  const handleTestEmail = async (e) => {
    setOpenDialog(true);
  };
  const closeDialog = async (e) => {
    setOpenDialog(false);
    setReceiverEmail("");
  };
  // const sendTestEmail = async (e) => {
  //   setSendmail(true);
  //   if (!receiverEmail) {
  //     toast.error("please enter receiver email address");
  //     setSendmail(false);
  //     return;
  //   }
  //   const testData = { ...data, receiverMail: receiverEmail };
  //   try {
  //     const response = await axiosInstance.post(
  //       `${backendUrl}/v1/smtp/smtp-test-mail`,
  //       testData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (response.data.code === 200) {
  //       toast.success(response.data.msg);
  //     } else {
  //       toast.error(response.data.msg || "Failed to send the test email.");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to send the test email.");
  //   } finally {
  //     setSendmail(false);
  //   }
  // };

  const sendTestEmail = async (e) => {
  setSendmail(true);
  if (!receiverEmail) {
    toast.error("please enter receiver email address");
    setSendmail(false);
    return;
  }
  const testData = { ...data, receiverMail: receiverEmail };
  try {
    const response = await sendSmtpTestMail(token, testData);
    if (response.code === 200) {
      toast.success(response.msg);
    } else {
      toast.error(response.msg || "Failed to send the test email.");
    }
  } catch (error) {
    toast.error("Failed to send the test email.");
  } finally {
    setSendmail(false);
  }
};

  const Goback = () => {
    navigate("/");
  };

  return (
    <div className="form-body-smtp">
      <div className="navbar">
        <div
          onClick={Goback}
          className="back-button bg-[#1a365dcc] text-[#f5f5f5] hover:bg-[#1a365d] hover:text-white px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <h3>SMTP Config</h3>
      </div>
      <div className="toggle">
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={isEnabled}
                onChange={handleToggleChange}
                name="enableForm"
              />
            }
            label={isEnabled ? "Disable SMTP Form" : "SMTP Config"}
          />
        </FormGroup>
      </div>
      <div className="smtp-body ">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="custom-scrollbar overflow-y-auto h-[70vh] px-4"
          >
            <TextField
              label="Server IP"
              variant="outlined"
              fullWidth
              margin="normal"
              name="serverIP"
              required
              disabled={!isEnabled}
              value={data.serverIP}
              onChange={(e) => setData({ ...data, serverIP: e.target.value })}
            />
            <TextField
              label="Server Port"
              variant="outlined"
              fullWidth
              margin="normal"
              name="serverPort"
              required
              disabled={!isEnabled}
              value={data.serverPort}
              onChange={(e) => setData({ ...data, serverPort: e.target.value })}
            />
            <TextField
              label="Email "
              variant="outlined"
              fullWidth
              type="email"
              margin="normal"
              name="email"
              required
              disabled={!isEnabled}
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.userAuthentication === "true"}
                    onChange={handleCheckboxChange}
                    name="userAuthentication"
                    disabled={!isEnabled}
                  />
                }
                label="User Authentication"
              />
            </FormGroup>

            {data.userAuthentication === "true" && (
              <div id="auth">
                <TextField
                  label="User Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="userName"
                  required
                  disabled={!isEnabled}
                  value={data.userName}
                  onChange={(e) =>
                    setData({ ...data, userName: e.target.value })
                  }
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="password"
                  required
                  disabled={!isEnabled}
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          style={{
                            background: "white", 
                            border: "none", 
                            cursor: "pointer",
                            paddingRight: "10px",
                            marginRight: "-8px", 
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          tabIndex={-1}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <FaEyeSlash
                              style={{ fontSize: "1.1rem", color: "#374151" }}
                            />
                          ) : (
                            <FaEye
                              style={{ fontSize: "1.1rem", color: "#374151" }}
                            />
                          )}
                        </button>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            )}

            <RadioGroup
              aria-label="options"
              name="controlled-radio-buttons-group"
              value={data.connOption}
              onChange={handleRadioChange}
            >
              <FormControlLabel
                value="SSL"
                control={<Radio />}
                disabled={!isEnabled}
                label="SSL"
              />
              <FormControlLabel
                value="TLS"
                control={<Radio />}
                disabled={!isEnabled}
                label="TLS"
              />
            </RadioGroup>
            <div className="footer">
              <Button

                className="submit_btn"
                type="submit"
                disabled={!isEnabled || saveLoading}
                variant="contained"
                startIcon={saveLoading ? <CircularProgress size={20} /> : null}

              >
                {saveLoading ? "Saving..." : "Save"}
              </Button>
              <Button
                className="test-email-btn"
                onClick={handleTestEmail}
                disabled={!isEnabled}
                variant="contained"
              >
                Test Email
              </Button>
            </div>
          </form>
        )}
      </div>

      <Dialog open={openDialog} onClose={closeDialog}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            label="Receiver Email"
            variant="outlined"
            fullWidth
            margin="normal"
            name="receiverEmail"
            type="email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDialog}
            style={{ backgroundColor: "#1a365dcc", color: "#f5f5f5" }}
          >
            Cancel
          </Button>
          <Button
            onClick={sendTestEmail}
            disabled={sendmail}
            startIcon={sendmail ? <CircularProgress size={20} /> : null}
            style={{ backgroundColor: "#1a365dcc", color: "#f5f5f5" }}
            variant="contained"
          >
            {sendmail ? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
