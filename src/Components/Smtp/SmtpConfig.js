import "./SmtpConfig.css";
import React, { useState, useContext, useEffect } from "react";
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
  selectSmtpTestMailResult,
} from '../../redux/features/SMTP/SmtpSelectors';
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';

const SkeletonLoader = () => (
  <div className="w-[40%] h-[70vh] p-5 rounded-[15px] shadow-[0px_0px_5px_1px_rgba(55,37,221,0.16)]">
    <div className="mb-6">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="space-y-6">
      <div className="h-14 bg-gray-200 rounded animate-pulse" />
      <div className="h-14 bg-gray-200 rounded animate-pulse" />
      <div className="h-14 bg-gray-200 rounded animate-pulse" />
      <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex justify-between mt-5">
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
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
  const testMailResult = useSelector(selectSmtpTestMailResult);

  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userEmail = tokenParsed?.preferred_username;

  
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
  const [sendmail, setSendmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      dispatch(fetchSmtpConfigThunk(token));
    }
  }, [dispatch, token, location.key]);

useEffect(() => {
  if (!loading && firstLoad) {
    if (smtpConfig) {
      setData({
        serverIP: smtpConfig.serverIP || "",
        serverPort: smtpConfig.serverPort || "",
        userName: smtpConfig.userName || "",
        password: "",
        email: smtpConfig.email || "",
        connOption: smtpConfig.connOption || "",
        userAuthentication: smtpConfig.userAuthentication || "false",
        smtpStatus: smtpConfig.smtpStatus || false,
        receiverMail: smtpConfig.receiverMail || "",
      });
      setIsEnabled(!!smtpConfig.smtpStatus);
      setExistingConfig(true);
    } else {
      setExistingConfig(false);
    }
    setFirstLoad(false);
  }
}, [smtpConfig, loading, firstLoad]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleToggleChange = (event) => {
    const check = event.target.checked;
    setIsEnabled(check);
    setData((prev) => ({ ...prev, smtpStatus: check }));
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
      })
      .finally(() => {
        setSendmail(false);
      });
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
                disabled={statusLoading}
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
            disabled={sendmail || testMailLoading}
            startIcon={sendmail || testMailLoading ? <CircularProgress size={20} /> : null}
            style={{ backgroundColor: "#1a365dcc", color: "#f5f5f5" }}
            variant="contained"
          >
            {sendmail || testMailLoading ? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}