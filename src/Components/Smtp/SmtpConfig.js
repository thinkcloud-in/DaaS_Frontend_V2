import "./SmtpConfig.css";
import React, { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
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
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSmtpConfigThunk,
  saveSmtpConfigThunk,
  updateSmtpStatusThunk,
  sendSmtpTestMailThunk,
} from '../../redux/features/SMTP/SmtpThunks';
import {
  selectSmtpConfig,
  selectSmtpLoading,
  selectSmtpError,
  selectSmtpSaveLoading,
  selectSmtpStatusLoading,
  selectSmtpTestMailLoading,
} from '../../redux/features/SMTP/SmtpSelectors';
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';

const SkeletonLoader = () => (
  <div className="w-full max-w-lg mx-auto p-5 rounded-xl border border-gray-100 shadow-sm bg-white">
    <div className="mb-6">
      <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
    </div>
    <div className="space-y-6">
      <div className="h-14 bg-gray-50 rounded animate-pulse" />
      <div className="h-14 bg-gray-50 rounded animate-pulse" />
      <div className="h-14 bg-gray-50 rounded animate-pulse" />
      <div className="h-6 w-40 bg-gray-50 rounded animate-pulse" />
      <div className="space-y-4">
        <div className="h-6 w-24 bg-gray-50 rounded animate-pulse" />
        <div className="h-6 w-24 bg-gray-50 rounded animate-pulse" />
      </div>
      <div className="flex justify-between mt-8">
        <div className="h-10 w-28 bg-gray-50 rounded animate-pulse" />
        <div className="h-10 w-28 bg-gray-50 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export default function SMTP() {
  const dispatch = useDispatch();
  const smtpConfig = useSelector(selectSmtpConfig);
  const loading = useSelector(selectSmtpLoading);
  const error = useSelector(selectSmtpError);
  const saveLoading = useSelector(selectSmtpSaveLoading);
  const statusLoading = useSelector(selectSmtpStatusLoading);
  const testMailLoading = useSelector(selectSmtpTestMailLoading);

  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);

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
  const [isEnabled, setIsEnabled] = useState(false);
  const [existingConfig, setExistingConfig] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [sendmail, setSendmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      dispatch(fetchSmtpConfigThunk(token));
    }
  }, [dispatch, token, location.key]);

  useEffect(() => {
    if (!loading && smtpConfig) {
      setData((prev) => ({
        serverIP: smtpConfig.serverIP || "",
        serverPort: smtpConfig.serverPort || "",
        userName: smtpConfig.userName || "",
        password: prev.password || "",
        email: smtpConfig.email || "",
        connOption: smtpConfig.connOption || "",
        userAuthentication: smtpConfig.userAuthentication || "false",
        smtpStatus: smtpConfig.smtpStatus || false,
        receiverMail: smtpConfig.receiverMail || "",
      }));
      setIsEnabled(!!smtpConfig.smtpStatus);
      setExistingConfig(true);
    } else if (!loading && !smtpConfig) {
      setExistingConfig(false);
    }
  }, [smtpConfig, loading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleToggleChange = (event) => {
    const check = event.target.checked;
    setIsEnabled(check);
    setData((prev) => ({ ...prev, smtpStatus: check }));
    if (existingConfig) {
      dispatch(updateSmtpStatusThunk({ token, data: { ...data, smtpStatus: check }, status: check }))
        .unwrap()
        .then((res) => {
          if (check) {
            toast.success(res.msg || "SMTP config enabled!");
          } else {
            toast.warn(res.msg || "SMTP config disabled!");
          }
        })
        .catch((err) => {
          toast.error(err || "Failed to update SMTP config status.");
        });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    let email_valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isEnabled && !email_valid.test(data.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    dispatch(saveSmtpConfigThunk({ token, data: { ...data, smtpStatus: isEnabled }, existingConfig }))
      .unwrap()
      .then((res) => {
        if (res.code === 200) {
          toast.success(res.msg);
        } else {
          toast.success(existingConfig ? "SMTP updated successfully" : "SMTP added successfully");
        }
      })
      .catch(() => {
        toast.error("Failed to save SMTP configuration.");
      });
  };

  const handleTestEmail = () => {
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setReceiverEmail("");
  };

  const sendTestEmail = () => {
    setSendmail(true);
    if (!receiverEmail) {
      toast.error("please enter receiver email address");
      setSendmail(false);
      return;
    }
    dispatch(sendSmtpTestMailThunk({ token, data: { ...data, receiverMail: receiverEmail } }))
      .unwrap()
      .then((res) => {
        if (res.code === 200) {
          toast.success(res.msg);
        }
      })
      .catch((err) => {
        const message = typeof err === 'string' ? err : (err?.msg || err?.message || "Failed to send test email.");
        toast.error(message);
      })
      .finally(() => {
        setSendmail(false);
      });
  };

  const Goback = () => {
    navigate(-1);
  };

  return (
    <div className="p-2 md:p-4 h-full flex flex-col overflow-hidden">
      <div className="w-full md:w-[98%] h-[85vh] md:h-[90vh] flex-1 mx-auto bg-white rounded-lg p-2 md:p-4 shadow-md flex flex-col overflow-hidden mt-4">
        <div className="flex items-center gap-4 mb-6 border-b pb-4 px-2">
          <div
            onClick={Goback}
            className="bg-[#1a365dcc] text-[#f5f5f5] hover:bg-[#1a365d] hover:text-white px-2 py-2 rounded-md focus:outline-none transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1a365d]">SMTP Config</h2>
        </div>

        <div className="px-2 mb-4">
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={isEnabled}
                  onChange={handleToggleChange}
                  name="enableForm"
                  disabled={statusLoading}
                  color="primary"
                />
              }
              label={<span className="font-medium text-gray-700">{isEnabled ? "Disable Form" : "Enable SMTP"}</span>}
            />
          </FormGroup>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar px-2">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto pb-8">
              <div className="space-y-2">
                <TextField
                  label="Server IP / Hostname"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="serverIP"
                  required
                  disabled={!isEnabled}
                  value={isEnabled ? data.serverIP : ""}
                  onChange={(e) => setData({ ...data, serverIP: e.target.value })}
                  size="small"
                />
                <TextField
                  label="Server Port"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="serverPort"
                  required
                  disabled={!isEnabled}
                  value={isEnabled ? data.serverPort : ""}
                  onChange={(e) => setData({ ...data, serverPort: e.target.value })}
                  size="small"
                />
                <TextField
                  label="Sender Email"
                  variant="outlined"
                  fullWidth
                  type="email"
                  margin="normal"
                  name="email"
                  required
                  disabled={!isEnabled}
                  value={isEnabled ? data.email : ""}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  size="small"
                />

                <FormGroup className="mt-4">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isEnabled && data.userAuthentication === "true"}
                        onChange={handleCheckboxChange}
                        name="userAuthentication"
                        disabled={!isEnabled}
                        color="primary"
                      />
                    }
                    label={<span className="text-sm text-gray-700">User Authentication</span>}
                  />
                </FormGroup>

                {data.userAuthentication === "true" && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-2 mb-4 space-y-2">
                    <TextField
                      label="User Name"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      name="userName"
                      required
                      disabled={!isEnabled}
                      value={isEnabled ? data.userName : ""}
                      onChange={(e) => setData({ ...data, userName: e.target.value })}
                      size="small"
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
                      value={isEnabled ? data.password : ""}
                      onChange={(e) => setData({ ...data, password: e.target.value })}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              tabIndex={-1}
                            >
                              {showPassword ? <FaEyeSlash color="#6b7280" /> : <FaEye color="#6b7280" />}
                            </button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                )}

                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-700 block mb-2">Connection Encryption</span>
                  <RadioGroup
                    row
                    name="connOption"
                    value={isEnabled ? data.connOption : ""}
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel
                      value="SSL"
                      control={<Radio color="primary" />}
                      disabled={!isEnabled}
                      label="SSL"
                    />
                    <FormControlLabel
                      value="TLS"
                      control={<Radio color="primary" />}
                      disabled={!isEnabled}
                      label="TLS"
                    />
                  </RadioGroup>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  fullWidth
                  type="submit"
                  disabled={!isEnabled || saveLoading}
                  variant="contained"
                  style={{ backgroundColor: isEnabled && !saveLoading ? "#1a365d" : "#e5e7eb", color: "#fff" }}
                  startIcon={saveLoading ? <CircularProgress size={16} color="inherit" /> : null}
                  className="py-2.5 normal-case font-bold"
                >
                  {saveLoading ? "Saving..." : "Save Config"}
                </Button>
                <Button
                  fullWidth
                  onClick={handleTestEmail}
                  disabled={!isEnabled}
                  variant="outlined"
                  style={{ borderColor: "#1a365d", color: "#1a365d" }}
                  className="py-2.5 normal-case font-bold"
                >
                  Test Email
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle className="font-bold text-[#1a365d]">Send Test Email</DialogTitle>
        <DialogContent>
          <TextField
            label="Receiver Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            name="receiverEmail"
            type="email"
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions className="px-6 pb-6 pt-2">
          <Button onClick={closeDialog} className="text-gray-500 font-bold normal-case">
            Cancel
          </Button>
          <Button
            onClick={sendTestEmail}
            disabled={sendmail || testMailLoading}
            startIcon={sendmail || testMailLoading ? <CircularProgress size={16} color="inherit" /> : null}
            variant="contained"
            style={{ backgroundColor: "#1a365d" }}
            className="px-6 normal-case font-bold"
          >
            {sendmail || testMailLoading ? "Sending..." : "Send Test"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}