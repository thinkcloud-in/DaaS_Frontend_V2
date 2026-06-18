import React, { useState, useRef } from "react";
import { XMarkIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const TotpVerifyModal = ({ onSuccess, onCancel, token, actionLabel = "this action" }) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const inputs = useRef([]);

    const handleChange = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[i] = val.slice(-1);
        setOtp(next);
        setError("");
        if (val && i < 5) inputs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) {
            inputs.current[i - 1]?.focus();
        }
        if (e.key === "Enter") handleVerify();
    };

    const handlePaste = (e) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!text) return;
        e.preventDefault();
        const next = Array(6).fill("").map((_, i) => text[i] || "");
        setOtp(next);
        inputs.current[Math.min(text.length - 1, 5)]?.focus();
    };

    const handleVerify = () => {
        const code = otp.join("");
        if (code.length < 6) {
            setError("Please enter all 6 digits.");
            return;
        }
        onSuccess(code);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]" onClick={onCancel} />
            <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 rounded-xl">
                                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">OTP Verification Required</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Your account has TOTP enabled</p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Info banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 mb-5">
                        <p className="text-xs text-amber-800 leading-relaxed">
                            To <span className="font-semibold">{actionLabel}</span>, please enter the 6-digit code from your authenticator app (Google Authenticator / Authy).
                        </p>
                    </div>

                    {/* OTP input boxes */}
                    <div className="flex gap-2 justify-center mb-1" onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputs.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                autoFocus={i === 0}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className={`w-11 h-12 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all select-none
                                    ${error
                                        ? "border-red-400 bg-red-50 text-red-700"
                                        : digit
                                            ? "border-blue-500 bg-blue-50 text-blue-800"
                                            : "border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-400 focus:bg-white"
                                    }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-center text-red-500 text-xs mt-2 mb-1">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={otp.join("").length < 6}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
                        >
                            Verify & Delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TotpVerifyModal;
